from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


class ComunaBase(BaseModel):
    id: int
    nombre: str


class AgricultorBase(BaseModel):
    nombre: str
    email: EmailStr
    comuna_id: Optional[int] = None


class AgricultorCreate(AgricultorBase):
    password: str


class AgricultorUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    comuna_id: Optional[int] = None


class Agricultor(AgricultorBase):
    id: int
    created_at: datetime
    updated_at: datetime
    comuna: Optional[ComunaBase] = None

    class Config:
        from_attributes = True
