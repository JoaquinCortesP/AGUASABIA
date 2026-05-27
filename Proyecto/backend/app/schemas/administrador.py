from pydantic import BaseModel, EmailStr
from typing import Optional


class AdministradorBase(BaseModel):
    nombre: str
    email: EmailStr
    municipio_id: int


class AdministradorCreate(AdministradorBase):
    password: str


class Administrador(AdministradorBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True