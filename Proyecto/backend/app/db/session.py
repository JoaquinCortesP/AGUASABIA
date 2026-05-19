from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Crea el motor de base de datos que maneja la conexión con PostgreSQL
# NOTA: Importante usar DATABASE_URL aquí como está definido en config.py
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# SessionLocal es una fábrica de sesiones, generará nuevas transacciones a la base de datos.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
