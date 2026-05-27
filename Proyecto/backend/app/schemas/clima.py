from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.parcela import Coordenada


class ClimaDiario(BaseModel):
    fecha: date
    latitud: float
    longitud: float
    et0_mm: float
    precipitacion_mm: float
    fuente: str = "Open-Meteo"


class ClimaPoligonoRequest(BaseModel):
    poligono_vertices: list[Coordenada] = Field(..., min_length=3)


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
