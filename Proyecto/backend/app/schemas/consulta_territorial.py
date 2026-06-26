from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.schemas.geometria import AreaAnalizada, Coordenada
from app.schemas.modulo_analisis import ModuloAnalisis


ModuloSolicitado = Literal["agua", "clima", "territorio", "vegetacion", "riesgos", "suelo"]
ModoConsulta = Literal["resumen", "avanzado"]


class ConsultaTerritorialRequest(BaseModel):
    poligono: list[Coordenada] | None = Field(default=None, min_length=3)
    poligono_vertices: list[Coordenada] | None = Field(default=None, min_length=3)
    modo: ModoConsulta = "resumen"
    guardar: bool = False
    nombre: str | None = None
    cliente_anonimo_id: str | None = Field(default=None, max_length=128)
    modulos: list[ModuloSolicitado] = Field(
        default_factory=lambda: ["agua", "clima", "territorio", "vegetacion", "riesgos", "suelo"]
    )
    fecha_historica: str | None = Field(default=None, description="Fecha historica para analisis en el pasado (YYYY-MM-DD)")

    @model_validator(mode="after")
    def normalizar_poligono(self) -> "ConsultaTerritorialRequest":
        if self.poligono is None and self.poligono_vertices is not None:
            self.poligono = self.poligono_vertices
        if not self.poligono or len(self.poligono) < 3:
            raise ValueError("Debe enviar un poligono con al menos 3 vertices")
        return self


class ConsultaTerritorialResponse(BaseModel):
    consulta_id: int | None = None
    guardada: bool = False
    modo: ModoConsulta
    modo_avanzado_disponible: bool = True
    modo_avanzado_habilitado: bool = False
    requiere_plan_pago: bool = False
    limite_diario_visitante: int | None = None
    consultas_restantes_visitante: int | None = None
    area: AreaAnalizada
    resumen_general: str
    modulos: dict[str, ModuloAnalisis]


class ConsultaTerritorialListItem(BaseModel):
    id: int
    nombre: str | None = None
    modo: str
    guardada: bool
    resumen_general: str | None = None
    centroide_latitud: float
    centroide_longitud: float
    superficie_aprox_ha: float | None = None
    created_at: datetime

    class Config:
        from_attributes = True
