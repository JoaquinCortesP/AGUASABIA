from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr


class AgricultorBase(BaseModel):
    nombre: str
    email: EmailStr
    is_active: Optional[bool] = True


class AgricultorCreate(AgricultorBase):
    password: str

class AgricultorUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class Agricultor(AgricultorBase):
    id: int
    municipio_id: Optional[int] = None

    class Config:
        from_attributes = True
