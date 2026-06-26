import asyncio
import logging
import os
import sys
from typing import Dict, Any

import httpx
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import orient
from sqlalchemy.dialects.postgresql import insert

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.capas_ambientales import DecretoEscasez

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sync-decretos")

def esri_to_shapely_multipolygon(esri_geom: Dict[str, Any]):
    """Convierte geometría Esri JSON (rings) a MultiPolygon."""
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

async def run_sync_decretos():
    db = SessionLocal()
    url = "https://rest-sit.mop.gob.cl/arcgis/rest/services/DGA/Decretos_Escasez_Hidrica/MapServer/0/query"
    
    logger.info("Obteniendo decretos de escasez hídrica...")
    
    # Obtener OIDs primero
    async with httpx.AsyncClient() as client:
        res = await client.post(url, data={'where': '1=1', 'returnIdsOnly': 'true', 'f': 'json'}, timeout=90.0)
        res.raise_for_status()
        object_ids = res.json().get("objectIds", [])
        
        logger.info(f"Se identificaron {len(object_ids)} decretos. Descargando en lotes...")
        
        chunk_size = 50
        chunks = [object_ids[i:i + chunk_size] for i in range(0, len(object_ids), chunk_size)]
        
        for idx, chunk in enumerate(chunks):
            logger.info(f"Descargando lote {idx+1}/{len(chunks)}...")
            payload = {
                'objectIds': ','.join(map(str, chunk)),
                'outFields': 'OBJECTID,NUM_DECRETO,REGION,FECHA_DECRETO,FECHA_CADUCIDAD',
                'returnGeometry': 'true',
                'outSR': '4326',
                'f': 'json'
            }
            
            try:
                res = await client.post(url, data=payload, timeout=60.0)
                data = res.json()
                features = data.get("features", [])
                
                for f in features:
                    attrs = f.get("attributes", {})
                    geom_raw = f.get("geometry", {})
                    geom = esri_to_shapely_multipolygon(geom_raw)
                    
                    if geom:
                        from datetime import datetime
                        f_ini = attrs.get("FECHA_DECRETO")
                        f_fin = attrs.get("FECHA_CADUCIDAD")
                        dt_ini = datetime.utcfromtimestamp(f_ini/1000).date() if f_ini else datetime.now().date()
                        dt_fin = datetime.utcfromtimestamp(f_fin/1000).date() if f_fin else datetime.now().date()
                        
                        stmt = insert(DecretoEscasez).values(
                            id=attrs.get("OBJECTID"),
                            numero_decreto=str(attrs.get("NUM_DECRETO")),
                            fecha_inicio=dt_ini,
                            fecha_fin=dt_fin,
                            region=attrs.get("REGION"),
                            geometria=f"SRID=4326;{geom.wkt}"
                        ).on_conflict_do_update(
                            index_elements=['id'],
                            set_={
                                'numero_decreto': str(attrs.get("NUM_DECRETO")),
                                'geometria': f"SRID=4326;{geom.wkt}"
                            }
                        )
                        db.execute(stmt)
                db.commit()
            except Exception as e:
                logger.error(f"Error procesando lote {idx+1}: {e}")
                
    db.close()
    logger.info("Sincronización de decretos finalizada con éxito.")

if __name__ == "__main__":
    asyncio.run(run_sync_decretos())
