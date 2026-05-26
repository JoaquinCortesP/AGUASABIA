from pydantic import BaseModel
from typing import Optional

class RegionBase(BaseModel):
    nombre: str

class RegionCreate(RegionBase):
    pass

class Region(RegionBase):
    id: int

    class Config:
        from_attributes = True
