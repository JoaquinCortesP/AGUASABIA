from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.administrador import Administrador
from app.models.agricultor import Agricultor
from app.models.balance_hidrico import BalanceHidrico
from app.models.parcela import Parcela
from app.schemas.balance_hidrico import BalanceHidrico as BalanceSchema, BalanceHidricoCreate

router = APIRouter()


def _ensure_parcela_municipal(db: Session, parcela_id: int, admin: Administrador) -> Parcela:
    parcela = (
        db.query(Parcela)
        .join(Agricultor, Parcela.agricultor_id == Agricultor.id)
        .filter(
            Parcela.id == parcela_id,
            Agricultor.municipio_id == admin.municipio_id,
        )
        .first()
    )
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada en este municipio")
    return parcela


@router.get("/", response_model=List[BalanceSchema])
def read_balances(
    parcela_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    _ensure_parcela_municipal(db, parcela_id, current_admin)
    return (
        db.query(BalanceHidrico)
        .filter(BalanceHidrico.parcela_id == parcela_id)
        .order_by(BalanceHidrico.fecha.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=BalanceSchema)
def create_balance(
    *,
    db: Session = Depends(deps.get_db),
    balance_in: BalanceHidricoCreate,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    _ensure_parcela_municipal(db, balance_in.parcela_id, current_admin)
    balance = BalanceHidrico(**balance_in.model_dump())
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance
