from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class BalanceHidrico(Base):
    __tablename__ = "balances_hidricos"

    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id"))
    fecha = Column(Date, nullable=False, index=True)
    
    # Variables del balance
    evapotranspiracion = Column(Float, nullable=True)
    precipitacion = Column(Float, nullable=True)
    riego_sugerido = Column(Float, nullable=True)
    humedad_suelo = Column(Float, nullable=True)

    # Relaciones
    parcela = relationship("Parcela", back_populates="balances_hidricos")
