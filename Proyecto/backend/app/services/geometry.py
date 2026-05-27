from typing import Any, Iterable


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
