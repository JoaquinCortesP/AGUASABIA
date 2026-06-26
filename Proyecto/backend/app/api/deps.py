from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.administrador import Administrador
from app.models.usuario import Usuario
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)
optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/usuarios/login",
    auto_error=False,
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
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
        )

    if token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin subject",
        )

    admin = None
    if token_data.sub.isdigit():
        admin = db.query(Administrador).filter(Administrador.id == int(token_data.sub)).first()
    else:
        admin = db.query(Administrador).filter(Administrador.email == token_data.sub).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador no encontrado",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrador inactivo",
        )

    return admin


def _decode_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return TokenPayload(**payload)
    except Exception as e:
        print(f"ERROR DECODING TOKEN: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
        )


def get_current_usuario(
    db: Session = Depends(get_db), token: str = Depends(optional_oauth2)
) -> Usuario:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no autenticado",
        )

    token_data = _decode_token(token)
    role = getattr(token_data, "role", None)
    if role not in ("usuario", "admin", None) or token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido",
        )

    if not token_data.sub.isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de usuario invalido",
        )

    if token_data.role == "admin":
        # Devolver un objeto compatible o el propio admin
        admin = db.query(Administrador).filter(Administrador.id == int(token_data.sub)).first()
        if not admin or not admin.is_active:
            raise HTTPException(status_code=404, detail="Admin no encontrado")
        # Duck typing: current_usuario needs id, plan, role for most things
        admin.plan = "pro"
        return admin

    usuario = db.query(Usuario).filter(Usuario.id == int(token_data.sub)).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not usuario.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return usuario


def get_optional_usuario(
    db: Session = Depends(get_db), token: str | None = Depends(optional_oauth2)
) -> Usuario | None:
    if not token:
        return None

    try:
        token_data = _decode_token(token)
    except Exception:
        return None

    if not token_data.sub or not token_data.sub.isdigit():
        return None

    if token_data.role == "admin":
        admin = db.query(Administrador).filter(Administrador.id == int(token_data.sub)).first()
        if not admin or not admin.is_active:
            return None
        admin.plan = "pro"
        return admin

    usuario = db.query(Usuario).filter(Usuario.id == int(token_data.sub)).first()
    if not usuario or not usuario.is_active:
        return None
    return usuario

