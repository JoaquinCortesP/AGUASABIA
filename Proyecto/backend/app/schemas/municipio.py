from pydantic import BaseModel
from typing import Optional


class MunicipioBase(BaseModel):
    nombre: str
    region_id: int
    comuna_id: int


class Municipio(MunicipioBase):
    id: int

    class Config:
        from_attributes = True
