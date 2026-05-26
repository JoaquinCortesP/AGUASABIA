from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.parcela import Parcela
from app.models.agricultor import Agricultor
from app.models.administrador import Administrador
from app.schemas.parcela import Parcela as ParcelaSchema, ParcelaCreate

router = APIRouter()

@router.get("/", response_model=List[ParcelaSchema])
def read_parcelas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    parcelas = (
        db.query(Parcela)
        .filter(Parcela.comuna_id == current_admin.municipio.comuna_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return parcelas

@router.post("/", response_model=ParcelaSchema)
def create_parcela(
    *,
    db: Session = Depends(deps.get_db),
    parcela_in: ParcelaCreate,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    if parcela_in.comuna_id != current_admin.municipio.comuna_id:
        raise HTTPException(
            status_code=400,
            detail="La parcela debe pertenecer a la comuna del municipio del administrador.",
        )

    agricultor = (
        db.query(Agricultor)
        .filter(
            Agricultor.id == parcela_in.agricultor_id,
            Agricultor.municipio_id == current_admin.municipio_id,
        )
        .first()
    )
    if not agricultor:
        raise HTTPException(status_code=404, detail="Agricultor no encontrado en el municipio del admin")

    parcela = Parcela(**parcela_in.model_dump())
    db.add(parcela)
    db.commit()
    db.refresh(parcela)
    return parcela
