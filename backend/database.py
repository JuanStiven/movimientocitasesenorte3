import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL de conexión a la base de datos (PostgreSQL por defecto, fallback SQLite)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://esenorte3_user:esenorte3_password@localhost:5432/esenorte3_db"
)

# Intentar usar PostgreSQL; fallback a SQLite local si no está PostgreSQL encendido localmente
try:
    if "postgresql" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True
        )
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
except Exception as e:
    print(f"[Database] Fallback a SQLite local por error de conexión: {e}")
    engine = create_engine("sqlite:///./esenorte3_local.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
