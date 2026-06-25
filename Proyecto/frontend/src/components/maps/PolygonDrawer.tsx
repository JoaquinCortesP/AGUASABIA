import { useMapEvents } from "react-leaflet";
import type { Coordinates } from "@/types/territory";

interface PolygonDrawerProps {
  enabled: boolean;
  points: Coordinates[];
  onChange: (points: Coordinates[]) => void;
}

export function PolygonDrawer({ enabled, points, onChange }: PolygonDrawerProps) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      if (points.length >= 10) {
        alert("Límite alcanzado: Se permite un máximo de 10 clics sobre el polígono para asegurar la precisión de cálculo.");
        return;
      }

      onChange([
        ...points,
        { latitud: event.latlng.lat, longitud: event.latlng.lng },
      ]);
    },
  });

  return null;
}
