import type { Coordinates } from "@/types/domain";

const EARTH_RADIUS_METERS = 6378137;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function projectToMeters(point: Coordinates, referenceLatitude: number) {
  const latitudeRad = toRadians(point.latitud);
  const longitudeRad = toRadians(point.longitud);
  const referenceRad = toRadians(referenceLatitude);

  return {
    x: EARTH_RADIUS_METERS * longitudeRad * Math.cos(referenceRad),
    y: EARTH_RADIUS_METERS * latitudeRad,
  };
}

export function calculatePolygonAreaHa(points: Coordinates[]) {
  if (points.length < 3) {
    return 0;
  }

  const referenceLatitude =
    points.reduce((sum, point) => sum + point.latitud, 0) / points.length;
  const projected = points.map((point) => projectToMeters(point, referenceLatitude));
  const areaMeters =
    Math.abs(
      projected.reduce((sum, point, index) => {
        const next = projected[(index + 1) % projected.length];
        return sum + point.x * next.y - next.x * point.y;
      }, 0),
    ) / 2;

  return areaMeters / 10000;
}

export function getPolygonCentroid(points: Coordinates[]) {
  if (!points.length) {
    return { latitud: -33.4489, longitud: -70.6693 };
  }

  return {
    latitud: points.reduce((sum, point) => sum + point.latitud, 0) / points.length,
    longitud:
      points.reduce((sum, point) => sum + point.longitud, 0) / points.length,
  };
}

export function toLeafletLatLng(points: Coordinates[]) {
  return points.map((point) => [point.latitud, point.longitud] as [number, number]);
}
