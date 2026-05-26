from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine para conectarse a PostgreSQL
# Utilizamos pool_pre_ping para revisar la conexión antes de usarla
engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True)

# SessionLocal será la clase para instanciar sesiones de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
