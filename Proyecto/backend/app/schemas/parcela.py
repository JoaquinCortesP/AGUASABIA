from typing import Optional
from pydantic import BaseModel

class ParcelaBase(BaseModel):
    nombre: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    area: Optional[float] = None
    cultivo: Optional[str] = None

class ParcelaCreate(ParcelaBase):
    nombre: str
    agricultor_id: int

class Parcela(ParcelaBase):
    id: int
    agricultor_id: int

    class Config:
        from_attributes = True
