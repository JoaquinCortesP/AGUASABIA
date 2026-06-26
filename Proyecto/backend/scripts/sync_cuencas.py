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
from app.models.capas_ambientales import Cuenca

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sync-cuencas")

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

async def run_sync_cuencas():
    db = SessionLocal()
    url = "https://ideserver.sma.gob.cl/arcgis/rest/services/IDE/Recursos_hidricos_glaciares/MapServer/10/query"
    
    logger.info("Obteniendo cuencas desde el servidor SMA...")
    params = {
        'where': '1=1',
        'outFields': 'OBJECTID,NOM_CUEN,COD_CUEN',
        'returnGeometry': 'true',
        'outSR': '4326',
        'f': 'json'
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, data=params, timeout=60.0)
            res.raise_for_status()
            data = res.json()
            features = data.get("features", [])
            
            logger.info(f"Se obtuvieron {len(features)} cuencas. Guardando en base de datos...")
            
            for f in features:
                attrs = f.get("attributes", {})
                geom_raw = f.get("geometry", {})
                geom = esri_to_shapely_multipolygon(geom_raw)
                
                if geom:
                    stmt = insert(Cuenca).values(
                        id=attrs.get("OBJECTID"),
                        nombre=attrs.get("NOM_CUEN"),
                        codigo=attrs.get("COD_CUEN"),
                        geometria=f"SRID=4326;{geom.wkt}",
                        fuente="SMA"
                    ).on_conflict_do_update(
                        index_elements=['id'],
                        set_={
                            'nombre': attrs.get("NOM_CUEN"),
                            'codigo': attrs.get("COD_CUEN"),
                            'geometria': f"SRID=4326;{geom.wkt}"
                        }
                    )
                    db.execute(stmt)
            db.commit()
            logger.info("Sincronización de cuencas finalizada con éxito.")
    except Exception as e:
        logger.error(f"Error en la sincronización de cuencas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_sync_cuencas())
