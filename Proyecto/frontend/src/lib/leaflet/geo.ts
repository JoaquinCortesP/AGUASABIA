import type { Coordinates } from "@/types/territory";
import { LatLngExpression } from "leaflet";

export function toLeafletLatLng(coords: Coordinates[]): LatLngExpression[] {
  return coords.map((c) => [c.latitud, c.longitud] as LatLngExpression);
}
