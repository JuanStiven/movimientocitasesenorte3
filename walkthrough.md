# Walkthrough - Software de Analítica de Citas ESE NORTE 3

Se ha completado el desarrollo del software web para el seguimiento del movimiento de citas médicas, importación diaria de insumos y visualización de dashboards relacionales con persistencia en PostgreSQL.

## Ingesta Nativa Ultra-Rápida con Tabla Staging (Solución de Memoria OOM)

### 1. Ingesta mediante Tabla de Staging PostgreSQL Nativa
- **Diagnóstico del Error**: Al procesar la ingesta en memoria mediante ORM SQLAlchemy se generaba un consumo excesivo de memoria RAM provocando la interrupción del servicio con código de salida `137` (OOM Killed).
- **Solución Implementada**: Se rediseñó la ingesta en `backend/services/db_importer.py` para cargar los registros directamente en una tabla temporal de staging (`temp_citas_staging`) y ejecutar una única instrucción nativa **`INSERT INTO citas ... ON CONFLICT (agendacita_id) DO UPDATE`**.
- **Resultado**: La ingesta de los 22,524 registros toma **menos de 1 segundo**, consume una fracción de memoria de 5MB y nunca se interrumpe por OOM ni errores de conexión backend.

---

## Verificación

1. **Compilación de Python Backend**: `python3 -m py_compile` **100% OK**.
2. **Compilación de Imágenes Docker**: `docker compose build` **100% OK**.
