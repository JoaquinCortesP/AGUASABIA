import json
import logging
from typing import Any, Dict, List

import ee
from app.core.config import settings

logger = logging.getLogger(__name__)

# Variable para rastrear si Earth Engine se inicializó correctamente
_ee_initialized = False

def initialize_ee() -> bool:
    """Inicializa la API de Earth Engine usando Service Account."""
    global _ee_initialized
    if _ee_initialized:
        return True

    try:
        # En producción o si tienes las credenciales, debes configurar:
        # settings.EE_SERVICE_ACCOUNT_JSON con el contenido o ruta del JSON
        # settings.EE_PROJECT_ID con el ID del proyecto
        
        if settings.EE_SERVICE_ACCOUNT_JSON and settings.EE_PROJECT_ID:
            credentials = ee.ServiceAccountCredentials(
                settings.EE_PROJECT_ID, 
                json.loads(settings.EE_SERVICE_ACCOUNT_JSON)
            )
            ee.Initialize(credentials, project=settings.EE_PROJECT_ID)
            _ee_initialized = True
            logger.info("Earth Engine initialized successfully.")
            return True
        else:
            logger.warning("Earth Engine credentials not found in settings. Placeholder mode active.")
            return False
    except Exception as e:
        logger.error(f"Error initializing Earth Engine: {e}")
        return False

def obtener_ndvi_promedio(polygon_wkt: str) -> Dict[str, Any]:
    """
    Obtiene el NDVI promedio para el polígono usando Sentinel-2 (COPERNICUS/S2_HARMONIZED).
    """
    if not initialize_ee():
        # Fallback o placeholder si no hay credenciales
        return {
            "estado": "pendiente",
            "ndvi_mean": None,
            "error": "Credenciales de Google Earth Engine no configuradas."
        }
        
    try:
        from shapely import wkt
        import geojson
        
        # Convertir WKT a GeoJSON Feature
        geom = wkt.loads(polygon_wkt)
        feature = geojson.Feature(geometry=geom, properties={})
        
        # Crear geometría en EE
        ee_polygon = ee.Geometry(feature['geometry'])
        
        # Colección Sentinel-2 (Surface Reflectance)
        s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        
        # Filtrar por fecha (ej. últimos 30 días) y por el polígono
        import datetime
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=30)
        
        image = (s2.filterBounds(ee_polygon)
                 .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                 .median()) # Reducir a imagen mediana libre de nubes
                 
        # Calcular NDVI: (NIR - RED) / (NIR + RED) -> (B8 - B4) / (B8 + B4)
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Reducir sobre el polígono para obtener el promedio
        mean_ndvi_dict = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=ee_polygon,
            scale=10, # Sentinel-2 resolution es 10m
            maxPixels=1e9
        )
        
        # Ejecutar la evaluación (esto hace el request HTTP a los servidores de Google)
        ndvi_value = mean_ndvi_dict.get('NDVI').getInfo()
        
        return {
            "estado": "exitoso",
            "ndvi_mean": round(ndvi_value, 4) if ndvi_value is not None else None
        }
        
    except Exception as e:
        logger.error(f"Error calculando NDVI: {e}")
        return {
            "estado": "error",
            "ndvi_mean": None,
            "error": str(e)
        }
