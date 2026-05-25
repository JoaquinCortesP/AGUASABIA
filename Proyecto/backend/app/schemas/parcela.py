from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ParcelaBase(BaseModel):
    nombre: str
    latitud: float
    longitud: float
    area: float
    cultivo: Optional[str] = None
    agricultor_id: int


class ParcelaCreate(BaseModel):
    nombre: str
    latitud: float
    longitud: float
    area: float
    cultivo: Optional[str] = None
    agricultor_id: int


class ParcelaUpdate(BaseModel):
    nombre: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    area: Optional[float] = None
    cultivo: Optional[str] = None


class Parcela(ParcelaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
