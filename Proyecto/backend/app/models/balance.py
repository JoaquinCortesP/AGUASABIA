from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from app.db.base import Base

class BalanceHidrico(Base):
    __tablename__ = "balances_hidricos"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    et_o = Column(Float)
    evapotranspiracion_real = Column(Float)
    precipitacion = Column(Float)
    riego = Column(Float)
    humedad_suelo = Column(Float)
    parcela_id = Column(Integer, ForeignKey("parcelas.id"))
