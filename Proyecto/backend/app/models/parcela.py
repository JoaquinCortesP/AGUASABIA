from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Parcela(Base):
    __tablename__ = "parcelas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    area = Column(Float, nullable=False)
    cultivo = Column(String(100), nullable=True, index=True)
    agricultor_id = Column(Integer, ForeignKey("agricultores.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_parcelas_agricultor_id", "agricultor_id"),
        Index("ix_parcelas_coordenadas", "latitud", "longitud"),
    )

    agricultor = relationship("Agricultor", back_populates="parcelas")
    balances_hidricos = relationship("BalanceHidrico", back_populates="parcela", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcela(id={self.id}, nombre={self.nombre}, agricultores_id={self.agricultor_id})>"
