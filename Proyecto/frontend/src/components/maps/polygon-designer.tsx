import { Polygon, Polyline, useMapEvents } from "react-leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculatePolygonAreaHa, toLeafletLatLng } from "@/lib/leaflet/geo";
import type { Coordinates } from "@/types/domain";

interface PolygonDesignerProps {
  value: Coordinates[];
  onChange: (points: Coordinates[]) => void;
}

export function PolygonDesigner({ value, onChange }: PolygonDesignerProps) {
  const area = calculatePolygonAreaHa(value);
  const positions = toLeafletLatLng(value);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="h-[380px]">
        <MapContainer center={[-33.76, -70.75]} zoom={11} scrollWheelZoom className="h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PolygonClickHandler points={value} onChange={onChange} />
          {value.length >= 3 ? (
            <Polygon
              positions={positions}
              pathOptions={{
                color: "#0891b2",
                fillColor: "#2aa889",
                fillOpacity: 0.18,
                weight: 2,
              }}
            />
          ) : (
            <Polyline positions={positions} pathOptions={{ color: "#0891b2", weight: 2 }} />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card p-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            Area visual: {area.toFixed(2)} ha
          </div>
          <div className="text-xs text-muted-foreground">
            Haz clic sobre el mapa para agregar vertices del poligono.
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(value.slice(0, -1))}
            disabled={!value.length}
          >
            <Undo2 className="h-4 w-4" />
            Deshacer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([])}
            disabled={!value.length}
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  );
}

function PolygonClickHandler({
  points,
  onChange,
}: {
  points: Coordinates[];
  onChange: (points: Coordinates[]) => void;
}) {
  useMapEvents({
    click(event) {
      onChange([
        ...points,
        { latitud: event.latlng.lat, longitud: event.latlng.lng },
      ]);
    },
  });

  return null;
}
