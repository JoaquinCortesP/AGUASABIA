from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.administrador import Administrador
from app.schemas.administrador import Administrador as AdministradorSchema
from app.schemas.token import Token

router = APIRouter()


@router.post("/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    admin = db.query(Administrador).filter(Administrador.email == form_data.username).first()
    if not admin or not security.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrecta",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Administrador inactivo")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        admin.id,
        expires_delta=access_token_expires,
        additional_claims={"role": "admin", "municipio_id": admin.municipio_id},
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=AdministradorSchema)
def read_me(current_admin: Administrador = Depends(deps.get_current_admin)) -> Administrador:
    return current_admin
