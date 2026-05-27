from pydantic import BaseModel
from datetime import date
from typing import Optional

class BalanceHidricoBase(BaseModel):
    parcela_id: int
    fecha: date
    et0: Optional[float] = None
    etc: Optional[float] = None
    evapotranspiracion: Optional[float] = None
    precipitacion: Optional[float] = None
    riego_sugerido: Optional[float] = None
    riego_sugerido_mm: Optional[float] = None
    litros_recomendados: Optional[float] = None
    humedad_suelo: Optional[float] = None
    deficit_hidrico: Optional[float] = None
    raw: Optional[float] = None
    taw: Optional[float] = None
    estado_hidrico: Optional[str] = None

class BalanceHidricoCreate(BalanceHidricoBase):
    pass

class BalanceHidrico(BalanceHidricoBase):
    id: int

    class Config:
        from_attributes = True
