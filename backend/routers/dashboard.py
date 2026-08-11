from fastapi import APIRouter, Query
from typing import Optional, List
import pandas as pd
from routers.upload import processor
from services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/filters")
async def get_filters():
    df = processor.get_dataframe()
    return AnalyticsEngine.get_available_filters(df)

@router.get("/overview")
async def get_overview(
    filtro_ebs: Optional[str] = Query(None),
    convenionombre: Optional[str] = Query(None),
    estado_cita: Optional[str] = Query(None),
    estado_consulta: Optional[str] = Query(None),
    especialidad: Optional[str] = Query(None),
    mediconombre: Optional[str] = Query(None),
    pym: Optional[str] = Query(None),
    sede: Optional[str] = Query(None),
    tipocita: Optional[str] = Query(None),
    nombrecompleto: Optional[str] = Query(None),
    fechacita_inicio: Optional[str] = Query(None),
    fechacita_fin: Optional[str] = Query(None),
    fechadeseada_inicio: Optional[str] = Query(None),
    fechadeseada_fin: Optional[str] = Query(None),
    fechaasignacion_inicio: Optional[str] = Query(None),
    fechaasignacion_fin: Optional[str] = Query(None),
    fechaatencion_inicio: Optional[str] = Query(None),
    fechaatencion_fin: Optional[str] = Query(None),
    solo_alertas: bool = Query(False)
):
    df = processor.get_dataframe()
    filtered_df = AnalyticsEngine.filter_dataframe(
        df,
        filtro_ebs=filtro_ebs,
        convenionombre=convenionombre,
        estado_cita=estado_cita,
        estado_consulta=estado_consulta,
        especialidad=especialidad,
        mediconombre=mediconombre,
        pym=pym,
        sede=sede,
        tipocita=tipocita,
        nombrecompleto=nombrecompleto,
        fechacita_inicio=fechacita_inicio,
        fechacita_fin=fechacita_fin,
        fechadeseada_inicio=fechadeseada_inicio,
        fechadeseada_fin=fechadeseada_fin,
        fechaasignacion_inicio=fechaasignacion_inicio,
        fechaasignacion_fin=fechaasignacion_fin,
        fechaatencion_inicio=fechaatencion_inicio,
        fechaatencion_fin=fechaatencion_fin,
        solo_alertas=solo_alertas
    )

    kpis = AnalyticsEngine.get_summary_kpis(filtered_df)
    charts = AnalyticsEngine.get_charts_data(filtered_df)

    return {
        "kpis": kpis,
        "charts": charts,
        "filtered_records_count": len(filtered_df),
        "total_records_count": len(df)
    }

@router.get("/personal")
async def get_personal_analysis(
    filtro_ebs: Optional[str] = Query(None),
    convenionombre: Optional[str] = Query(None),
    estado_cita: Optional[str] = Query(None),
    estado_consulta: Optional[str] = Query(None),
    especialidad: Optional[str] = Query(None),
    mediconombre: Optional[str] = Query(None),
    pym: Optional[str] = Query(None),
    sede: Optional[str] = Query(None),
    tipocita: Optional[str] = Query(None),
    fechacita_inicio: Optional[str] = Query(None),
    fechacita_fin: Optional[str] = Query(None)
):
    df = processor.get_dataframe()
    filtered_df = AnalyticsEngine.filter_dataframe(
        df,
        filtro_ebs=filtro_ebs,
        convenionombre=convenionombre,
        estado_cita=estado_cita,
        estado_consulta=estado_consulta,
        especialidad=especialidad,
        mediconombre=mediconombre,
        pym=pym,
        sede=sede,
        tipocita=tipocita,
        fechacita_inicio=fechacita_inicio,
        fechacita_fin=fechacita_fin
    )

    medicos = AnalyticsEngine.get_personal_asistencial_table(filtered_df)
    especialidades = AnalyticsEngine.get_especialidad_table(filtered_df)
    programas = AnalyticsEngine.get_programa_periodo_table(filtered_df)

    return {
        "personal_asistencial": medicos,
        "especialidades": especialidades,
        "programas": programas
    }

@router.get("/alerts")
async def get_alerts(
    filtro_ebs: Optional[str] = Query(None),
    convenionombre: Optional[str] = Query(None),
    especialidad: Optional[str] = Query(None),
    mediconombre: Optional[str] = Query(None),
    sede: Optional[str] = Query(None)
):
    df = processor.get_dataframe()
    filtered_df = AnalyticsEngine.filter_dataframe(
        df,
        filtro_ebs=filtro_ebs,
        convenionombre=convenionombre,
        especialidad=especialidad,
        mediconombre=mediconombre,
        sede=sede
    )

    alerts = AnalyticsEngine.get_alerts_table(filtered_df)
    return {
        "count": len(alerts),
        "alerts": alerts
    }

@router.get("/details")
async def get_details(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    filtro_ebs: Optional[str] = Query(None),
    convenionombre: Optional[str] = Query(None),
    estado_cita: Optional[str] = Query(None),
    estado_consulta: Optional[str] = Query(None),
    especialidad: Optional[str] = Query(None),
    mediconombre: Optional[str] = Query(None),
    pym: Optional[str] = Query(None),
    sede: Optional[str] = Query(None),
    tipocita: Optional[str] = Query(None),
    fechacita_inicio: Optional[str] = Query(None),
    fechacita_fin: Optional[str] = Query(None)
):
    df = processor.get_dataframe()
    filtered_df = AnalyticsEngine.filter_dataframe(
        df,
        filtro_ebs=filtro_ebs,
        convenionombre=convenionombre,
        estado_cita=estado_cita,
        estado_consulta=estado_consulta,
        especialidad=especialidad,
        mediconombre=mediconombre,
        pym=pym,
        sede=sede,
        tipocita=tipocita,
        nombrecompleto=search,
        fechacita_inicio=fechacita_inicio,
        fechacita_fin=fechacita_fin
    )

    total_records = len(filtered_df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    sliced = filtered_df.iloc[start_idx:end_idx].copy()
    
    sliced['fechacita_str'] = pd.to_datetime(sliced['fechacita'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('-')
    sliced['fechadeseada_str'] = pd.to_datetime(sliced['fechadeseada'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('-')
    sliced['fechaasignacion_str'] = pd.to_datetime(sliced['fechaasignacion'], errors='coerce').dt.strftime('%Y-%m-%d').fillna('-')
    sliced['fechaatencion_str'] = pd.to_datetime(sliced['fechaatencion'], errors='coerce').dt.strftime('%Y-%m-%d %H:%M').fillna('-')

    records = sliced[[
        'id', 'especialidad', 'estado_cita', 'estado_consulta', 'convenionombre', 'filtro_ebs',
        'fechacita_str', 'fechadeseada_str', 'fechaasignacion_str', 'fechaatencion_str',
        'nombrecompleto', 'mediconombre', 'medico', 'sede', 'finalidad', 'pym', 'tipocita',
        'dias_en_sala', 'alerta_sala'
    ]].to_dict(orient='records')

    return {
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": (total_records + limit - 1) // limit if total_records > 0 else 1,
        "data": records
    }
