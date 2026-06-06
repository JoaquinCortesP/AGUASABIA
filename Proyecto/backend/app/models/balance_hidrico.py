from sqlalchemy import Column, Integer, Float, Date, ForeignKey, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class BalanceHidrico(Base):
    __tablename__ = "balances_hidricos"

    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id"))
    fecha = Column(Date, nullable=False, index=True)
    
    # Variables del balance
    et0 = Column(Float, nullable=True)
    etc = Column(Float, nullable=True)
    evapotranspiracion = Column(Float, nullable=True)
    precipitacion = Column(Float, nullable=True)
    riego_sugerido = Column(Float, nullable=True)
    riego_sugerido_mm = Column(Float, nullable=True)
    litros_recomendados = Column(Float, nullable=True)
    humedad_suelo = Column(Float, nullable=True)
    deficit_hidrico = Column(Float, nullable=True)
    raw = Column(Float, nullable=True)
    taw = Column(Float, nullable=True)
    estado_hidrico = Column(String, nullable=True)

    # Relaciones
    parcela = relationship("Parcela", back_populates="balances")
