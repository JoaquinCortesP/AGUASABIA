"""
Script de ingesta para capas DGA (Cuencas, Subcuencas, Decretos de Escasez Hídrica).

Requisitos para usar este script:
1. Instalar dependencias para procesar GeoJSON/Shapefiles:
   pip install geopandas shapely

2. Tener los archivos GeoJSON descargados de la DGA.

Uso:
python scripts/ingest_dga.py path/to/cuencas.geojson cuencas
python scripts/ingest_dga.py path/to/decretos.geojson decretos
"""

import sys
import os
import json
from datetime import datetime

# Añadir el directorio raíz al path para poder importar módulos de la app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from shapely.geometry import shape
from geoalchemy2.elements import WKTElement

from app.db.session import SessionLocal
from app.models.capas_ambientales import Cuenca, Subcuenca, DecretoEscasez

def ingest_cuencas(db: Session, filepath: str):
    """
    Ingesta de Cuencas desde un archivo GeoJSON.
    Se espera que el GeoJSON tenga properties: 'nombre', 'codigo' y 'region_id' (opcional)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for feature in data.get('features', []):
        props = feature.get('properties', {})
        geom = shape(feature['geometry'])
        
        # Transformar a MULTIPOLYGON si es POLYGON para consistencia en PostGIS
        if geom.geom_type == 'Polygon':
            from shapely.geometry import MultiPolygon
            geom = MultiPolygon([geom])
            
        wkt_geom = WKTElement(geom.wkt, srid=4326)
        
        cuenca = Cuenca(
            nombre=props.get('nombre', 'Sin nombre'),
            codigo=props.get('codigo', ''),
            geometria=wkt_geom,
            fuente='DGA'
        )
        db.add(cuenca)
    db.commit()
    print(f"Cuencas ingestadas desde {filepath}")

def ingest_decretos(db: Session, filepath: str):
    """
    Ingesta de Decretos de Escasez Hídrica desde un archivo GeoJSON.
    Properties esperadas: 'numero_decreto', 'fecha_inicio', 'fecha_fin', 'region', 'descripcion'
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for feature in data.get('features', []):
        props = feature.get('properties', {})
        geom = shape(feature['geometry'])
        
        if geom.geom_type == 'Polygon':
            from shapely.geometry import MultiPolygon
            geom = MultiPolygon([geom])
            
        wkt_geom = WKTElement(geom.wkt, srid=4326)
        
        # Parse dates (assuming YYYY-MM-DD format in GeoJSON properties)
        try:
            fecha_inicio = datetime.strptime(props.get('fecha_inicio', '2000-01-01'), "%Y-%m-%d").date()
            fecha_fin = datetime.strptime(props.get('fecha_fin', '2000-01-01'), "%Y-%m-%d").date()
        except ValueError:
            # Fallback for demo purposes
            fecha_inicio = datetime.now().date()
            fecha_fin = datetime.now().date()
            
        decreto = DecretoEscasez(
            numero_decreto=props.get('numero_decreto', 'N/A'),
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            region=props.get('region', 'N/A'),
            descripcion=props.get('descripcion', ''),
            geometria=wkt_geom
        )
        db.add(decreto)
    db.commit()
    print(f"Decretos ingestados desde {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python ingest_dga.py <ruta_archivo.geojson> <tipo_capa>")
        print("Tipos de capa: cuencas, subcuencas, decretos")
        sys.exit(1)
        
    filepath = sys.argv[1]
    tipo_capa = sys.argv[2]
    
    db = SessionLocal()
    try:
        if tipo_capa == "cuencas":
            ingest_cuencas(db, filepath)
        elif tipo_capa == "decretos":
            ingest_decretos(db, filepath)
        else:
            print(f"Tipo de capa '{tipo_capa}' no implementado en el script base.")
    except Exception as e:
        print(f"Error ingestando datos: {e}")
    finally:
        db.close()
