from datetime import datetime

from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str | None = None


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class Usuario(UsuarioBase):
    id: int
    plan: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
