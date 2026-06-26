import random
from typing import Any
from shapely.wkt import loads
from shapely.geometry import box, mapping

def _generar_grilla_ndvi(wkt_polygon: str, n_cols: int = 10, n_rows: int = 10) -> dict[str, Any]:
    """
    Genera una grilla vectorial aproximada sobre el bbox del poligono para simular un mapa de NDVI.
    Retorna un GeoJSON FeatureCollection.
    """
    try:
        poly = loads(wkt_polygon)
        minx, miny, maxx, maxy = poly.bounds
        dx = (maxx - minx) / n_cols
        dy = (maxy - miny) / n_rows
        
        features = []
        # Para dar coherencia, usamos un seeder determinista basado en el area
        random.seed(int(poly.area * 1000000))
        
        for i in range(n_cols):
            for j in range(n_rows):
                b_minx = minx + i * dx
                b_maxx = minx + (i + 1) * dx
                b_miny = miny + j * dy
                b_maxy = miny + (j + 1) * dy
                grid_cell = box(b_minx, b_miny, b_maxx, b_maxy)
                
                if poly.intersects(grid_cell):
                    cell_poly = poly.intersection(grid_cell)
                    # Simular NDVI entre 0.1 y 0.85
                    ndvi_val = random.uniform(0.1, 0.85)
                    # Asignar color (Rojo->Déficit, Verde->Sano)
                    if ndvi_val < 0.3:
                        color = "#dc2626" # red-600
                    elif ndvi_val < 0.5:
                        color = "#f59e0b" # amber-500
                    elif ndvi_val < 0.7:
                        color = "#84cc16" # lime-500
                    else:
                        color = "#16a34a" # green-600
                        
                    features.append({
                        "type": "Feature",
                        "geometry": mapping(cell_poly),
                        "properties": {
                            "ndvi": round(ndvi_val, 3),
                            "color": color
                        }
                    })
                    
        return {
            "type": "FeatureCollection",
            "features": features
        }
    except Exception as e:
        print(f"Error generando grilla NDVI: {e}")
        return {"type": "FeatureCollection", "features": []}


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
        resultado_s3 = calcular_ndvi_sentinel3(latitud, longitud, fecha_fin)
        
        if not resultado_s3.get("error"):
            ndvi_promedio = resultado_s3.get("ndvi")
            avanzado = {
                "indices_calculados": ["NDVI"],
                "fuente_tecnica": resultado_s3.get("fuente_satelital"),
                "fecha_base_satelite": resultado_s3.get("fecha_base_satelite"),
                "resolucion_espacial": resultado_s3.get("resolucion_espacial"),
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
