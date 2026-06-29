import json
import traceback
from typing import Any, Optional
from datetime import datetime, timedelta

import ee

from app.core.config import settings
from google.oauth2 import service_account

_EE_INITIALIZED = False

def _init_ee():
    global _EE_INITIALIZED
    if _EE_INITIALIZED:
        return

    try:
        if settings.EE_SERVICE_ACCOUNT_JSON and settings.EE_PROJECT_ID:
            json_str = settings.EE_SERVICE_ACCOUNT_JSON
            # Strip surrounding quotes if present (from .env file)
            if json_str.startswith("'") and json_str.endswith("'"):
                json_str = json_str[1:-1]
            
            # Parsear el JSON antes de reemplazar caracteres de control
            credentials_dict = json.loads(json_str)
            if "private_key" in credentials_dict:
                credentials_dict["private_key"] = credentials_dict["private_key"].replace('\\n', '\n')
            
            creds = service_account.Credentials.from_service_account_info(
                credentials_dict, scopes=['https://www.googleapis.com/auth/earthengine']
            )
            ee.Initialize(credentials=creds, project=settings.EE_PROJECT_ID)
        else:
            ee.Initialize()
            
        _EE_INITIALIZED = True
    except Exception as e:
        raise RuntimeError(f"Fallo al inicializar Google Earth Engine: {e}")

