from pydantic import BaseModel, EmailStr


class AdministradorBase(BaseModel):
    nombre: str
    email: EmailStr
    is_active: bool = True
    municipio_id: int


class AdministradorCreate(AdministradorBase):
    password: str


class Administrador(AdministradorBase):
    id: int

    class Config:
        from_attributes = True
