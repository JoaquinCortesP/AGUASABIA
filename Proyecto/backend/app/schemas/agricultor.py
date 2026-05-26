from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr


class AgricultorBase(BaseModel):
    nombre: str
    email: EmailStr
    is_active: Optional[bool] = True


class AgricultorCreate(AgricultorBase):
    password: str


class Agricultor(AgricultorBase):
    id: int
    municipio_id: Optional[int] = None

    class Config:
        from_attributes = True


class AgricultorWithParcelas(Agricultor):
    parcelas: list["Parcela"] = []

    class Config:
        from_attributes = True
