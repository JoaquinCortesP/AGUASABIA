from sqlalchemy import Column, Float, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Parcela(Base):
    __tablename__ = "parcelas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"))
    comuna_id = Column(Integer, ForeignKey("comunas.id"))
    
    # Coordenadas geográficas
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    
    # Datos agronómicos
    superficie = Column(Float, nullable=True) # en hectáreas
    tipo_cultivo = Column(String, nullable=True)

    # Relaciones
    agricultor = relationship("Agricultor", back_populates="parcelas")
    comuna = relationship("Comuna", back_populates="parcelas")
    balances_hidricos = relationship("BalanceHidrico", back_populates="parcela")
