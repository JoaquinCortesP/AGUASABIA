from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Municipio(Base):
    __tablename__ = "municipios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    region_id = Column(Integer, ForeignKey("regiones.id"), nullable=False)
    comuna_id = Column(Integer, ForeignKey("comunas.id"), nullable=False)

    region = relationship("Region", back_populates="municipios")
    comuna = relationship("Comuna", back_populates="municipios")
    administradores = relationship("Administrador", back_populates="municipio")
    agricultores = relationship("Agricultor", back_populates="municipio")
