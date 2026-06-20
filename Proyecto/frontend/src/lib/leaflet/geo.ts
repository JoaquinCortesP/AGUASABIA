import type { Coordinates } from "@/types/territory";
import { LatLngExpression } from "leaflet";

export function toLeafletLatLng(coords: Coordinates[]): LatLngExpression[] {
  return coords.map((c) => [c.latitud, c.longitud] as LatLngExpression);
}

/**
 * Calcula la superficie aproximada en hectáreas de un conjunto de coordenadas lat/lon,
 * replicando exactamente la proyección simplificada y el algoritmo de área con signo del backend.
 */
export function calcularAreaHectareas(coords: Coordinates[]): number {
  if (coords.length < 3) return 0;
  
  // Clonar y remover el último punto si es duplicado del primero (polígono cerrado)
  let points = [...coords];
  if (
    points[0].latitud === points[points.length - 1].latitud &&
    points[0].longitud === points[points.length - 1].longitud
  ) {
    points = points.slice(0, -1);
  }
  
  const sumLat = points.reduce((sum, p) => sum + p.latitud, 0);
  const latMediaRad = (sumLat / points.length) * Math.PI / 180;
  const metrosPorGradoLat = 111320;
  const metrosPorGradoLon = 111320 * Math.cos(latMediaRad);
  
  // Transformación a coordenadas métricas planas (proyección local simplificada)
  const xyPoints = points.map((p) => ({
    x: p.longitud * metrosPorGradoLon,
    y: p.latitud * metrosPorGradoLat,
  }));
  
  // Algoritmo de área con signo para polígonos 2D
  let areaM2 = 0;
  for (let i = 0; i < xyPoints.length; i++) {
    const p1 = xyPoints[i];
    const p2 = xyPoints[(i + 1) % xyPoints.length];
    areaM2 += p1.x * p2.y - p2.x * p1.y;
  }
  
  // Convertimos metros cuadrados a hectáreas (/ 10000) y redondeamos a 4 decimales
  return Math.round((Math.abs(areaM2) / 2 / 10000) * 10000) / 10000;
}

