from typing import Generator
from fastapi import Depends, HTTPException, status
from app.db.session import SessionLocal

def get_db() -> Generator:
    """
    Dependencia de FastAPI para inyectar la sesión de base de datos en las rutas.
    Crea una sesión nueva por cada petición (request) y asegura que se cierre
    al terminar, incluso si ocurre un error (gracias al bloque finally).
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
