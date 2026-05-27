from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security import get_password_hash
from app.models.administrador import Administrador
from app.models.agricultor import Agricultor
from app.schemas.agricultor import Agricultor as AgricultorSchema, AgricultorCreate

router = APIRouter()


@router.get("/", response_model=List[AgricultorSchema])
def read_agricultores(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    return (
        db.query(Agricultor)
        .filter(Agricultor.municipio_id == current_admin.municipio_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=AgricultorSchema)
def create_agricultor(
    *,
    db: Session = Depends(deps.get_db),
    agricultor_in: AgricultorCreate,
    current_admin: Administrador = Depends(deps.get_current_admin),
) -> Any:
    existing = db.query(Agricultor).filter(Agricultor.email == agricultor_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un agricultor con ese email")

    payload = agricultor_in.model_dump(exclude={"password"})
    agricultor = Agricultor(
        **payload,
        hashed_password=get_password_hash(agricultor_in.password),
        municipio_id=current_admin.municipio_id,
    )
    db.add(agricultor)
    db.commit()
    db.refresh(agricultor)
    return agricultor
