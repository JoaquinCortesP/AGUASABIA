from pydantic import BaseModel, Field, model_validator
from typing import Optional

class Coordenada(BaseModel):
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)

class ParcelaBase(BaseModel):
    nombre: str
    agricultor_id: int
    comuna_id: int
    latitud: Optional[float] = Field(default=None, ge=-90, le=90)
    longitud: Optional[float] = Field(default=None, ge=-180, le=180)
    superficie: Optional[float] = Field(default=None, gt=0)
    tipo_cultivo: Optional[str] = None
    poligono_vertices: Optional[list[Coordenada]] = None

class ParcelaCreate(ParcelaBase):
    @model_validator(mode="after")
    def validate_geometry(self) -> "ParcelaCreate":
        has_point = self.latitud is not None and self.longitud is not None
        has_polygon = self.poligono_vertices is not None and len(self.poligono_vertices) >= 3
        if not has_point and not has_polygon:
            raise ValueError("Debe enviar latitud/longitud o un poligono con al menos 3 vertices")
        return self

class ParcelaUpdate(BaseModel):
    nombre: Optional[str] = None
    agricultor_id: Optional[int] = None
    comuna_id: Optional[int] = None
    latitud: Optional[float] = Field(default=None, ge=-90, le=90)
    longitud: Optional[float] = Field(default=None, ge=-180, le=180)
    superficie: Optional[float] = Field(default=None, gt=0)
    tipo_cultivo: Optional[str] = None
    poligono_vertices: Optional[list[Coordenada]] = None

class Parcela(ParcelaBase):
    id: int

    class Config:
        from_attributes = True
