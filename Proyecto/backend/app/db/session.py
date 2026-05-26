from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Convertir la URL al formato que usa psycopg3
# psycopg3 usa 'postgresql+psycopg://' en vez de 'postgresql://'
db_url = str(settings.DATABASE_URL).replace(
    "postgresql://", "postgresql+psycopg://"
)

# Engine para conectarse a PostgreSQL
# pool_pre_ping revisa que la conexión esté viva antes de usarla
engine = create_engine(db_url, pool_pre_ping=True)

# SessionLocal es la fábrica de sesiones de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