def calcular_ndvi_sentinel3(latitud: float, longitud: float, wkt_polygon: Optional[str] = None, fecha_fin: Optional[str] = None) -> dict[str, Any]:
    """
    Se conecta a GEE para usar la colección COPERNICUS/S3/OLCI.
    Aprovecha el tiempo de revisita de 2 días de Sentinel-3 (Resolución 300m).
    Extrae la radiancia TOA (Nivel 1B), enmascara nubes (Bit 27) y calcula NDVI.
    """
    try:
        _init_ee()
        # Configurar la ventana de tiempo (Buscamos hasta 7 días atrás desde la fecha indicada para hacer gap-filling)
        end_date = datetime.fromisoformat(fecha_fin) if fecha_fin else datetime.now()
        start_date = end_date - timedelta(days=7)
        
        point = ee.Geometry.Point([longitud, latitud])
        roi = point
        if wkt_polygon:
            from shapely.wkt import loads
            poly = loads(wkt_polygon)
            roi = ee.Geometry.Polygon(list(poly.exterior.coords))
        
        
        # Colección Sentinel-3 OLCI (Nivel 1B - Radiancia TOA)
        s3 = ee.ImageCollection("COPERNICUS/S3/OLCI") \
               .filterBounds(point) \
               .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
               
        def mask_clouds_s3(image):
            # Enmascaramiento de nubes usando quality_flags (bit 27 para nubes generales en S3 L1B)
            # En S3 OLCI L1B, el bit 27 suele ser el flag 'cloud'. 
            # (Nota: La posición exacta del flag de nubes depende del producto, asumimos 27 según la auditoría)
            qa = image.select('quality_flags')
            cloud_bit = 1 << 27
            mask = qa.bitwiseAnd(cloud_bit).eq(0)
            return image.updateMask(mask)
            
        def calculate_ndvi(image):
            # Factores de escala exactos para Oa08 (Rojo) y Oa17 (NIR)
            red_scale = 0.00876539
            nir_scale = 0.00493004
            
            red = image.select('Oa08_radiance').multiply(red_scale)
            nir = image.select('Oa17_radiance').multiply(nir_scale)
            
            ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI')
            return image.addBands(ndvi)
            
        # Aplicamos la máscara de nubes y calculamos el NDVI
        s3_processed = s3.map(mask_clouds_s3).map(calculate_ndvi)
        
        # Tomamos la imagen más reciente (Gap-Filling temporal) o la mediana de la semana
        latest_image = s3_processed.median() # Usamos la mediana semanal para un Gap-Filling robusto (Composición libre de nubes)
        
        red_scale = 0.00876539
        nir_scale = 0.00493004
        
        latest_image_scaled = latest_image.addBands(
            latest_image.select('Oa08_radiance').multiply(red_scale).rename('RED_scaled')
        ).addBands(
            latest_image.select('Oa17_radiance').multiply(nir_scale).rename('NIR_scaled')
        )
        
        # Extraemos el valor del píxel en la coordenada (o el promedio del polígono)
        stats = latest_image_scaled.select(['NDVI', 'RED_scaled', 'NIR_scaled']).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi,
            scale=300,
            maxPixels=1e9
        ).getInfo()
        
        ndvi_val = stats.get('NDVI')
        red_val = stats.get('RED_scaled')
        nir_val = stats.get('NIR_scaled')
        
        if ndvi_val is None:
            raise ValueError("No se encontraron píxeles libres de nubes en los últimos 7 días con Sentinel-3.")
            
        sensing_time_rango = f"{start_date.strftime('%Y-%m-%d')} a {end_date.strftime('%Y-%m-%d')}"
        
        # Generar grilla real si hay polígono
        grilla_geojson = None
        if wkt_polygon:
            try:
                # Muestrear los píxeles reales dentro del polígono a 300m
                samples = latest_image.select('NDVI').sample(
                    region=roi,
                    scale=300,
                    geometries=True
                ).getInfo()
                
                features = []
                for feat in samples.get('features', []):
                    val = feat.get('properties', {}).get('NDVI')
                    geom = feat.get('geometry')
                    if val is not None and geom:
                        # Crear un cuadrito de 300m (aprox 0.0027 grados) alrededor del punto
                        pt_lng, pt_lat = geom['coordinates']
                        d = 0.00135
                        cell_poly = [
                            [pt_lng - d, pt_lat - d],
                            [pt_lng + d, pt_lat - d],
                            [pt_lng + d, pt_lat + d],
                            [pt_lng - d, pt_lat + d],
                            [pt_lng - d, pt_lat - d]
                        ]
                        if val < 0.3:
                            color = "#dc2626"
                        elif val < 0.5:
                            color = "#f59e0b"
                        elif val < 0.7:
                            color = "#84cc16"
                        else:
                            color = "#16a34a"
                            
                        features.append({
                            "type": "Feature",
                            "geometry": {"type": "Polygon", "coordinates": [cell_poly]},
                            "properties": {
                                "ndvi": round(val, 3),
                                "color": color
                            }
                        })
                grilla_geojson = {"type": "FeatureCollection", "features": features}
            except Exception as e:
                print(f"Error generando grilla real GEE: {e}")
        
            
        return {
            "ndvi": float(ndvi_val),
            "red_reflectance": float(red_val) if red_val is not None else None,
            "nir_reflectance": float(nir_val) if nir_val is not None else None,
            "grilla_geojson": grilla_geojson,
            "fuente_satelital": "Sentinel-3 OLCI (Nivel 1B TOA)",
            "resolucion_espacial": "300 metros",
            "fecha_base_satelite": sensing_time_rango,
            "metadatos_informe": {
                "explicacion_extraccion": "Datos de Radiancia extraídos de la colección COPERNICUS/S3/OLCI en Google Earth Engine. Se aplicó un filtro temporal (Gap-Filling) sobre una ventana de 7 días para eludir la nubosidad.",
                "explicacion_calculo": f"NDVI calculado utilizando la banda Oa08_radiance (Rojo, valor medido: {round(red_val, 4) if red_val is not None else 'N/A'}, factor de escala: 0.00876539) y Oa17_radiance (NIR, valor medido: {round(nir_val, 4) if nir_val is not None else 'N/A'}, factor de escala: 0.00493004). Nubes enmascaradas evaluando el bit 27 del quality_flags."
            }
        }
    except Exception as e:
        print(f"Error en Sentinel-3 GEE: {e}")
        # Retornamos dict de error transparente
        return {
            "error": True,
            "mensaje": f"Earth Engine falló: {e}",
            "metadatos_informe": {
                "explicacion_extraccion": "Intento de conexión a COPERNICUS/S3/OLCI fallido.",
                "explicacion_calculo": "Sin datos ópticos."
            }
        }
