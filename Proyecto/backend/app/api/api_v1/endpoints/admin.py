from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.administrador import Administrador
from app.models.agricultor import Agricultor
from app.schemas.agricultor import Agricultor as AgricultorSchema, AgricultorCreate

router = APIRouter()


@router.get("/me")
def get_current_admin_info(current_admin: Administrador = Depends(deps.get_current_admin)):
    """
    Obtener información del administrador actual.
    """
    return {
        "id": current_admin.id,
        "nombre": current_admin.nombre,
        "email": current_admin.email,
        "municipio_id": current_admin.municipio_id,
    }


@router.post("/agricultores", response_model=AgricultorSchema)
def create_agricultor(
    agricultor_data: AgricultorCreate,
    db: Session = Depends(deps.get_db),
    current_admin: Administrador = Depends(deps.get_current_admin),
):
    """
    Crear un nuevo agricultor (solo admin).
    """
    # Verificar que el agricultor pertenezca al municipio del admin
    if agricultor_data.municipio_id != current_admin.municipio_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes crear agricultores en tu municipio",
        )
    
    # Verificar email único
    existing = db.query(Agricultor).filter(Agricultor.email == agricultor_data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya existe")
    
    # Crear agricultor
    from app.core.security import get_password_hash
    agricultor = Agricultor(
        nombre=agricultor_data.nombre,
        email=agricultor_data.email,
        hashed_password=get_password_hash(agricultor_data.password),
        municipio_id=agricultor_data.municipio_id,
    )
    db.add(agricultor)
    db.commit()
    db.refresh(agricultor)
    
    return agricultor


@router.get("/agricultores")
def list_agricultores(
    db: Session = Depends(deps.get_db),
    current_admin: Administrador = Depends(deps.get_current_admin),
):
    """
    Listar todos los agricultores del municipio del admin.
    """
    agricultores = db.query(Agricultor).filter(
        Agricultor.municipio_id == current_admin.municipio_id
    ).all()
    return agricultores