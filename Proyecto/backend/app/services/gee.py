import os
import json
import logging
import ee
from fastapi import APIRouter, HTTPException

logger = logging.getLogger("gee-service")
router = APIRouter(prefix="/satelital", tags=["Google Earth Engine"])

def init_earth_engine():
    """
    Inicializa el cliente de Google Earth Engine utilizando las credenciales
    alojadas en la variable de entorno, evitando guardar archivos físicos.
    """
    try:
        project_id = os.getenv("EE_PROJECT_ID")
        credentials_json_str = os.getenv("EE_SERVICE_ACCOUNT_JSON")
        
        if not project_id or not credentials_json_str:
            logger.warning("Faltan las credenciales EE_PROJECT_ID o EE_SERVICE_ACCOUNT_JSON en el entorno. Saltando inicialización de GEE.")
            return
            
        # Cargamos el string JSON a un diccionario de Python
        credentials_info = json.loads(credentials_json_str)
        
        # Inicialización de credenciales usando el constructor de Earth Engine
        credentials = ee.ServiceAccountCredentials(
            email=credentials_info.get("client_email"),
            key_data=credentials_json_str  # Pasamos directamente el string estructurado
        )
        
        ee.Initialize(credentials, project=project_id)
        logger.info(f"✓ Google Earth Engine inicializado correctamente en el proyecto: {project_id}")
    except Exception as e:
        logger.error(f"✗ Error crítico inicializando Google Earth Engine: {e}")
        # En producción podríamos levantar el error, pero por ahora logueamos para no botar el servidor localmente
        # raise e

@router.get("/test-connection")
async def test_gee_connection():
    """
    Endpoint de prueba para certificar que el backend lee y procesa datos reales de GEE.
    Extrae la altitud de un pixel de prueba (Santiago de Chile) usando el dataset SRTM.
    """
    try:
        dem = ee.Image('USGS/SRTMGL1_003')
        test_point = ee.Geometry.Point([-70.64827, -33.45694])
        
        # Obtener el valor de elevación del punto
        value = dem.sample(test_point, 30).first().get('elevation').getInfo()
        
        return {
            "status": "Conectado",
            "provider": "Google Earth Engine",
            "test_coordinate": [-70.64827, -33.45694],
            "altitude_meters": value
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Fallo de conexión con Google Earth Engine: {str(e)}"
        )

@router.post("/calcular-ndvi")
async def calcular_ndvi_acuifero(geojson_geom: dict):
    """
    Recibe un polígono GeoJSON (ej. desde PostGIS), consulta el mosaico 
    de imágenes Sentinel-2 libre de nubes del último año, calcula el NDVI 
    promedio de la zona y devuelve el valor matemático resultante.
    """
    try:
        coords = geojson_geom.get("coordinates")
        geom_type = geojson_geom.get("type")
        
        if geom_type == "Polygon":
            ee_geometry = ee.Geometry.Polygon(coords)
        elif geom_type == "MultiPolygon":
            ee_geometry = ee.Geometry.MultiPolygon(coords)
        else:
            raise HTTPException(status_code=400, detail="Estructura geométrica no soportada.")

        # Consultar Sentinel-2 filtrando por límites espaciales, temporalidad y cobertura nubosa
        s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                       .filterBounds(ee_geometry)
                       .filterDate('2025-01-01', '2025-12-31')
                       .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)))

        if s2_collection.size().getInfo() == 0:
            raise HTTPException(
                status_code=404, 
                detail="No se encontraron imágenes de satélite utilizables sin nubes para esta zona."
            )

        # Crear mosaico promedio del período y aplicar la fórmula matemática del NDVI
        image = s2_collection.median()
        # Nota Matemática: Sentinel-2 usa B8 (NIR) y B4 (Red) para calcular NDVI
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        # Reducir la región poligonal para extraer el promedio espacial de los pixeles
        stats = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=ee_geometry,
            scale=10,  # Resolución espacial de Sentinel-2 (10 metros por píxel)
            maxPixels=1e8
        )
        
        ndvi_value = stats.get('NDVI').getInfo()

        return {
            "status": "Procesado con éxito",
            "geom_type": geom_type,
            "ndvi_promedio": round(ndvi_value, 4) if ndvi_value is not None else None,
            "interpretacion": "Vegetación densa y saludable" if ndvi_value and ndvi_value > 0.5 else "Suelo desnudo o vegetación escasa"
        }
    except Exception as e:
        logger.error(f"Fallo durante el procesamiento del cálculo del NDVI: {e}")
        raise HTTPException(status_code=500, detail=f"Error en el motor satelital: {str(e)}")
