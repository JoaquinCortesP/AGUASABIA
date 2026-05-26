from pydantic import BaseModel
from typing import Optional

class ComunaBase(BaseModel):
    nombre: str
    region_id: int
    situacion: Optional[str] = None

class ComunaCreate(ComunaBase):
    pass

class Comuna(ComunaBase):
    id: int

    class Config:
        from_attributes = True
