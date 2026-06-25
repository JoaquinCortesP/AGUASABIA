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

    import random
    verification_code = f"{random.randint(100000, 999999)}"
    
    usuario = Usuario(
        nombre=usuario_in.nombre,
        email=usuario_in.email,
        hashed_password=security.get_password_hash(usuario_in.password),
        plan="gratis",
        is_active=True,
        is_verified=False,
        verification_code=verification_code,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    # Imprimir código en consola
    print("\n" + "="*80)
    print(f">>> CODIGO DE VERIFICACION PARA ({usuario.email}): {verification_code} <<<")
    print("="*80 + "\n")
    
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
    code: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.verification_code != code:
        raise HTTPException(status_code=400, detail="Codigo de verificacion incorrecto")
    
    usuario.is_verified = True
    usuario.verification_code = None
    db.commit()
    return {"msg": "Correo verificado exitosamente"}


@router.post("/change-plan")
def change_plan(
    plan: str,
    db: Session = Depends(deps.get_db),
    current_usuario: Usuario = Depends(deps.get_current_usuario),
) -> Any:
    if plan not in ["gratis", "pro", "municipal"]:
        raise HTTPException(status_code=400, detail="Plan no valido")
    current_usuario.plan = plan
    db.commit()
    return {"msg": f"Plan actualizado a {plan} exitosamente", "plan": plan}
