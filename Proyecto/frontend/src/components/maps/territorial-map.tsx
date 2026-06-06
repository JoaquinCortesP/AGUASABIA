import { LayersControl, MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import { latLngBounds } from "leaflet";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { getPolygonCentroid, toLeafletLatLng } from "@/lib/leaflet/geo";
import { cn } from "@/lib/utils/cn";
import type { ParcelSummary, RiskLevel } from "@/types/domain";

const polygonColors: Record<RiskLevel, string> = {
  bajo: "#2aa889",
  medio: "#d97706",
  alto: "#dc2626",
  critico: "#991b1b",
};

interface TerritorialMapProps {
  parcels: ParcelSummary[];
  className?: string;
  dense?: boolean;
}

export function TerritorialMap({ parcels, className, dense = false }: TerritorialMapProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border", className)}>
      <MapContainer
        center={[-33.76, -70.75]}
        zoom={10}
        minZoom={7}
        scrollWheelZoom
        className={cn(dense ? "min-h-[320px]" : "min-h-[520px]")}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Cartografia base">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Parcelas monitoreadas">
            <>
              <FitParcels parcels={parcels} />
              {parcels.map((parcel) => {
                const positions = toLeafletLatLng(parcel.poligono_vertices);
                const centroid = getPolygonCentroid(parcel.poligono_vertices);
                const color = polygonColors[parcel.riesgo];

                return (
                  <Polygon
                    key={parcel.id}
                    positions={positions}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.24,
                      weight: 2,
                    }}
                  >
                    <Tooltip sticky>
                      {parcel.nombre} - {parcel.productor}
                    </Tooltip>
                    <Popup>
                      <div className="space-y-2">
                        <div>
                          <div className="font-semibold">{parcel.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {parcel.productor}
                          </div>
                        </div>
                        <RiskBadge level={parcel.riesgo} />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>Cultivo</span>
                          <strong>{parcel.cultivo}</strong>
                          <span>Superficie</span>
                          <strong>{parcel.hectareas} ha</strong>
                          <span>Centroide</span>
                          <strong>
                            {centroid.latitud.toFixed(3)}, {centroid.longitud.toFixed(3)}
                          </strong>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}

function FitParcels({ parcels }: { parcels: ParcelSummary[] }) {
  const map = useMap();

  useEffect(() => {
    const points = parcels.flatMap((parcel) => toLeafletLatLng(parcel.poligono_vertices));

    if (points.length > 0) {
      map.fitBounds(latLngBounds(points), { padding: [28, 28] });
    }
  }, [map, parcels]);

  return null;
}
