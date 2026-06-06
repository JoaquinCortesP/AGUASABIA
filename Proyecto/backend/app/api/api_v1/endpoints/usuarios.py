from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.usuario import Usuario
from app.schemas.token import Token
from app.schemas.usuario import Usuario as UsuarioSchema, UsuarioCreate, UsuarioLogin

router = APIRouter()


@router.post("/register", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
def register_usuario(
    *,
    db: Session = Depends(deps.get_db),
    usuario_in: UsuarioCreate,
) -> Usuario:
    existing = db.query(Usuario).filter(Usuario.email == usuario_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email")

    usuario = Usuario(
        nombre=usuario_in.nombre,
        email=usuario_in.email,
        hashed_password=security.get_password_hash(usuario_in.password),
        plan="gratis",
        is_active=True,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=Token)
def login_usuario(
    *,
    db: Session = Depends(deps.get_db),
    usuario_in: UsuarioLogin,
) -> Any:
    usuario = db.query(Usuario).filter(Usuario.email == usuario_in.email).first()
    if not usuario or not security.verify_password(usuario_in.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not usuario.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            usuario.id,
            expires_delta=access_token_expires,
            additional_claims={"role": "usuario", "plan": usuario.plan},
        ),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UsuarioSchema)
def read_usuario_me(
    current_usuario: Usuario = Depends(deps.get_current_usuario),
) -> Usuario:
    return current_usuario
