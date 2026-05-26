from pydantic import BaseModel, EmailStr
from typing import Optional

class AgricultorBase(BaseModel):
    nombre: str
    email: EmailStr
    is_active: Optional[bool] = True

class AgricultorCreate(AgricultorBase):
    password: str

class Agricultor(AgricultorBase):
    id: int

    class Config:
        from_attributes = True
