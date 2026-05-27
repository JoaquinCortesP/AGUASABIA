from pydantic import BaseModel, EmailStr
from typing import Optional

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
