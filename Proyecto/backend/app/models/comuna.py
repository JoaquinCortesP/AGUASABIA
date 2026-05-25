from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Comuna(Base):
    __tablename__ = "comunas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey("regiones.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("nombre", "region_id", name="uq_comuna_nombre_region"),
    )

    region = relationship("Region", back_populates="comunas")
    agricultores = relationship("Agricultor", back_populates="comuna", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Comuna(id={self.id}, nombre={self.nombre}, region_id={self.region_id})>"
