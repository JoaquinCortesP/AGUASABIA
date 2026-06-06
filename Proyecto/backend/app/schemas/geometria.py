from pydantic import BaseModel, Field


class Coordenada(BaseModel):
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)


class BBox(BaseModel):
    min_latitud: float
    min_longitud: float
    max_latitud: float
    max_longitud: float


class AreaAnalizada(BaseModel):
    centroide: Coordenada
    bbox: BBox
    superficie_aprox_ha: float | None = None
