from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Comuna(Base):
    __tablename__ = "comunas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    region_id = Column(Integer, ForeignKey("regiones.id"))
    situacion = Column(String, nullable=True) # Ej: "Escasez hídrica"

    # Relaciones
    region = relationship("Region", back_populates="comunas")
    parcelas = relationship("Parcela", back_populates="comuna")
