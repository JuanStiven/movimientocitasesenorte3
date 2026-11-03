import csv
import io
from typing import Iterator

import pandas as pd


class ExportService:
    """Generación de CSV por bloques para no cargar todo en memoria."""

    HEADERS = [
        "ID Cita",
        "Paciente",
        "Médico / Profesional",
        "Especialidad",
        "Sede / Centro",
        "Convenio",
        "Filtro EBS",
        "Tipo Cita",
        "Estado Cita",
        "Estado Consulta",
        "Fecha Cita",
        "Fecha Deseada",
        "Fecha Asignación",
        "Fecha Atención",
        "Finalidad",
        "Programa / PYM",
        "Días en Sala",
    ]

    # (columna destino, columna origen, formato de fecha o None)
    DATE_COLUMNS = (
        ("fechacita_str", "fechacita", "%Y-%m-%d"),
        ("fechadeseada_str", "fechadeseada", "%Y-%m-%d"),
        ("fechaasignacion_str", "fechaasignacion", "%Y-%m-%d"),
        ("fechaatencion_str", "fechaatencion", "%Y-%m-%d %H:%M"),
    )

    @classmethod
    def _format_chunk(cls, chunk: pd.DataFrame) -> pd.DataFrame:
        data = chunk.copy()

        for target, source, fmt in cls.DATE_COLUMNS:
            if source in data.columns:
                data[target] = (
                    pd.to_datetime(data[source], errors="coerce")
                    .dt.strftime(fmt)
                    .fillna("-")
                )
            else:
                data[target] = "-"

        if "medico" in data.columns and "mediconombre" in data.columns:
            data["medico_out"] = data["medico"].fillna(data["mediconombre"])
        elif "medico" in data.columns:
            data["medico_out"] = data["medico"]
        elif "mediconombre" in data.columns:
            data["medico_out"] = data["mediconombre"]
        else:
            data["medico_out"] = ""

        return data

    @classmethod
    def _rows(cls, chunk: pd.DataFrame) -> Iterator[list]:
        data = cls._format_chunk(chunk)
        columns = [
            "id",
            "nombrecompleto",
            "medico_out",
            "especialidad",
            "sede",
            "convenionombre",
            "filtro_ebs",
            "tipocita",
            "estado_cita",
            "estado_consulta",
            "fechacita_str",
            "fechadeseada_str",
            "fechaasignacion_str",
            "fechaatencion_str",
            "finalidad",
            "pym",
            "dias_en_sala",
        ]

        for row in data.reindex(columns=columns).itertuples(index=False, name=None):
            values = []
            for value in row:
                if value is None or (isinstance(value, float) and pd.isna(value)):
                    values.append("")
                elif isinstance(value, float) and value.is_integer():
                    values.append(int(value))
                else:
                    values.append(value)
            yield values

    @classmethod
    def iter_csv(cls, data: pd.DataFrame, chunk_size: int = 2000) -> Iterator[str]:
        """Genera el CSV en bloques para servirlo con StreamingResponse."""
        buffer = io.StringIO()
        writer = csv.writer(
            buffer,
            delimiter=";",
            quoting=csv.QUOTE_ALL,
            lineterminator="\r\n",
        )

        writer.writerow(cls.HEADERS)
        yield "\ufeff" + buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)

        total = len(data)
        for start in range(0, total, chunk_size):
            chunk = data.iloc[start:start + chunk_size]
            writer.writerows(cls._rows(chunk))
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)
