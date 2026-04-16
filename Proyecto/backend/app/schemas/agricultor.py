from typing import Optional
from pydantic import BaseModel, EmailStr

class AgricultorBase(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    municipio_id: Optional[int] = None

class AgricultorCreate(AgricultorBase):
    nombre: str
    email: EmailStr
    password: str

class Agricultor(AgricultorBase):
    id: int

    class Config:
        from_attributes = True
