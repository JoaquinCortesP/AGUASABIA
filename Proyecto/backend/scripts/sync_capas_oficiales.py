import asyncio
import logging
import random
import os
import sys
from typing import List, Dict, Any

import httpx
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import orient
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

# Add the root project directory to the path so that app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.capas_ambientales import (
    AcuiferoProtegido, 
    AreaRestriccionProhibicion, 
    DeclaracionAgotamiento, 
    DecretoCaudalReserva,
    DecretoEscasez
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sync-capas")

def esri_to_shapely_multipolygon(esri_geom: Dict[str, Any]):
    """Convierte geometría Esri JSON (rings) a MultiPolygon WKT."""
    if not esri_geom or "rings" not in esri_geom:
        return None
    try:
        polys = []
        for ring in esri_geom["rings"]:
            if len(ring) >= 3:
                poly = Polygon(ring)
                polys.append(orient(poly, sign=1.0))
        if not polys:
            return None
        return MultiPolygon(polys)
    except Exception as e:
        logger.error(f"Error procesando geometria Esri: {e}")
        return None

async def fetch_layer_data(client: httpx.AsyncClient, service_name: str, out_fields: str):
    logger.info(f"Obteniendo OIDs de {service_name}...")
    query_url = f"https://rest-sit.mop.gob.cl/arcgis/rest/services/{service_name}/MapServer/0/query"
    
    discovery_payload = {'where': '1=1', 'returnIdsOnly': 'true', 'f': 'json'}
    response = await client.post(query_url, data=discovery_payload, timeout=30.0)
    response.raise_for_status()
    object_ids = response.json().get("objectIds", [])
    
    if not object_ids:
        logger.info(f"No hay registros para {service_name}.")
        return []
        
    logger.info(f"{len(object_ids)} registros en {service_name}. Descargando geometria...")
    
    chunk_size = 500
    chunks = [object_ids[i:i + chunk_size] for i in range(0, len(object_ids), chunk_size)]
    all_features = []
    
    for chunk in chunks:
        payload = {
            'objectIds': ','.join(map(str, chunk)),
            'outFields': out_fields,
            'returnGeometry': 'true',
            'outSR': '4326',
            'f': 'json'
        }
        for attempt in range(3):
            try:
                res = await client.post(query_url, data=payload, timeout=45.0)
                data = res.json()
                if "error" in data:
                    raise Exception(data["error"]["message"])
                all_features.extend(data.get("features", []))
                break
            except Exception as e:
                await asyncio.sleep(random.uniform(2.0, 5.0))
    return all_features


