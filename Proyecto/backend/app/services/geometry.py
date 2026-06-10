from math import cos, pi
from typing import Any, Iterable
from shapely.geometry import Polygon


def _as_point(vertex: Any) -> tuple[float, float]:
    if isinstance(vertex, dict):
        return float(vertex["latitud"]), float(vertex["longitud"])
    return float(vertex.latitud), float(vertex.longitud)


def calcular_centroide(vertices: Iterable[Any]) -> dict[str, float]:
    points = [_as_point(vertex) for vertex in vertices]
    if len(points) < 3:
        raise ValueError("El poligono debe tener al menos 3 vertices")

    if points[0] == points[-1]:
        points = points[:-1]

    signed_area = 0.0
    centroid_lat = 0.0
    centroid_lon = 0.0

    for index, (lat_1, lon_1) in enumerate(points):
        lat_2, lon_2 = points[(index + 1) % len(points)]
        cross = lon_1 * lat_2 - lon_2 * lat_1
        signed_area += cross
        centroid_lon += (lon_1 + lon_2) * cross
        centroid_lat += (lat_1 + lat_2) * cross

    signed_area *= 0.5
    if abs(signed_area) < 0.0000001:
        return {
            "latitud": sum(lat for lat, _ in points) / len(points),
            "longitud": sum(lon for _, lon in points) / len(points),
        }

    return {
        "latitud": centroid_lat / (6 * signed_area),
        "longitud": centroid_lon / (6 * signed_area),
    }


def normalizar_vertices(vertices: Iterable[Any]) -> list[dict[str, float]]:
    points = [_as_point(vertex) for vertex in vertices]
    if len(points) < 3:
        raise ValueError("El poligono debe tener al menos 3 vertices")
    return [{"latitud": latitud, "longitud": longitud} for latitud, longitud in points]


def calcular_bbox(vertices: Iterable[Any]) -> dict[str, float]:
    points = [_as_point(vertex) for vertex in vertices]
    if len(points) < 3:
        raise ValueError("El poligono debe tener al menos 3 vertices")
    latitudes = [latitud for latitud, _ in points]
    longitudes = [longitud for _, longitud in points]
    return {
        "min_latitud": min(latitudes),
        "min_longitud": min(longitudes),
        "max_latitud": max(latitudes),
        "max_longitud": max(longitudes),
    }


def calcular_superficie_aprox_ha(vertices: Iterable[Any]) -> float:
    points = [_as_point(vertex) for vertex in vertices]
    if len(points) < 3:
        raise ValueError("El poligono debe tener al menos 3 vertices")
    if points[0] == points[-1]:
        points = points[:-1]

    lat_media_rad = (sum(latitud for latitud, _ in points) / len(points)) * pi / 180
    metros_por_grado_lat = 111_320
    metros_por_grado_lon = 111_320 * cos(lat_media_rad)

    xy_points = [
        (longitud * metros_por_grado_lon, latitud * metros_por_grado_lat)
        for latitud, longitud in points
    ]
    area_m2 = 0.0
    for index, (x_1, y_1) in enumerate(xy_points):
        x_2, y_2 = xy_points[(index + 1) % len(xy_points)]
        area_m2 += x_1 * y_2 - x_2 * y_1
    return round(abs(area_m2) / 2 / 10_000, 4)

def convertir_vertices_a_wkt(vertices: Iterable[Any]) -> str:
    points = [_as_point(vertex) for vertex in vertices]
    if len(points) < 3:
        raise ValueError("El poligono debe tener al menos 3 vertices")
    
    # Shapely espera (x, y) es decir (longitud, latitud)
    lon_lat_points = [(lon, lat) for lat, lon in points]
    
    # Asegurar que el poligono se cierra (primer punto == ultimo punto)
    if lon_lat_points[0] != lon_lat_points[-1]:
        lon_lat_points.append(lon_lat_points[0])
        
    return Polygon(lon_lat_points).wkt
