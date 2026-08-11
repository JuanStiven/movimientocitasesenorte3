import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Paciente, Medico, Especialidad, Sede, Convenio, Programa, Cita
from database import engine

class DBImporter:
    @staticmethod
    def import_dataframe(df: pd.DataFrame, db: Session) -> dict:
        if len(df) == 0:
            return {"success": False, "imported": 0, "nuevas": 0, "actualizadas": 0, "error": "El archivo importado no contiene ningún registro."}

        warnings = []
        try:
            from database import Base
            Base.metadata.create_all(bind=engine)

            # Validar agendacita_id
            if 'agendacita_id' not in df.columns or df['agendacita_id'].isnull().all():
                warnings.append("No se encontró la columna 'agendacita_id' explícita; se generaron identificadores automáticos.")

            # 1. Especialidades
            especialidades = df['especialidad'].dropna().unique()
            for esp_name in especialidades:
                val = str(esp_name).strip()
                if val:
                    existing = db.query(Especialidad).filter_by(nombre=val).first()
                    if not existing:
                        db.add(Especialidad(nombre=val))
            db.commit()
            esp_rows = db.query(Especialidad.nombre, Especialidad.id).all()
            esp_map = {row[0]: row[1] for row in esp_rows}

            # 2. Sedes
            sedes = df['sede'].dropna().unique()
            for s_name in sedes:
                val = str(s_name).strip()
                if val:
                    existing = db.query(Sede).filter_by(nombre=val).first()
                    if not existing:
                        db.add(Sede(nombre=val))
            db.commit()
            sede_rows = db.query(Sede.nombre, Sede.id).all()
            sede_map = {row[0]: row[1] for row in sede_rows}

            # 3. Convenios
            convenios = df['convenionombre'].dropna().unique()
            for c_name in convenios:
                val = str(c_name).strip()
                if val:
                    es_ebs = "EQUIPOS BASICOS" in val.upper()
                    existing = db.query(Convenio).filter_by(nombre=val).first()
                    if not existing:
                        db.add(Convenio(nombre=val, es_ebs=es_ebs))
            db.commit()
            conv_rows = db.query(Convenio.nombre, Convenio.id).all()
            conv_map = {row[0]: row[1] for row in conv_rows}

            # 4. Programas (PYM)
            programas = df['pym'].dropna().unique()
            for p_name in programas:
                val = str(p_name).strip()
                if val:
                    existing = db.query(Programa).filter_by(nombre=val).first()
                    if not existing:
                        db.add(Programa(nombre=val))
            db.commit()
            prog_rows = db.query(Programa.nombre, Programa.id).all()
            prog_map = {row[0]: row[1] for row in prog_rows}

            # 5. Médicos
            if 'identificacionmedico' in df.columns:
                medicos_df = df[['identificacionmedico', 'mediconombre']].drop_duplicates(subset=['identificacionmedico']).dropna()
            else:
                medicos_df = df[['mediconombre']].drop_duplicates().dropna()
                medicos_df['identificacionmedico'] = medicos_df['mediconombre']

            for _, row in medicos_df.iterrows():
                med_id = str(row['identificacionmedico']).strip()
                med_nom = str(row['mediconombre']).strip()
                if med_id and med_nom:
                    existing = db.query(Medico).filter_by(identificacionmedico=med_id).first()
                    if existing:
                        existing.mediconombre = med_nom
                    else:
                        db.add(Medico(identificacionmedico=med_id, mediconombre=med_nom))
            db.commit()

            # 6. Pacientes
            if 'identificacion' in df.columns:
                pacientes_df = df[['identificacion', 'nombrecompleto']].drop_duplicates(subset=['identificacion']).dropna()
            else:
                pacientes_df = df[['nombrecompleto']].drop_duplicates().dropna()
                pacientes_df['identificacion'] = pacientes_df['nombrecompleto']

            for _, row in pacientes_df.iterrows():
                pac_id = str(row['identificacion']).strip()
                pac_nom = str(row['nombrecompleto']).strip()
                if pac_id and pac_nom:
                    existing = db.query(Paciente).filter_by(identificacion=pac_id).first()
                    if existing:
                        existing.nombrecompleto = pac_nom
                    else:
                        db.add(Paciente(identificacion=pac_id, nombrecompleto=pac_nom))
            db.commit()

            # 7. Construcción eficiente de la tabla de Citas
            df_citas = pd.DataFrame()
            df_citas['agendacita_id'] = df['agendacita_id'].astype(str).str.strip()
            df_citas['fechacita'] = pd.to_datetime(df['fechacita'], errors='coerce')
            df_citas['horacita'] = df['horacita'].fillna('').astype(str).str.strip()
            df_citas['fechadeseada'] = pd.to_datetime(df['fechadeseada'], errors='coerce').dt.date
            df_citas['fechaasignacion'] = pd.to_datetime(df['fechaasignacion'], errors='coerce').dt.date
            df_citas['fechaatencion'] = pd.to_datetime(df['fechaatencion'], errors='coerce')
            df_citas['estado_cita'] = df['estado_cita'].fillna('ACTIVO').astype(str).str.strip().str.upper()
            df_citas['estado_consulta'] = df['estado_consulta'].fillna('EN BLANCO').astype(str).str.strip().str.upper()
            df_citas['tipocita'] = df['tipocita'].fillna('Control').astype(str).str.strip()
            df_citas['finalidad'] = df['finalidad'].fillna('SIN ESPECIFICAR').astype(str).str.strip().str.upper()
            df_citas['dias_en_sala'] = df['dias_en_sala'].fillna(0).astype(int)
            df_citas['alerta_sala'] = df['alerta_sala'].fillna(False).astype(bool)
            df_citas['dias_espera'] = df['dias_espera'].fillna(0.0).astype(float)

            # Mapeos de claves foráneas
            df_citas['especialidad_id'] = df['especialidad'].astype(str).str.strip().map(esp_map)
            df_citas['sede_id'] = df['sede'].astype(str).str.strip().map(sede_map)
            df_citas['convenio_id'] = df['convenionombre'].astype(str).str.strip().map(conv_map)
            df_citas['programa_id'] = df['pym'].astype(str).str.strip().map(prog_map)

            if 'identificacionmedico' in df.columns:
                df_citas['medico_id'] = df['identificacionmedico'].astype(str).str.strip()
            else:
                df_citas['medico_id'] = df['mediconombre'].astype(str).str.strip()

            if 'identificacion' in df.columns:
                df_citas['paciente_id'] = df['identificacion'].astype(str).str.strip()
            else:
                df_citas['paciente_id'] = df['nombrecompleto'].astype(str).str.strip()

            # Eliminar duplicados internos dentro del mismo DataFrame cargado si los hubiera
            df_citas = df_citas.drop_duplicates(subset=['agendacita_id'])

            total_records = len(df_citas)

            # Calcular métricas exactas: Nuevas vs Actualizadas
            existing_ids = set(r[0] for r in db.query(Cita.agendacita_id).all())
            incoming_ids = set(df_citas['agendacita_id'])
            nuevas_count = len(incoming_ids - existing_ids)
            actualizadas_count = len(incoming_ids & existing_ids)

            # Ingesta Ultra-Rápida usando Tabla Temporal de Staging
            if 'postgresql' in str(engine.url):
                with engine.begin() as conn:
                    df_citas.to_sql('temp_citas_staging', conn, if_exists='replace', index=False)

                    upsert_sql = text("""
                    INSERT INTO citas (
                        agendacita_id, fechacita, horacita, fechadeseada, fechaasignacion, fechaatencion,
                        estado_cita, estado_consulta, tipocita, finalidad, dias_en_sala, alerta_sala, dias_espera,
                        paciente_id, medico_id, especialidad_id, sede_id, convenio_id, programa_id
                    )
                    SELECT 
                        agendacita_id, fechacita, horacita, fechadeseada, fechaasignacion, fechaatencion,
                        estado_cita, estado_consulta, tipocita, finalidad, dias_en_sala, alerta_sala, dias_espera,
                        paciente_id, medico_id, especialidad_id, sede_id, convenio_id, programa_id
                    FROM temp_citas_staging
                    ON CONFLICT (agendacita_id) DO UPDATE SET
                        fechacita = EXCLUDED.fechacita,
                        horacita = EXCLUDED.horacita,
                        fechadeseada = EXCLUDED.fechadeseada,
                        fechaasignacion = EXCLUDED.fechaasignacion,
                        fechaatencion = EXCLUDED.fechaatencion,
                        estado_cita = EXCLUDED.estado_cita,
                        estado_consulta = EXCLUDED.estado_consulta,
                        tipocita = EXCLUDED.tipocita,
                        finalidad = EXCLUDED.finalidad,
                        dias_en_sala = EXCLUDED.dias_en_sala,
                        alerta_sala = EXCLUDED.alerta_sala,
                        dias_espera = EXCLUDED.dias_espera,
                        paciente_id = EXCLUDED.paciente_id,
                        medico_id = EXCLUDED.medico_id,
                        especialidad_id = EXCLUDED.especialidad_id,
                        sede_id = EXCLUDED.sede_id,
                        convenio_id = EXCLUDED.convenio_id,
                        programa_id = EXCLUDED.programa_id;
                    
                    DROP TABLE IF EXISTS temp_citas_staging;
                    """)
                    conn.execute(upsert_sql)
            else:
                with engine.begin() as conn:
                    df_citas.to_sql('citas', conn, if_exists='append', index=False)

            print(f"[DBImporter] Procesadas {total_records} citas (Nuevas: {nuevas_count}, Actualizadas: {actualizadas_count}) en PostgreSQL exitosamente.")
            return {
                "success": True,
                "imported": total_records,
                "nuevas": nuevas_count,
                "actualizadas": actualizadas_count,
                "deduplication_key": "agendacita_id",
                "warnings": warnings
            }
        except Exception as e:
            db.rollback()
            err_msg = str(e)
            if "invalid byte sequence" in err_msg.lower() or "encoding" in err_msg.lower():
                user_error = "Error de codificación en el archivo. Asegúrate de guardar el CSV como UTF-8."
            elif "column" in err_msg.lower():
                user_error = "Error de columnas: El archivo no cumple con la estructura esperada."
            else:
                user_error = f"Error al guardar en base de datos: {err_msg}"
                
            print(f"[DBImporter] Error de importación: {user_error}")
            return {"success": False, "imported": 0, "nuevas": 0, "actualizadas": 0, "error": user_error}
