from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.geometria import Coordenada


class ClimaDiario(BaseModel):
    fecha: date
    latitud: float
    longitud: float
    et0_mm: float
    precipitacion_mm: float
    fuente: str = "Open-Meteo"


class ClimaPoligonoRequest(BaseModel):
    poligono: list[Coordenada] | None = Field(default=None, min_length=3)
    poligono_vertices: list[Coordenada] | None = Field(default=None, min_length=3)

    @model_validator(mode="after")
    def normalizar_poligono(self) -> "ClimaPoligonoRequest":
        if self.poligono is None and self.poligono_vertices is not None:
            self.poligono = self.poligono_vertices
        if not self.poligono or len(self.poligono) < 3:
            raise ValueError("Debe enviar un poligono con al menos 3 vertices")
        return self


class ClimaPoligonoResponse(ClimaDiario):
    centroide: Coordenada


class RecomendacionRiego(BaseModel):
    parcela_id: int
    fecha: date
    latitud: float
    longitud: float
    et0_mm: float
    precipitacion_mm: float
    etc_mm: float
    taw_mm: float
    raw_mm: float
    deficit_hidrico_mm: float
    riego_sugerido_mm: float
    litros_recomendados: float
    estado_hidrico: str
    fuente_clima: str = "Open-Meteo"
    balance_id: Optional[int] = None
