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
import { latLngBounds, type LatLngExpression } from "leaflet";
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
  estaciones?: any[];
}

const getEstacionColor = (tipo: string) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("fluvio")) return "#3388ff";     // Azul (Ríos)
  if (t.includes("meteor")) return "#ff3333";     // Rojo (Clima)
  if (t.includes("control") || t.includes("nivel")) return "#33ff33";   // Verde (Lagos/Embalses)
  if (t.includes("calidad")) return "#ff33ff";   // Magenta
  if (t.includes("glacio")) return "#ffffff";      // Blanco (Nieve)
  if (t.includes("nivo")) return "#ccffff";        // Celeste claro
  return "#808080"; // Gris por defecto
};

export function MapContainer({
  polygon,
  onPolygonChange,
  drawEnabled = false,
  className,
  area,
  estaciones = [],
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
            <Tooltip sticky>Centroide del análisis</Tooltip>
          </CircleMarker>
        ) : null}
        {estaciones.map((feature: any) => {
          if (!feature.geometry || !feature.geometry.coordinates) return null;
          const [lon, lat] = feature.geometry.coordinates;
          const tipo = feature.properties.tipo_estacion;
          const color = getEstacionColor(tipo);
          
          return (
            <CircleMarker
              key={feature.properties.cod_estacion || feature.properties.objectid}
              center={[lat, lon]}
              radius={6}
              pathOptions={{
                color: "#000000",
                fillColor: color,
                fillOpacity: 0.8,
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div className="font-sans min-w-[160px] p-1 text-slate-800 dark:text-slate-100">
                  <h4 className="font-bold text-sm mb-1 leading-tight text-slate-900 dark:text-white">
                    {feature.properties.nombre}
                  </h4>
                  <p className="text-xs leading-normal">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Código:</span> {feature.properties.cod_estacion}<br />
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Tipo:</span>{" "}
                    <span
                      style={{
                        color: color,
                        fontWeight: "bold",
                        background: "#1e293b",
                        padding: "1px 5px",
                        borderRadius: "3px",
                      }}
                    >
                      {tipo}
                    </span>
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
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
    // Only fit to area when it's provided by the backend analysis
    if (area) {
      const points: LatLngExpression[] = [
        [area.bbox.min_latitud, area.bbox.min_longitud],
        [area.bbox.max_latitud, area.bbox.max_longitud]
      ];
      map.fitBounds(latLngBounds(points), { padding: [28, 28], maxZoom: 13 });
    }
  }, [area, map]);

  return null;
}
