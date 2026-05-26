from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.agricultor import Agricultor
from app.schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # Endpoint de login, recibe email de usuario y contraseña para dar el token
    user = db.query(Agricultor).filter(Agricultor.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
