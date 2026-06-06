from typing import Any, Literal

from pydantic import BaseModel, Field


EstadoModulo = Literal["normal", "moderado", "alto", "informativo", "pendiente", "no_disponible"]


class FuenteDato(BaseModel):
    nombre: str
    tipo: str
    descripcion: str | None = None
    url: str | None = None


class ModuloAnalisis(BaseModel):
    estado: EstadoModulo
    titulo: str
    explicacion: str
    datos: dict[str, Any] = Field(default_factory=dict)
    fuentes: list[FuenteDato] = Field(default_factory=list)
    avanzado: dict[str, Any] = Field(default_factory=dict)
    avanzado_restringido: bool = False
