from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class RegionBase(BaseModel):
    nombre: str
    codigo: str


class RegionCreate(RegionBase):
    pass


class RegionUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo: Optional[str] = None


class Region(RegionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RegionWithComunas(Region):
    comunas: list["Comuna"] = []
