from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.parcela import Parcela
from app.models.agricultor import Agricultor
from app.schemas.parcela import Parcela as ParcelaSchema, ParcelaCreate

router = APIRouter()

@router.get("/", response_model=List[ParcelaSchema])
def read_parcelas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Agricultor = Depends(deps.get_current_user),
) -> Any:
    # Devuelve las parcelas del agricultor conectado
    parcelas = db.query(Parcela).filter(Parcela.agricultor_id == current_user.id).offset(skip).limit(limit).all()
    return parcelas

@router.post("/", response_model=ParcelaSchema)
def create_parcela(
    *,
    db: Session = Depends(deps.get_db),
    parcela_in: ParcelaCreate,
    current_user: Agricultor = Depends(deps.get_current_user),
) -> Any:
    # Crea una nueva parcela para el agricultor conectado
    parcela = Parcela(**parcela_in.model_dump(), agricultor_id=current_user.id)
    db.add(parcela)
    db.commit()
    db.refresh(parcela)
    return parcela
