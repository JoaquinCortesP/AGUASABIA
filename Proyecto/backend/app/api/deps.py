from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.models.administrador import Administrador
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

def get_db() -> Generator:
    # Dependencia para inyectar la sesión de base de datos en las rutas
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_admin(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Administrador:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pudo validar las credenciales",
        )
    admin = db.query(Administrador).filter(Administrador.id == token_data.sub).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    return admin