async def run_sync():
    db = SessionLocal()
    try:
        async with httpx.AsyncClient() as client:
            
            # 1. Acuiferos Protegidos
            features = await fetch_layer_data(client, 'DGA/Acuiferos_Protegidos', 'OBJECTID,NOM_VEGA,REGION')
            for f in features:
                attrs = f.get("attributes", {})
                geom = esri_to_shapely_multipolygon(f.get("geometry", {}))
                if geom:
                    stmt = insert(AcuiferoProtegido).values(
                        objectid=attrs.get("OBJECTID"),
                        nombre=attrs.get("NOM_VEGA"),
                        region=attrs.get("REGION"),
                        geom=f"SRID=4326;{geom.wkt}"
                    ).on_conflict_do_update(
                        index_elements=['objectid'],
                        set_={'nombre': attrs.get("NOM_VEGA"), 'geom': f"SRID=4326;{geom.wkt}"}
                    )
                    db.execute(stmt)
            db.commit()

            # 2. Areas de Restriccion y Zonas de Prohibicion
            features = await fetch_layer_data(client, 'DGA/Areas_de_Restriccion_y_Zonas_de_Prohibicion', 'OBJECTID,NOM_BNA,NOM_ACUIF,TIPO_LIMIT')
            for f in features:
                attrs = f.get("attributes", {})
                geom = esri_to_shapely_multipolygon(f.get("geometry", {}))
                if geom:
                    nombre = attrs.get("NOM_BNA") or attrs.get("NOM_ACUIF")
                    stmt = insert(AreaRestriccionProhibicion).values(
                        objectid=attrs.get("OBJECTID"),
                        nombre=nombre,
                        tipo=attrs.get("TIPO_LIMIT"),
                        geom=f"SRID=4326;{geom.wkt}"
                    ).on_conflict_do_update(
                        index_elements=['objectid'],
                        set_={'nombre': nombre, 'tipo': attrs.get("TIPO_LIMIT"), 'geom': f"SRID=4326;{geom.wkt}"}
                    )
                    db.execute(stmt)
            db.commit()

            # 3. Declaracion de Agotamiento
            features = await fetch_layer_data(client, 'DGA/Declaracion_de_Agotamiento', 'OBJECTID,NOM_AGOTA')
            for f in features:
                attrs = f.get("attributes", {})
                geom = esri_to_shapely_multipolygon(f.get("geometry", {}))
                if geom:
                    stmt = insert(DeclaracionAgotamiento).values(
                        objectid=attrs.get("OBJECTID"),
                        nombre=attrs.get("NOM_AGOTA"),
                        geom=f"SRID=4326;{geom.wkt}"
                    ).on_conflict_do_update(
                        index_elements=['objectid'],
                        set_={'nombre': attrs.get("NOM_AGOTA"), 'geom': f"SRID=4326;{geom.wkt}"}
                    )
                    db.execute(stmt)
            db.commit()

            # 4. Decretos Caudales de Reserva
            features = await fetch_layer_data(client, 'DGA/Decretos_Caudales_de_Reserva', 'OBJECTID,NOM_RESERVA')
            for f in features:
                attrs = f.get("attributes", {})
                geom = esri_to_shapely_multipolygon(f.get("geometry", {}))
                if geom:
                    stmt = insert(DecretoCaudalReserva).values(
                        objectid=attrs.get("OBJECTID"),
                        nombre=attrs.get("NOM_RESERVA"),
                        geom=f"SRID=4326;{geom.wkt}"
                    ).on_conflict_do_update(
                        index_elements=['objectid'],
                        set_={'nombre': attrs.get("NOM_RESERVA"), 'geom': f"SRID=4326;{geom.wkt}"}
                    )
                    db.execute(stmt)
            db.commit()

            # 5. Decretos Escasez
            features = await fetch_layer_data(client, 'DGA/Decretos_Escasez_Hidrica', 'OBJECTID,NUM_DECRETO,REGION,FECHA_INICIO,FECHA_FIN')
            for f in features:
                attrs = f.get("attributes", {})
                geom = esri_to_shapely_multipolygon(f.get("geometry", {}))
                if geom:
                    from datetime import datetime
                    
                    f_ini = attrs.get("FECHA_INICIO")
                    f_fin = attrs.get("FECHA_FIN")
                    dt_ini = datetime.utcfromtimestamp(f_ini/1000).date() if f_ini else datetime.now().date()
                    dt_fin = datetime.utcfromtimestamp(f_fin/1000).date() if f_fin else datetime.now().date()
                    
                    stmt = insert(DecretoEscasez).values(
                        id=attrs.get("OBJECTID"),
                        numero_decreto=str(attrs.get("NUM_DECRETO")),
                        fecha_inicio=dt_ini,
                        fecha_fin=dt_fin,
                        region=attrs.get("REGION"),
                        geom=f"SRID=4326;{geom.wkt}"
                    ).on_conflict_do_update(
                        index_elements=['id'],
                        set_={'numero_decreto': str(attrs.get("NUM_DECRETO")), 'geom': f"SRID=4326;{geom.wkt}"}
                    )
                    db.execute(stmt)
            db.commit()

            logger.info("Ingesta de capas espaciales DGA finalizada con exito.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_sync())
