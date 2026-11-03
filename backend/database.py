import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL de conexión a la base de datos.
# Se fuerza psycopg2 de forma explícita: en SQLAlchemy >= 2.1 una URL
# "postgresql://" intenta importar psycopg (v3) y, al no estar instalado,
# la aplicación terminaba cayendo a SQLite en silencio (base vacía).
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://esenorte3_user:esenorte3_password@localhost:5432/esenorte3_db"
)

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

if "postgresql" in DATABASE_URL:
    # Sin fallback silencioso: si PostgreSQL no responde, la app debe fallar de
    # forma visible en vez de servir una base SQLite vacía como si nada.
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
