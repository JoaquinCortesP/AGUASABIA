from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class ConsultaTerritorial(Base):
    __tablename__ = "consultas_territoriales"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    visitor_key = Column(String, nullable=True, index=True)
    nombre = Column(String, nullable=True)
    poligono = Column(JSON, nullable=False)
    centroide_latitud = Column(Float, nullable=False)
    centroide_longitud = Column(Float, nullable=False)
    bbox = Column(JSON, nullable=False)
    superficie_aprox_ha = Column(Float, nullable=True)
    modo = Column(String, default="resumen", nullable=False)
    guardada = Column(Boolean, default=False, nullable=False)
    resumen_general = Column(Text, nullable=True)
    resultado_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    usuario = relationship("Usuario", back_populates="consultas")
    resultados_modulos = relationship(
        "ResultadoConsultaModulo",
        back_populates="consulta",
        cascade="all, delete-orphan",
    )


class ResultadoConsultaModulo(Base):
    __tablename__ = "resultados_consulta_modulos"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(Integer, ForeignKey("consultas_territoriales.id"), nullable=False, index=True)
    tipo_modulo = Column(String, nullable=False, index=True)
    estado = Column(String, nullable=False)
    titulo = Column(String, nullable=False)
    explicacion = Column(Text, nullable=False)
    datos = Column(JSON, nullable=True)
    fuentes = Column(JSON, nullable=True)
    avanzado = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    consulta = relationship("ConsultaTerritorial", back_populates="resultados_modulos")
