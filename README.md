# ESE NORTE 3 - Software de Gestión, Importación y Analítica de Citas

Este proyecto es un sistema web completo para el seguimiento y analítica del movimiento de citas médicas a partir del cargue diario de archivos insumo (Excel/CSV). Reemplaza y moderniza la vista de PowerBI ("Análisis General Asignación de Citas" y "Análisis Personal Asistencial").

## Arquitectura

- **Backend (`/backend`)**: Desarrollado en Python con FastAPI y Pandas. Ingesta archivos Excel/CSV, mapea columnas automáticamente (Columna AP para Convenios EBS, AI para Estado Cita, AL para Estado Consulta, X para Especialidad), calcula métricas y genera alertas automáticas para citas con más de 3 días en estado `EN SALA`.
- **Frontend (`/frontend`)**: Desarrollado en Next.js (React, Tailwind CSS, Recharts). Ofrece un Dashboard con gráficos de barras, tortas, tendencias, análisis por personal asistencial, módulo de alertas destacadas e importador de datos diario.
- **Docker Compose**: Orquestación unificada de ambos servicios, lista para despliegue directo en **Coolify** o servidores locales.

---

## Cómo encender la aplicación con Docker

Para levantar el backend y frontend simultáneamente con un solo comando:

```bash
docker compose up --build
```

Una vez iniciados los contenedores:
- **Frontend (Dashboard Web)**: `http://localhost:3000`
- **Backend (API REST & Docs Swagger)**: `http://localhost:8000/docs`

---

## Despliegue en Coolify

Este repositorio está preparado para desplegarse automáticamente en **Coolify**:
1. Conecta este repositorio Git a Coolify.
2. Selecciona el tipo de despliegue: **Docker Compose**.
3. Indica la ruta `docker-compose.yml` en la raíz.
4. Presiona **Deploy**. Coolify levantará los dos contenedores y expondrá el frontend en tu dominio configurado.

---

## Mapeo de Columnas del Insumo

El sistema incluye detección automática de columnas del insumo Excel/CSV:
- **Columna AP**: `AP Convenios` / `FILTRO EBS` (Detecta si la cita cuenta con convenios de Equipos Básicos: "Si" / "No").
- **Columna AI**: `Estado Cita` (ACTIVO, FINALIZADA, CITA CANCELADA, INCUMPLIDO).
- **Columna AL**: `Estado Consulta` (FINALIZADA, EN SALA, DESCARTADA, EN BLANCO).
- **Columna X**: `Especialidad` / `medicoespecialidad`.
- **Alerta de Sala**: Filtra y resalta citas con más de 3 días en estado de consulta `EN SALA`.
# movimientocitasesenorte3
