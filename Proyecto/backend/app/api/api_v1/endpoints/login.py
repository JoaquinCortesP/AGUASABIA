from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.administrador import Administrador
from app.schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    admin = db.query(Administrador).filter(Administrador.email == form_data.username).first()
    if not admin or not security.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    elif not admin.is_active:
        raise HTTPException(status_code=400, detail="Administrador inactivo")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            admin.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
