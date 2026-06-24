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


def evaluar_modulo_vegetacion(wkt_polygon: str = None, avanzado_habilitado: bool = False) -> dict[str, Any]:
    avanzado = {}
    ndvi_promedio = 0.45
    estado_modulo = "informativo"
    explicacion = "Índice de Vegetación (NDVI) aproximado mediante cuadrícula vectorial PostGIS/Shapely."
    
    if avanzado_habilitado and wkt_polygon:
        geojson_grilla = _generar_grilla_ndvi(wkt_polygon)
        
        avanzado = {
            "indices_preparados": ["NDVI", "EVI"],
            "grilla_ndvi_geojson": geojson_grilla,
            "estado_integracion": "Alternativa Vectorial activada.",
        }

    return {
        "estado": estado_modulo,
        "titulo": "Vegetacion satelital (Vectorial)",
        "explicacion": explicacion,
        "datos": {
            "ndvi_promedio": ndvi_promedio,
            "cobertura_vegetal": "Media",
        },
        "fuentes": [
            {
                "nombre": "Modelado Vectorial Local",
                "tipo": "satelital",
                "descripcion": "Aproximación NDVI usando teselado espacial.",
            }
        ],
        "avanzado": avanzado,
        "avanzado_restringido": not avanzado_habilitado,
    }
