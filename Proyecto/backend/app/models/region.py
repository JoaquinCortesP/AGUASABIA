from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Region(Base):
    __tablename__ = "regiones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)

    # Relaciones
    comunas = relationship("Comuna", back_populates="region")
    municipios = relationship("Municipio", back_populates="region")