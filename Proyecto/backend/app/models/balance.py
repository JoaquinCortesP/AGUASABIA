from datetime import datetime, date
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class BalanceHidrico(Base):
    __tablename__ = "balances_hidricos"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    et_o = Column(Float, nullable=True)
    evapotranspiracion_real = Column(Float, nullable=True)
    precipitacion = Column(Float, nullable=True)
    riego = Column(Float, nullable=True)
    humedad_suelo = Column(Float, nullable=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_balances_parcela_fecha", "parcela_id", "fecha"),
    )

    parcela = relationship("Parcela", back_populates="balances_hidricos")

    def __repr__(self):
        return f"<BalanceHidrico(id={self.id}, parcela_id={self.parcela_id}, fecha={self.fecha})>"
