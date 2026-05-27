from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security import get_password_hash
from app.models.administrador import Administrador
from app.models.municipio import Municipio
from app.schemas.administrador import Administrador as AdministradorSchema, AdministradorCreate

router = APIRouter()


@router.post("/register", response_model=AdministradorSchema, status_code=status.HTTP_201_CREATED)
def register_admin(
    *,
    db: Session = Depends(deps.get_db),
    admin_in: AdministradorCreate,
) -> Administrador:
    municipio = db.query(Municipio).filter(Municipio.id == admin_in.municipio_id).first()
    if not municipio:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    existing = db.query(Administrador).filter(Administrador.email == admin_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un administrador con ese email")

    admin = Administrador(
        nombre=admin_in.nombre,
        email=admin_in.email,
        hashed_password=get_password_hash(admin_in.password),
        municipio_id=admin_in.municipio_id,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.get("/me", response_model=AdministradorSchema)
def get_current_admin_info(
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Administrador:
    return current_admin
