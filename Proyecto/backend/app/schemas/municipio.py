from pydantic import BaseModel


class MunicipioBase(BaseModel):
    nombre: str
    region_id: int
    comuna_id: int


class MunicipioCreate(MunicipioBase):
    pass


class Municipio(MunicipioBase):
    id: int

    class Config:
        from_attributes = True
