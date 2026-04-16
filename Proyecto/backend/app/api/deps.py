from typing import Generator
from fastapi import Depends, HTTPException, status
from app.db.session import SessionLocal

def get_db() -> Generator:
    """
    Dependencia para obtener la sesión de base de datos.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
