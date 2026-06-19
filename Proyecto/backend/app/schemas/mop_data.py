from typing import Optional
from pydantic import BaseModel, Field

class EstacionSchema(BaseModel):
    objectid: int = Field(..., alias="OBJECTID")
    cod_estacion: Optional[str] = Field(None, alias="COD_ESTACION")
    nombre: Optional[str] = Field(None, alias="NOM_ESTACION")
    
    class Config:
        populate_by_name = True
