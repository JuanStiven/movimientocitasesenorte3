import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List

class AnalyticsEngine:
    @staticmethod
    def filter_dataframe(
        df: pd.DataFrame,
        filtro_ebs: Optional[Any] = None,
        convenionombre: Optional[Any] = None,
        estado_cita: Optional[Any] = None,
        estado_consulta: Optional[Any] = None,
        especialidad: Optional[Any] = None,
        mediconombre: Optional[Any] = None,
        pym: Optional[Any] = None,
        sede: Optional[Any] = None,
        tipocita: Optional[Any] = None,
        nombrecompleto: Optional[str] = None,
        fechacita_inicio: Optional[str] = None,
        fechacita_fin: Optional[str] = None,
        fechadeseada_inicio: Optional[str] = None,
        fechadeseada_fin: Optional[str] = None,
        fechaasignacion_inicio: Optional[str] = None,
        fechaasignacion_fin: Optional[str] = None,
        fechaatencion_inicio: Optional[str] = None,
        fechaatencion_fin: Optional[str] = None,
        solo_alertas: bool = False
    ) -> pd.DataFrame:
        if len(df) == 0:
            return df.copy()

        filtered = df.copy()

        def apply_multi(data: pd.DataFrame, col_name: str, val: Any) -> pd.DataFrame:
            if val is None:
                return data
            if isinstance(val, str):
                raw_list = [val]
            elif isinstance(val, (list, tuple, set)):
                raw_list = list(val)
            else:
                return data

            # Expandir valores concatenados por coma. FastAPI entrega los parámetros
            # repetidos como list[str], pero si el cliente envía "A,B" en un solo
            # parámetro la lista llega con un único elemento y hay que separarlo.
            val_list = []
            for item in raw_list:
                val_list.extend(str(item).split(','))

            cleaned = [str(v).strip().upper() for v in val_list if str(v).strip() and str(v).strip().upper() not in ["TODAS", "TODOS"]]
            if not cleaned:
                return data

            if col_name in data.columns:
                return data[data[col_name].astype(str).str.upper().isin(cleaned)]
            return data

        # 1. Filtro EBS (Convenios)
        filtered = apply_multi(filtered, 'filtro_ebs', filtro_ebs)

        # 2. Convenio Nombre
        filtered = apply_multi(filtered, 'convenionombre', convenionombre)

        # 3. Estado Cita
        filtered = apply_multi(filtered, 'estado_cita', estado_cita)

        # 4. Estado Consulta
        filtered = apply_multi(filtered, 'estado_consulta', estado_consulta)

        # 5. Especialidad (medicoespecialidad)
        filtered = apply_multi(filtered, 'especialidad', especialidad)

        # 6. Médico Nombre (mediconombre)
        filtered = apply_multi(filtered, 'mediconombre', mediconombre)

        # 7. PYM / Programa
        filtered = apply_multi(filtered, 'pym', pym)

        # 8. Sede (nombresede / sede)
        filtered = apply_multi(filtered, 'sede', sede)

        # 9. Tipo Cita (tipocita)
        filtered = apply_multi(filtered, 'tipocita', tipocita)

        # 10. Búsqueda Paciente (nombrecompleto)
        if nombrecompleto:
            term = nombrecompleto.lower()
            filtered = filtered[filtered['nombrecompleto'].astype(str).str.lower().str.contains(term, na=False)]

        # Helper para filtrado de rango de fechas
        def apply_date_range(data, col_name, start_val, end_val):
            if start_val or end_val:
                dt_col = pd.to_datetime(data[col_name], errors='coerce')
                if start_val:
                    try:
                        dt_start = pd.to_datetime(start_val)
                        data = data[dt_col >= dt_start]
                        dt_col = pd.to_datetime(data[col_name], errors='coerce')
                    except Exception:
                        pass
                if end_val:
                    try:
                        dt_end = pd.to_datetime(end_val) + pd.Timedelta(days=1)
                        data = data[dt_col <= dt_end]
                    except Exception:
                        pass
            return data

        # 11. Rangos de Fechas
        filtered = apply_date_range(filtered, 'fechacita', fechacita_inicio, fechacita_fin)
        filtered = apply_date_range(filtered, 'fechadeseada', fechadeseada_inicio, fechadeseada_fin)
        filtered = apply_date_range(filtered, 'fechaasignacion', fechaasignacion_inicio, fechaasignacion_fin)
        filtered = apply_date_range(filtered, 'fechaatencion', fechaatencion_inicio, fechaatencion_fin)

        # 12. Solo Alertas (>3 días en SALA)
        if solo_alertas:
            filtered = filtered[filtered['alerta_sala'] == True]

        return filtered

    @classmethod
    def get_summary_kpis(cls, df: pd.DataFrame) -> Dict[str, Any]:
        total = len(df)
        if total == 0:
            return {
                "total_citas": 0,
                "finalizadas": 0,
                "en_sala": 0,
                "canceladas": 0,
                "incumplidas": 0,
                "alertas_sala": 0,
                "promedio_dias_espera": 0.0
            }

        finalizadas = len(df[df['estado_consulta'].astype(str).str.upper() == 'FINALIZADA'])
        en_sala = len(df[df['estado_consulta'].astype(str).str.upper().isin(['EN SALA', 'SALA', 'EN_SALA'])])
        canceladas = len(df[df['estado_cita'].astype(str) == 'CITA CANCELADA'])
        incumplidas = len(df[df['estado_cita'].astype(str) == 'INCUMPLIDO'])
        alertas = len(df[df['alerta_sala'] == True])
        
        dias_espera_series = pd.to_numeric(df['dias_espera'], errors='coerce').dropna()
        prom_dias = round(float(dias_espera_series.mean()), 2) if len(dias_espera_series) > 0 else 0.0

        return {
            "total_citas": total,
            "finalizadas": finalizadas,
            "en_sala": en_sala,
            "canceladas": canceladas,
            "incumplidas": incumplidas,
            "alertas_sala": alertas,
            "promedio_dias_espera": prom_dias
        }

    @classmethod
    def get_charts_data(cls, df: pd.DataFrame) -> Dict[str, Any]:
        if len(df) == 0:
            return {
                "estado_cita": [],
                "estado_consulta": [],
                "citas_finalidad": [],
                "citas_periodo": [],
                "clasificacion_citas": [],
                "tipo_cita": []
            }

        # 1. Estado Cita
        est_cita_counts = df['estado_cita'].astype(str).value_counts().reset_index()
        est_cita_counts.columns = ['name', 'value']
        
        # 2. Estado Consulta
        est_cons_counts = df['estado_consulta'].astype(str).value_counts().reset_index()
        est_cons_counts.columns = ['name', 'value']

        # 3. Citas por Finalidad
        finalidad_counts = df['finalidad'].astype(str).value_counts().head(8).reset_index()
        finalidad_counts.columns = ['name', 'value']

        # 4. Clasificación Citas (PYM)
        pym_counts = df['pym'].astype(str).value_counts().head(8).reset_index()
        pym_counts.columns = ['name', 'value']

        # 5. Tipo Cita
        tipo_cita_counts = df['tipocita'].astype(str).value_counts().reset_index()
        tipo_cita_counts.columns = ['name', 'value']

        # 6. Citas por Período
        df_copy = df.copy()
        dt_periodo = pd.to_datetime(df_copy['fechacita'], errors='coerce')
        df_copy['periodo'] = dt_periodo.dt.strftime('%Y-%m').fillna('SIN FECHA')
        
        periodo_grp = df_copy.groupby(['periodo', 'estado_cita']).size().unstack(fill_value=0).reset_index()
        periodo_list = []
        for _, row in periodo_grp.iterrows():
            item = {"periodo": row['periodo']}
            for col in periodo_grp.columns:
                if col != 'periodo':
                    item[str(col)] = int(row[col])
            periodo_list.append(item)
        
        periodo_list = sorted(periodo_list, key=lambda x: x['periodo'])[-12:]

        return {
            "estado_cita": est_cita_counts.to_dict(orient="records"),
            "estado_consulta": est_cons_counts.to_dict(orient="records"),
            "citas_finalidad": finalidad_counts.to_dict(orient="records"),
            "clasificacion_citas": pym_counts.to_dict(orient="records"),
            "tipo_cita": tipo_cita_counts.to_dict(orient="records"),
            "citas_periodo": periodo_list
        }

    @classmethod
    def get_especialidad_table(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if len(df) == 0:
            return []
        
        grp = df.groupby('especialidad').agg(
            total=('id', 'count'),
            finalizadas=('estado_consulta', lambda x: (x.astype(str).str.upper() == 'FINALIZADA').sum()),
            en_sala=('estado_consulta', lambda x: x.astype(str).str.upper().isin(['EN SALA', 'SALA', 'EN_SALA']).sum()),
            canceladas=('estado_cita', lambda x: (x.astype(str) == 'CITA CANCELADA').sum()),
            promedio_dias_espera=('dias_espera', lambda x: round(float(pd.to_numeric(x, errors='coerce').mean()), 2))
        ).reset_index()

        grp['promedio_dias_espera'] = grp['promedio_dias_espera'].fillna(0.0)
        grp = grp.sort_values(by='total', ascending=False)
        return grp.to_dict(orient='records')

    @classmethod
    def get_personal_asistencial_table(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Tabla CITAS ASIGNADAS POR PERSONAL ASISTENCIAL
        - Agrupado por mediconombre (Nombre completo del médico)
        - Columnas desde estado_consulta: Total, Finalizadas, En Sala, Descartadas, En Blanco
        """
        if len(df) == 0:
            return []

        # Asegurar que se agrupe por el nombre del médico (mediconombre)
        grp = df.groupby('mediconombre').agg(
            total=('id', 'count'),
            finalizadas=('estado_consulta', lambda x: (x.astype(str).str.upper() == 'FINALIZADA').sum()),
            en_sala=('estado_consulta', lambda x: x.astype(str).str.upper().isin(['EN SALA', 'SALA', 'EN_SALA']).sum()),
            descartada=('estado_consulta', lambda x: (x.astype(str).str.upper() == 'DESCARTADA').sum()),
            en_blanco=('estado_consulta', lambda x: x.astype(str).str.upper().isin(['EN BLANCO', 'NAN', 'NONE', '', '<NA>']).sum())
        ).reset_index()

        grp.rename(columns={'mediconombre': 'medico'}, inplace=True)
        grp = grp.sort_values(by='total', ascending=False).head(50)
        return grp.to_dict(orient='records')

    @classmethod
    def get_programa_periodo_table(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if len(df) == 0:
            return []
        
        grp = df.groupby('pym').size().reset_index(name='total')
        grp = grp.sort_values(by='total', ascending=False)
        return grp.to_dict(orient='records')

    @classmethod
    def get_alerts_table(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        alert_df = df[df['alerta_sala'] == True].copy()
        if len(alert_df) == 0:
            return []

        alert_df['fechacita_str'] = pd.to_datetime(alert_df['fechacita'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('-')
        alert_df['fechaasignacion_str'] = pd.to_datetime(alert_df['fechaasignacion'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('-')

        records = alert_df[['id', 'mediconombre', 'especialidad', 'sede', 'estado_cita', 'estado_consulta', 'dias_en_sala', 'fechacita_str', 'fechaasignacion_str']].copy()
        records.rename(columns={'mediconombre': 'medico'}, inplace=True)
        return records.to_dict(orient='records')

    @classmethod
    def get_available_filters(cls, df: pd.DataFrame) -> Dict[str, Any]:
        if len(df) == 0:
            return {
                "filtro_ebs": ["Todas", "Si", "No"],
                "convenionombre": ["Todas"],
                "estado_cita": ["Todas"],
                "estado_consulta": ["Todas"],
                "especialidad": ["Todas"],
                "mediconombre": ["Todas"],
                "pym": ["Todas"],
                "sede": ["Todas"],
                "tipocita": ["Todas"]
            }

        def get_sorted_list(col_name):
            if col_name in df.columns:
                unique_vals = [str(x) for x in df[col_name].unique() if pd.notnull(x) and str(x).strip() != ""]
                return ["Todas"] + sorted(unique_vals)
            return ["Todas"]

        return {
            "filtro_ebs": ["Todas", "Si", "No"],
            "convenionombre": get_sorted_list('convenionombre'),
            "estado_cita": get_sorted_list('estado_cita'),
            "estado_consulta": get_sorted_list('estado_consulta'),
            "especialidad": get_sorted_list('especialidad'),
            "mediconombre": get_sorted_list('mediconombre'),
            "pym": get_sorted_list('pym'),
            "sede": get_sorted_list('nombresede'),
            "tipocita": get_sorted_list('tipocita')
        }
