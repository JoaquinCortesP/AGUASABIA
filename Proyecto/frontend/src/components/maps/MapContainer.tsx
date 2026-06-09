import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer as LeafletMapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { latLngBounds } from "leaflet";
import { PolygonDrawer } from "@/components/maps/PolygonDrawer";
import { toLeafletLatLng } from "@/lib/leaflet/geo";
import { cn } from "@/lib/utils/cn";
import type { AnalyzedArea, Coordinates } from "@/types/territory";

interface TerritoryMapContainerProps {
  polygon: Coordinates[];
  onPolygonChange?: (polygon: Coordinates[]) => void;
  drawEnabled?: boolean;
  className?: string;
  area?: AnalyzedArea | null;
}

export function MapContainer({
  polygon,
  onPolygonChange,
  drawEnabled = false,
  className,
  area,
}: TerritoryMapContainerProps) {
  const positions = toLeafletLatLng(polygon);

  return (
    <div className={cn("relative h-full min-h-[520px] overflow-hidden rounded-lg border border-border", className)}>
      <LeafletMapContainer
        center={[-33.45, -70.66]}
        zoom={6}
        minZoom={4}
        scrollWheelZoom
        className="h-full min-h-[520px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onPolygonChange ? (
          <PolygonDrawer
            enabled={drawEnabled}
            points={polygon}
            onChange={onPolygonChange}
          />
        ) : null}
        <FitToGeometry polygon={polygon} area={area} />
        {polygon.length >= 3 ? (
          <Polygon
            positions={positions}
            pathOptions={{
              color: "#0e7490",
              fillColor: "#2aa889",
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            <Tooltip sticky>Zona seleccionada</Tooltip>
          </Polygon>
        ) : polygon.length > 1 ? (
          <Polyline positions={positions} pathOptions={{ color: "#0e7490", weight: 2 }} />
        ) : null}
        {area ? (
          <CircleMarker
            center={[area.centroide.latitud, area.centroide.longitud]}
            radius={7}
            pathOptions={{
              color: "#0f172a",
              fillColor: "#06b6d4",
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Tooltip sticky>Centroide del analisis</Tooltip>
          </CircleMarker>
        ) : null}
      </LeafletMapContainer>
    </div>
  );
}

function FitToGeometry({
  polygon,
  area,
}: {
  polygon: Coordinates[];
  area?: AnalyzedArea | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points = polygon.length ? toLeafletLatLng(polygon) : [];

    if (!points.length && area) {
      points.push([area.bbox.min_latitud, area.bbox.min_longitud]);
      points.push([area.bbox.max_latitud, area.bbox.max_longitud]);
    }

    if (points.length > 1) {
      map.fitBounds(latLngBounds(points), { padding: [28, 28], maxZoom: 13 });
    }
  }, [area, map, polygon]);

  return null;
}
