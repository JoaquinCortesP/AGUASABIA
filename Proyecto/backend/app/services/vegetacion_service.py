import random
from typing import Any
from shapely.wkt import loads
from shapely.geometry import box, mapping

# _generar_grilla_ndvi (simulado) ha sido eliminado para usar datos 100% reales de GEE.



from app.services.gee_sentinel3_service import calcular_ndvi_sentinel3

def evaluar_modulo_vegetacion(latitud: float = None, longitud: float = None, wkt_polygon: str = None, avanzado_habilitado: bool = False, fecha_fin: str = None) -> dict[str, Any]:
    avanzado = {}
    ndvi_promedio = None
    estado_modulo = "informativo"
    explicacion = (
        "El Índice de Vegetación Diferencial Normalizado (NDVI) se extrae satelitalmente utilizando la constelación Sentinel-3 (OLCI) "
        "con gap-filling semanal para eludir la nubosidad."
    )
    
    fuentes = []
    
    if avanzado_habilitado and latitud and longitud:
        resultado_s3 = calcular_ndvi_sentinel3(latitud, longitud, wkt_polygon, fecha_fin)
        
        if not resultado_s3.get("error"):
            ndvi_promedio = resultado_s3.get("ndvi")
            avanzado = {
                "indices_calculados": ["NDVI"],
                "formula": "(NIR - RED) / (NIR + RED)",
                "fuente_tecnica": resultado_s3.get("fuente_satelital"),
                "fecha_base_satelite": resultado_s3.get("fecha_base_satelite"),
                "resolucion_espacial": resultado_s3.get("resolucion_espacial"),
                "grilla_ndvi_geojson": resultado_s3.get("grilla_geojson"),
                "metadatos_informe": resultado_s3.get("metadatos_informe")
            }
            fuentes.append({
                "nombre": "Copernicus Sentinel-3 (GEE)",
                "tipo": "satelital",
                "descripcion": "Datos reales de Radiancia TOA (Nivel 1B) extraídos mediante Google Earth Engine.",
            })
        else:
            estado_modulo = "error"
            explicacion = "No se pudo extraer el NDVI satelital debido a fallas en la conexión a Google Earth Engine o nubosidad persistente extendida."
            avanzado = resultado_s3.get("metadatos_informe", {})

    return {
        "estado": estado_modulo,
        "titulo": "Análisis de Vegetación Satelital (Sentinel-3)",
        "explicacion": explicacion,
        "datos": {
            "ndvi_promedio": round(ndvi_promedio, 3) if ndvi_promedio is not None else None,
            "cobertura_vegetal": "Saludable" if ndvi_promedio and ndvi_promedio > 0.4 else ("Escasa/En latencia" if ndvi_promedio is not None else "Sin Datos"),
        },
        "fuentes": fuentes,
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
