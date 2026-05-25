from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Region(Base):
    __tablename__ = "regiones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True, index=True)
    codigo = Column(String(10), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    comunas = relationship("Comuna", back_populates="region", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Region(id={self.id}, nombre={self.nombre}, codigo={self.codigo})>"
