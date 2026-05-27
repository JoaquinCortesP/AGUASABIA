from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.administrador import Administrador
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/access-token"
)


def get_db() -> Generator:
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

    if token_data.role != "admin" or token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token sin permisos de administrador",
        )

    admin = db.query(Administrador).filter(Administrador.id == int(token_data.sub)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Administrador inactivo")
    return admin


def get_current_user(
    current_admin: Administrador = Depends(get_current_admin),
) -> Administrador:
    # Alias temporal para compatibilidad con endpoints antiguos.
    return current_admin
