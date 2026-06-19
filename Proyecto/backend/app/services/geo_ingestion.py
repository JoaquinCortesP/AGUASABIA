import asyncio
import random
import logging
from typing import List, Dict, Any, Optional
import httpx
from shapely.geometry import Point, Polygon, LineString
from shapely.ops import orient
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from app.models.capas_ambientales import EstacionHidrometrica
from app.schemas.mop_data import EstacionSchema

logger = logging.getLogger("dga-pipeline")

def esri_to_shapely(esri_geom: Dict[str, Any]) -> Optional[Any]:
    """Convierte geometría Esri JSON a objetos Shapely robustos."""
    if not esri_geom:
        return None
    try:
        if "x" in esri_geom and "y" in esri_geom:
            return Point(esri_geom["x"], esri_geom["y"])
        elif "paths" in esri_geom:
            lines = [LineString(path) for path in esri_geom["paths"]]
            return lines[0] if len(lines) == 1 else lines
        elif "rings" in esri_geom:
            polys = []
            for ring in esri_geom["rings"]:
                poly = Polygon(ring)
                polys.append(orient(poly, sign=1.0))
            return polys[0]
    except Exception as e:
        logger.error(f"Error procesando geometría Esri: {e}")
        return None

async def fetch_chunk_with_backoff(client: httpx.AsyncClient, url: str, oids: List[int]) -> List[Dict[str, Any]]:
    """Obtiene un lote de registros con Retroceso Exponencial y Jitter."""
    payload = {
        'objectIds': ','.join(map(str, oids)),
        'outFields': 'OBJECTID,COD_BNA,NOM_ESTACION,TIPO_ESTACION',
        'returnGeometry': 'true',
        'outSR': '4326',
        'f': 'json'
    }
    
    base_delay = 2.0
    for attempt in range(3):
        try:
            response = await client.post(url, data=payload, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                if "error" in data:
                    raise Exception(data["error"]["message"])
                return data.get("features", [])
        except Exception as e:
            jitter = random.uniform(0.0, 1.0)
            delay = (base_delay * (2 ** attempt)) + jitter
            logger.warning(f"Error en intento {attempt+1} para lote OID {oids[0]}-{oids[-1]}: {e}. Reintentando en {delay:.2f}s...")
            await asyncio.sleep(delay)
            
    logger.error(f"Lote {oids[0]}-{oids[-1]} falló críticamente tras 3 intentos.")
    return []

async def run_dga_pipeline(db_session: Session):
    """Ejecuta el pipeline completo de DGA usando una sesión síncrona de base de datos."""
    logger.info("Fase 1: Descubriendo OIDs de la Red Hidrométrica Nacional...")
    query_url = "https://rest-sit.mop.gob.cl/arcgis/rest/services/DGA/Red_Hidrometrica/MapServer/0/query"
    
    async with httpx.AsyncClient() as client:
        discovery_payload = {'where': '1=1', 'returnIdsOnly': 'true', 'f': 'json'}
        response = await client.post(query_url, data=discovery_payload, timeout=30.0)
        response.raise_for_status()
        
        object_ids = response.json().get("objectIds", [])
        if not object_ids:
            logger.info("No se encontraron registros activos en el servidor SIT-MOP.")
            return
            
        total_remote_count = len(object_ids)
        logger.info(f"OIDs identificados: {total_remote_count}. Iniciando Fase 2 (Extracción por lotes)...")
        
        chunk_size = 1000
        chunks = [object_ids[i:i + chunk_size] for i in range(0, total_remote_count, chunk_size)]
        
        successful_upserts = 0
        
        for chunk in chunks:
            features = await fetch_chunk_with_backoff(client, query_url, chunk)
            if not features:
                continue
            
            # Operaciones síncronas de DB
            for f in features:
                attrs = f.get("attributes", {})
                geom_raw = f.get("geometry", {})
                
                try:
                    validated_data = EstacionSchema(**attrs)
                    shapely_geom = esri_to_shapely(geom_raw)
                    
                    if shapely_geom:
                        stmt = insert(EstacionHidrometrica).values(
                            objectid=validated_data.objectid,
                            cod_estacion=validated_data.cod_estacion,
                            nombre=validated_data.nombre,
                            tipo_estacion=validated_data.tipo_estacion,
                            geom=f"SRID=4326;{shapely_geom.wkt}"
                        )
                        stmt = stmt.on_conflict_do_update(
                            index_elements=['objectid'],
                            set_={
                                'cod_estacion': stmt.excluded.cod_estacion,
                                'nombre': stmt.excluded.nombre,
                                'tipo_estacion': stmt.excluded.tipo_estacion,
                                'geom': stmt.excluded.geom
                            }
                        )
                        db_session.execute(stmt)
                        successful_upserts += 1
                except Exception as e:
                    logger.error(f"Fallo en validación/guardado del registro OID {attrs.get('OBJECTID')}: {e}")
            
            db_session.commit()
        
        logger.info("Pipeline finalizado.")
        logger.info(f"Resultados - Remotos detectados: {total_remote_count} | Insertados/Actualizados con éxito en PostGIS: {successful_upserts}")
        if total_remote_count != successful_upserts:
            logger.warning("ALERTA: Se detectó una diferencia cuantitativa entre el catastro origen y el destino.")
