import pandas as pd
import numpy as np
from datetime import datetime
import io
import os
import glob
from database import SessionLocal, Base, engine
from models import Cita
from services.db_importer import DBImporter

class DataProcessor:
    def __init__(self):
        self.current_df = None
        self.dataset_metadata = {
            "file_name": "No hay insumo cargado",
            "upload_time": None,
            "total_records": 0
        }
        self.init_db()
        self.auto_load_initial_file()

    def init_db(self):
        try:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            citas_count = db.query(Cita).count()
            db.close()
            print(f"[DataProcessor] Base de datos conectada. Citas en BD: {citas_count}")
        except Exception as e:
            print(f"[DataProcessor] Inicialización DB: {e}")

    def auto_load_initial_file(self):
        db = SessionLocal()
        try:
            citas_count = db.query(Cita).count()
            if citas_count > 0:
                print(f"[DataProcessor] BD con {citas_count} registros. Omitiendo recarga de archivo inicial.")
                self.dataset_metadata = {
                    "file_name": "Base de Datos PostgreSQL (Persistente)",
                    "upload_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "total_records": citas_count
                }
                db.close()
                return
        except Exception as e:
            print(f"[DataProcessor] Error consultando conteo BD: {e}")
        finally:
            db.close()

        possible_paths = [
            "/app/reporte001_2026-07-01_2026-07-26_0.csv",
            "/home/juanstiven/Documentos/esenorte3/report-replace-pbi/reporte001_2026-07-01_2026-07-26_0.csv",
            "/home/juanstiven/Descargas/reporte001_2026-07-01_2026-07-26_0.csv",
            "/app/data/reporte001_2026-07-01_2026-07-26_0.csv"
        ]
        
        target_path = None
        for path in possible_paths:
            if os.path.exists(path):
                target_path = path
                break
                
        if not target_path:
            matches = glob.glob("/app/reporte001*.csv") + glob.glob("/home/juanstiven/Documentos/esenorte3/report-replace-pbi/reporte001*.csv")
            if matches:
                target_path = matches[0]

        if target_path and os.path.exists(target_path):
            try:
                with open(target_path, 'rb') as f:
                    content = f.read()
                self.process_file(content, os.path.basename(target_path))
                print(f"[DataProcessor] Insumo pre-cargado e importado a PostgreSQL desde {target_path}")
            except Exception as e:
                print(f"[DataProcessor] No se pudo pre-cargar {target_path}: {e}")

    def process_file(self, file_bytes: bytes, filename: str) -> dict:
        try:
            if filename.endswith('.csv'):
                try:
                    df = pd.read_csv(io.BytesIO(file_bytes), sep='\t', encoding='utf-8', low_memory=False)
                except Exception:
                    try:
                        df = pd.read_csv(io.BytesIO(file_bytes), sep=None, engine='python', encoding='utf-8')
                    except Exception:
                        df = pd.read_csv(io.BytesIO(file_bytes), sep=',', encoding='latin1', low_memory=False)
            else:
                df = pd.read_excel(io.BytesIO(file_bytes))

            clean_df = self.normalize_dataframe(df)

            # Guardar/Persistir en PostgreSQL usando UPSERT por agendacita_id
            db = SessionLocal()
            import_result = DBImporter.import_dataframe(clean_df, db)
            db.close()

            # Refrescar desde la base de datos PostgreSQL para acumular todos los insumos cargados
            self.current_df = None
            accumulated_df = self.get_dataframe()
            total_citas_count = len(accumulated_df)

            self.dataset_metadata = {
                "file_name": f"PostgreSQL Acumulado ({filename})",
                "upload_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_records": total_citas_count
            }
            return {
                "success": True,
                "metadata": self.dataset_metadata,
                "columns_found": list(clean_df.columns),
                "db_import": import_result
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def normalize_dataframe(self, raw_df: pd.DataFrame) -> pd.DataFrame:
        df = raw_df.copy()
        num_cols = len(df.columns)
        normalized = pd.DataFrame()

        def find_col(exact_names, substring_patterns, default_idx=None):
            # 1. Coincidencia exacta
            for col in df.columns:
                col_clean = str(col).lower().replace(" ", "").replace("_", "")
                for target in exact_names:
                    if col_clean == target.lower().replace(" ", "").replace("_", ""):
                        return df[col]
            
            # 2. Coincidencia por subcadena excluyendo ID / cédulas
            for col in df.columns:
                col_clean = str(col).lower().replace(" ", "").replace("_", "")
                if "identificacion" in col_clean or "cedula" in col_clean or "id" in col_clean:
                    continue
                for p in substring_patterns:
                    if p.lower().replace(" ", "").replace("_", "") in col_clean:
                        return df[col]

            if default_idx is not None and default_idx < num_cols:
                return df.iloc[:, default_idx]

            return pd.Series([None] * len(df))

        # agendacita_id (Idx 0) - Validar que sea obligatorio
        ag_col = find_col(['agendacita_id', 'agendacitaid', 'id_agenda'], ['agendacita'], default_idx=0)
        if ag_col.isnull().any():
            raise ValueError("El archivo contiene registros con la columna 'agendacita_id' en blanco. Este identificador es estrictamente obligatorio para garantizar que no se dupliquen citas en la base de datos.")
            
        normalized['agendacita_id'] = ag_col.astype(str).str.strip()

        # identificacion (Idx 9)
        normalized['identificacion'] = find_col(['identificacion'], ['identificacion'], default_idx=9).fillna("DESCONOCIDO").astype(str).str.strip()

        # identificacionmedico (Idx 21)
        normalized['identificacionmedico'] = find_col(['identificacionmedico'], ['identificacionmedico'], default_idx=21).fillna("POR ASIGNAR").astype(str).str.strip()

        # 1. Especialidad (medicoespecialidad / Idx 23)
        normalized['especialidad'] = find_col(['medicoespecialidad'], ['especialidad'], default_idx=23).fillna("MEDICINA GENERAL").astype(str).str.strip().str.upper()

        # 2. Estado Cita (estado_cita / Idx 34)
        normalized['estado_cita'] = find_col(['estado_cita'], ['estadocita'], default_idx=34).fillna("ACTIVO").astype(str).str.strip().str.upper()

        # 3. Estado Consulta (estado_consulta / Idx 37)
        normalized['estado_consulta'] = find_col(['estado_consulta'], ['estadoconsulta'], default_idx=37).fillna("EN BLANCO").astype(str).str.strip().str.upper()
        normalized['estado_consulta'] = normalized['estado_consulta'].replace(['NAN', 'NONE', '', '<NA>'], 'EN BLANCO')

        # 4. Convenio Nombre & Filtro EBS (Columna AP / Idx 41 / convenionombre)
        normalized['convenionombre'] = find_col(['convenionombre'], ['convenionombre', 'apconvenios'], default_idx=41).fillna("SIN CONVENIO").astype(str).str.strip()
        normalized['filtro_ebs'] = normalized['convenionombre'].apply(
            lambda x: "Si" if "EQUIPOS BASICOS" in str(x).upper() else "No"
        )

        # 5. Fechas: fechacita, fechadeseada, fechaasignacion, fechaatencion
        normalized['fechacita'] = pd.to_datetime(find_col(['fechacita'], ['fecha_cita']), errors='coerce')
        normalized['fechadeseada'] = pd.to_datetime(find_col(['fechadeseada'], ['fecha_deseada']), errors='coerce')
        normalized['fechaasignacion'] = pd.to_datetime(find_col(['fechaasignacion'], ['fecha_asignacion']), errors='coerce')
        normalized['fechaatencion'] = pd.to_datetime(find_col(['fechaatencion'], ['fecha_atencion']), errors='coerce')
        normalized['horacita'] = find_col(['horacita'], ['hora_cita'], default_idx=2).fillna("").astype(str).str.strip()

        # 6. Paciente (nombrecompleto)
        normalized['nombrecompleto'] = find_col(['nombrecompleto'], ['nombrecompleto', 'paciente'], default_idx=10).fillna("DESCONOCIDO").astype(str).str.strip()

        # 7. Médico / Profesional Nombre (mediconombre / Idx 22) - NO identificacionmedico (Idx 21)
        normalized['mediconombre'] = find_col(['mediconombre', 'nombremedico', 'profesionalnombre'], ['mediconombre'], default_idx=22).fillna("POR ASIGNAR").astype(str).str.strip().str.upper()
        normalized['medico'] = normalized['mediconombre']

        # 8. Sede (nombresede / Idx 46)
        normalized['nombresede'] = find_col(['nombresede'], ['nombresede', 'sede'], default_idx=46).fillna("EMPRESA SOCIAL DEL ESTADO NORTE 3").astype(str).str.strip()
        normalized['sede'] = normalized['nombresede']

        # 9. PYM / Programa
        normalized['pym'] = find_col(['pym'], ['programacronico', 'programa'], default_idx=35).fillna("CITA MORBILIDAD").astype(str).str.strip().str.upper()

        # 10. Tipo Cita (tipocita)
        normalized['tipocita'] = find_col(['tipocita'], ['tipocita'], default_idx=52).fillna("Control").astype(str).str.strip()

        # 11. Finalidad
        normalized['finalidad'] = find_col(['finalidad'], ['finalidad'], default_idx=31).fillna("SIN ESPECIFICAR").astype(str).str.strip().str.upper()

        # 12. Cálculo de días en estado SALA y Alertas (>3 días en SALA)
        today = datetime.now()
        def calc_dias_sala(row):
            if str(row['estado_consulta']).upper() in ['EN SALA', 'SALA', 'EN_SALA', 'SALACONSULTA']:
                ref_date = row['fechacita'] if pd.notnull(row['fechacita']) else row['fechaasignacion']
                if pd.notnull(ref_date):
                    diff = (today - ref_date).days
                    return max(1, diff)
                return 1
            return 0

        normalized['dias_en_sala'] = normalized.apply(calc_dias_sala, axis=1)
        normalized['alerta_sala'] = (normalized['estado_consulta'].str.upper().isin(['EN SALA', 'SALA', 'EN_SALA'])) & (normalized['dias_en_sala'] > 3)

        # 13. Promedio días espera (fechaasignacion vs fechacita)
        normalized['dias_espera'] = (normalized['fechacita'] - normalized['fechaasignacion']).dt.days.abs().fillna(0)

        # ID único de fila
        normalized['id'] = range(1, len(normalized) + 1)

        return normalized

    def get_dataframe(self) -> pd.DataFrame:
        if self.current_df is not None and len(self.current_df) > 0:
            return self.current_df

        try:
            query = """
            SELECT 
                c.agendacita_id as id,
                c.agendacita_id,
                p.nombrecompleto,
                m.mediconombre,
                m.mediconombre as medico,
                e.nombre as especialidad,
                s.nombre as nombresede,
                s.nombre as sede,
                cnv.nombre as convenionombre,
                CASE WHEN cnv.es_ebs THEN 'Si' ELSE 'No' END as filtro_ebs,
                prg.nombre as pym,
                c.fechacita,
                c.fechadeseada,
                c.fechaasignacion,
                c.fechaatencion,
                c.horacita,
                c.estado_cita,
                c.estado_consulta,
                c.tipocita,
                c.finalidad,
                c.dias_en_sala,
                c.alerta_sala,
                c.dias_espera
            FROM citas c
            LEFT JOIN pacientes p ON c.paciente_id = p.identificacion
            LEFT JOIN medicos m ON c.medico_id = m.identificacionmedico
            LEFT JOIN especialidades e ON c.especialidad_id = e.id
            LEFT JOIN sedes s ON c.sede_id = s.id
            LEFT JOIN convenios cnv ON c.convenio_id = cnv.id
            LEFT JOIN programas prg ON c.programa_id = prg.id
            """
            df_db = pd.read_sql(query, engine)
            if len(df_db) > 0:
                self.current_df = df_db
                return self.current_df
        except Exception as e:
            print(f"[DataProcessor] Error consultando PostgreSQL: {e}")

        return pd.DataFrame(columns=[
            'id', 'agendacita_id', 'especialidad', 'estado_cita', 'estado_consulta', 'convenionombre', 'filtro_ebs',
            'fechacita', 'fechadeseada', 'fechaasignacion', 'fechaatencion',
            'nombrecompleto', 'mediconombre', 'medico', 'nombresede', 'sede', 'pym', 'tipocita',
            'finalidad', 'dias_en_sala', 'alerta_sala', 'dias_espera'
        ])
