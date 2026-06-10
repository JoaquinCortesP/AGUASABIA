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
        is_verified=False, # TODO: Send verification email
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    # Placeholder for email sending service (e.g., SendGrid/Resend)
    print(f"ENVIANDO EMAIL DE VERIFICACION A: {usuario.email}")
    
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
    if not usuario.is_verified:
        raise HTTPException(status_code=403, detail="Por favor verifica tu correo electronico antes de iniciar sesion")

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

@router.post("/verify-email")
def verify_email(
    email: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    # This is a placeholder endpoint. In a real app, it would take a token, not an email directly.
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    usuario.is_verified = True
    db.commit()
    return {"msg": "Correo verificado exitosamente"}
