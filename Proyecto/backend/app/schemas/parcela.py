from pydantic import BaseModel
from typing import Optional

class ParcelaBase(BaseModel):
    nombre: str
    agricultor_id: int
    comuna_id: int
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    superficie: Optional[float] = None
    tipo_cultivo: Optional[str] = None

class ParcelaCreate(ParcelaBase):
    pass

class Parcela(ParcelaBase):
    id: int

    class Config:
        from_attributes = True
