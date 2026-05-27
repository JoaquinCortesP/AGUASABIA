from sqlalchemy import Column, ForeignKey, Integer, String, Float, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Parcela(Base):
    __tablename__ = "parcelas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    superficie = Column(Float, nullable=True)
    tipo_cultivo = Column(String, nullable=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    poligono_vertices = Column(JSON, nullable=True)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id"), nullable=True)
    comuna_id = Column(Integer, ForeignKey("comunas.id"), nullable=True)

    agricultor = relationship("Agricultor", back_populates="parcelas")
    comuna = relationship("Comuna", back_populates="parcelas")
    balances = relationship("BalanceHidrico", back_populates="parcela")
