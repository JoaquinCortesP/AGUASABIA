from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.balance_hidrico import BalanceHidrico
from app.models.agricultor import Agricultor
from app.schemas.balance_hidrico import BalanceHidrico as BalanceSchema, BalanceHidricoCreate

router = APIRouter()

@router.get("/", response_model=List[BalanceSchema])
def read_balances(
    parcela_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Agricultor = Depends(deps.get_current_user),
) -> Any:
    # Devuelve el balance hídrico para una parcela específica
    # TODO: Validar que la parcela_id pertenezca al current_user
    balances = db.query(BalanceHidrico).filter(BalanceHidrico.parcela_id == parcela_id).offset(skip).limit(limit).all()
    return balances

@router.post("/", response_model=BalanceSchema)
def create_balance(
    *,
    db: Session = Depends(deps.get_db),
    balance_in: BalanceHidricoCreate,
    current_user: Agricultor = Depends(deps.get_current_user),
) -> Any:
    # Crea un nuevo balance (generalmente esto lo haría una tarea asíncrona)
    balance = BalanceHidrico(**balance_in.model_dump())
    db.add(balance)
    db.commit()
    db.refresh(balance)
    return balance
