from typing import Any
from app.services.satellite_service import obtener_ndvi_promedio

def evaluar_modulo_vegetacion(wkt_polygon: str = None, avanzado_habilitado: bool = False) -> dict[str, Any]:
    avanzado = {}
    ndvi_promedio = None
    estado_modulo = "pendiente"
    explicacion = "El módulo queda listo para incorporar NDVI y cobertura vegetal. Por ahora la API devuelve una lectura preparada sin inventar datos satelitales."
    
    if avanzado_habilitado and wkt_polygon:
        # Llamar al servicio satelital real
        sat_result = obtener_ndvi_promedio(wkt_polygon)
        
        if sat_result["estado"] == "exitoso":
            ndvi_promedio = sat_result["ndvi_mean"]
            estado_modulo = "exitoso"
            explicacion = "Se ha calculado el NDVI promedio usando imágenes recientes de Sentinel-2 a través de Google Earth Engine."
        else:
            explicacion = f"Error al procesar Sentinel-2: {sat_result.get('error')}"
            
        avanzado = {
            "indices_preparados": ["NDVI", "EVI"],
            "fuentes_futuras": ["Sentinel-2", "Landsat", "servicios satelitales compatibles"],
            "estado_integracion": "Integrado con Google Earth Engine.",
            "resultado_satelital": sat_result
        }

    return {
        "estado": estado_modulo,
        "titulo": "Vegetacion satelital (Sentinel-2)",
        "explicacion": explicacion,
        "datos": {
            "ndvi_promedio": ndvi_promedio,
            "cobertura_vegetal": None,
        },
        "fuentes": [
            {
                "nombre": "Sentinel-2 / Earth Engine",
                "tipo": "satelital",
                "descripcion": "Índice de Vegetación de Diferencia Normalizada (NDVI).",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
