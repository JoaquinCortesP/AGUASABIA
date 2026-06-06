from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Agricultor(Base):
    __tablename__ = "agricultores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    municipio_id = Column(Integer, ForeignKey("municipios.id"), nullable=True)
    municipio = relationship("Municipio", back_populates="agricultores")
    parcelas = relationship("Parcela", back_populates="agricultor")
