from sqlalchemy import Column, Date, Float, ForeignKey, Integer, JSON, String, Text
from geoalchemy2 import Geometry

from app.db.base import Base


class Cuenca(Base):
    __tablename__ = "cuencas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    codigo = Column(String, nullable=True, index=True)
    region_id = Column(Integer, ForeignKey("regiones.id"), nullable=True, index=True)
    geometria = Column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    fuente = Column(String, nullable=True)

class Subcuenca(Base):
    __tablename__ = "subcuencas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    codigo = Column(String, nullable=True, index=True)
    cuenca_id = Column(Integer, ForeignKey("cuencas.id"), nullable=True, index=True)
    geometria = Column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    fuente = Column(String, nullable=True)

class DecretoEscasez(Base):
    __tablename__ = "decretos_escasez"

    id = Column(Integer, primary_key=True, index=True)
    numero_decreto = Column(String, nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    region = Column(String, nullable=True)
    geometria = Column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    descripcion = Column(String, nullable=True)


class FuenteHidrica(Base):
    __tablename__ = "fuentes_hidricas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    tipo = Column(String, nullable=False, index=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    geometria = Column(Geometry("GEOMETRY", srid=4326), nullable=True)
    fuente = Column(String, nullable=True)


class IndicadorClimatico(Base):
    __tablename__ = "indicadores_climaticos"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(Integer, ForeignKey("consultas_territoriales.id"), nullable=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    et0_mm = Column(Float, nullable=True)
    precipitacion_mm = Column(Float, nullable=True)
    temperatura_media_c = Column(Float, nullable=True)
    fuente = Column(String, nullable=False)
    datos_json = Column(JSON, nullable=True)


class IndicadorVegetacion(Base):
    __tablename__ = "indicadores_vegetacion"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(Integer, ForeignKey("consultas_territoriales.id"), nullable=True, index=True)
    fecha = Column(Date, nullable=True, index=True)
    ndvi_promedio = Column(Float, nullable=True)
    cobertura_vegetal = Column(String, nullable=True)
    fuente = Column(String, nullable=True)
    datos_json = Column(JSON, nullable=True)


class EventoIncendio(Base):
    __tablename__ = "eventos_incendio"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=True)
    fecha = Column(Date, nullable=True, index=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    severidad = Column(String, nullable=True)
    geometria = Column(Geometry("GEOMETRY", srid=4326), nullable=True)
    fuente = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)


class IndiceSequia(Base):
    __tablename__ = "indices_sequia"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(Integer, ForeignKey("consultas_territoriales.id"), nullable=True, index=True)
    fecha = Column(Date, nullable=True, index=True)
    escala_temporal = Column(String, nullable=True)
    valor = Column(Float, nullable=True)
    categoria = Column(String, nullable=True)
    fuente = Column(String, nullable=True)
    datos_json = Column(JSON, nullable=True)


class EstacionHidrometrica(Base):
    __tablename__ = 'estaciones_hidrometricas'
    
    objectid = Column(Integer, primary_key=True)
    cod_estacion = Column(String(50), nullable=True)
    nombre = Column(String(255), nullable=True)
    tipo_estacion = Column(String(100), nullable=True)
    geom = Column(Geometry('POINT', srid=4326))

