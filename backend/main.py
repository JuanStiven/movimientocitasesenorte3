from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import upload, dashboard, auth, users
from core.security import get_current_user
from fastapi import Depends

# Crear tablas en la base de datos PostgreSQL si no existen al iniciar la aplicación
try:
    Base.metadata.create_all(bind=engine)
    print("[FastAPI] Tablas PostgreSQL creadas/verificadas exitosamente.")
    from init_admin import init_admin
    init_admin()
except Exception as e:
    print(f"[FastAPI] Advertencia al crear tablas en BD: {e}")

app = FastAPI(
    title="ESE NORTE 3 - API Analítica de Citas",
    description="Backend en Python FastAPI para el seguimiento de movimiento de citas médicas con persistencia relacional en PostgreSQL.",
    version="1.0.0"
)

# Configuración de CORS para comunicarse con el frontend de Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router, dependencies=[Depends(get_current_user)])
app.include_router(upload.router, dependencies=[Depends(get_current_user)])
app.include_router(dashboard.router, dependencies=[Depends(get_current_user)])

@app.get("/")
async def root():
    return {
        "app": "ESE NORTE 3 - Analítica de Citas",
        "status": "online",
        "database": "PostgreSQL"
    }
