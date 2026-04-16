from datetime import date
from typing import Optional
from pydantic import BaseModel

class BalanceHidricoBase(BaseModel):
    fecha: Optional[date] = None
    et_o: Optional[float] = None
    evapotranspiracion_real: Optional[float] = None
    precipitacion: Optional[float] = None
    riego: Optional[float] = None
    humedad_suelo: Optional[float] = None

class BalanceHidricoCreate(BalanceHidricoBase):
    fecha: date
    parcela_id: int

class BalanceHidrico(BalanceHidricoBase):
    id: int
    parcela_id: int

    class Config:
        from_attributes = True
