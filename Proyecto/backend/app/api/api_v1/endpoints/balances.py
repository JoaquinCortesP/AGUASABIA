from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.balance_hidrico import BalanceHidrico
from app.models.parcela import Parcela
from app.models.administrador import Administrador
from app.schemas.balance_hidrico import BalanceHidrico as BalanceSchema, BalanceHidricoCreate

router = APIRouter()

@router.get("/", response_model=List[BalanceSchema])
def read_balances(
    parcela_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    parcela = (
        db.query(Parcela)
        .filter(
            Parcela.id == parcela_id,
            Parcela.comuna_id == current_admin.municipio.comuna_id,
        )
        .first()
    )
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")

    balances = (
        db.query(BalanceHidrico)
        .filter(BalanceHidrico.parcela_id == parcela_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return balances

@router.post("/", response_model=BalanceSchema)
def create_balance(
    *,
    db: Session = Depends(deps.get_db),
    balance_in: BalanceHidricoCreate,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    parcela = (
        db.query(Parcela)
        .filter(
            Parcela.id == balance_in.parcela_id,
            Parcela.comuna_id == current_admin.municipio.comuna_id,
        )
        .first()
    )
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")

    balance = BalanceHidrico(**balance_in.model_dump())
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance
