from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Agricultor(Base):
    __tablename__ = "agricultores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    comuna_id = Column(Integer, ForeignKey("comunas.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    comuna = relationship("Comuna", back_populates="agricultores")
    parcelas = relationship("Parcela", back_populates="agricultor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Agricultor(id={self.id}, nombre={self.nombre}, email={self.email})>"
