from datetime import date
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_admin, get_db
from app.core import security
from app.models.administrador import Administrador
from app.models.agricultor import Agricultor
from app.models.parcela import Parcela
from app.models.balance_hidrico import BalanceHidrico
from app.schemas.agricultor import AgricultorCreate
from app.schemas.parcela import ParcelaCreate, Parcela as ParcelaSchema
from app.schemas.balance_hidrico import BalanceHidrico as BalanceSchema
from app.schemas.administrador import Administrador as AdministradorSchema
from app.services.agronomico import AgronomicoService

router = APIRouter()


@router.get("/me", response_model=AdministradorSchema)
def read_current_admin(current_admin: Administrador = Depends(get_current_admin)) -> Any:
    return current_admin


class AgricultorWithParcelaCreate(AgricultorCreate):
    parcela: ParcelaCreate


@router.post("/agricultores", response_model=Any)
def create_agricultor(
    *,
    db: Session = Depends(get_db),
    payload: AgricultorWithParcelaCreate,
    current_admin: Administrador = Depends(get_current_admin),
) -> Any:
    if payload.parcela.comuna_id != current_admin.municipio.comuna_id:
        raise HTTPException(
            status_code=400,
            detail="La parcela debe pertenecer a la comuna del municipio del administrador.",
        )

    existing = db.query(Agricultor).filter(Agricultor.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El agricultor ya existe.")

    hashed_password = security.get_password_hash(payload.password)
    agricultor = Agricultor(
        nombre=payload.nombre,
        email=payload.email,
        hashed_password=hashed_password,
        is_active=True,
        municipio_id=current_admin.municipio_id,
    )
    db.add(agricultor)
    db.commit()
    db.refresh(agricultor)

    parcela = Parcela(**payload.parcela.model_dump(), agricultor_id=agricultor.id)
    db.add(parcela)
    db.commit()
    db.refresh(parcela)

    balance_data = AgronomicoService.crear_balance_inicial(parcela, date.today())
    balance = BalanceHidrico(**balance_data, parcela_id=parcela.id)
    db.add(balance)
    db.commit()
    db.refresh(balance)

    return {
        "agricultor": {
            "id": agricultor.id,
            "nombre": agricultor.nombre,
            "email": agricultor.email,
            "municipio_id": agricultor.municipio_id,
        },
        "parcela": {
            "id": parcela.id,
            "nombre": parcela.nombre,
            "superficie": parcela.superficie,
            "tipo_cultivo": parcela.tipo_cultivo,
            "latitud": parcela.latitud,
            "longitud": parcela.longitud,
            "comuna_id": parcela.comuna_id,
        },
        "balance_inicial": {
            "id": balance.id,
            "fecha": balance.fecha,
            "evapotranspiracion": balance.evapotranspiracion,
            "precipitacion": balance.precipitacion,
            "riego_sugerido": balance.riego_sugerido,
            "humedad_suelo": balance.humedad_suelo,
        },
    }


@router.get("/agricultores", response_model=List[Any])
def read_agricultores(
    db: Session = Depends(get_db),
    current_admin: Administrador = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    agricultores = (
        db.query(Agricultor)
        .filter(Agricultor.municipio_id == current_admin.municipio_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": a.id,
            "nombre": a.nombre,
            "email": a.email,
            "is_active": a.is_active,
            "municipio_id": a.municipio_id,
        }
        for a in agricultores
    ]
