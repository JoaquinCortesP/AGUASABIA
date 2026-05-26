from pydantic import BaseModel
from datetime import date
from typing import Optional

class BalanceHidricoBase(BaseModel):
    parcela_id: int
    fecha: date
    evapotranspiracion: Optional[float] = None
    precipitacion: Optional[float] = None
    riego_sugerido: Optional[float] = None
    humedad_suelo: Optional[float] = None

class BalanceHidricoCreate(BalanceHidricoBase):
    pass

class BalanceHidrico(BalanceHidricoBase):
    id: int

    class Config:
        from_attributes = True
