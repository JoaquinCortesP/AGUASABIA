from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class RegionBase(BaseModel):
    id: int
    nombre: str


class ComunaBase(BaseModel):
    nombre: str
    region_id: int


class ComunaCreate(ComunaBase):
    pass


class ComunaUpdate(BaseModel):
    nombre: Optional[str] = None
    region_id: Optional[int] = None


class Comuna(ComunaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    region: Optional[RegionBase] = None

    class Config:
        from_attributes = True
