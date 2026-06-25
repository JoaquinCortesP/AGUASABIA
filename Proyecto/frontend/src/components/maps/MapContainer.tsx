import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer as LeafletMapContainer,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  GeoJSON,
  Circle,
  Marker,
  useMapEvents,
} from "react-leaflet";
import { latLngBounds, type LatLngExpression, icon } from "leaflet";
import { PolygonDrawer } from "@/components/maps/PolygonDrawer";
import { toLeafletLatLng } from "@/lib/leaflet/geo";
import { cn } from "@/lib/utils/cn";
import type { AnalyzedArea, Coordinates, TerritoryAnalysisResponse } from "@/types/territory";
import { api } from "@/services/api";
import {
  wildfiresData,
  droughtZonesData,
  wetlandsData,
  basinsData,
  type MockEnvironmentalFeature,
} from "./mockGeoData";


const vertexIcon = icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="%23fbbf24" stroke="%230f172a" stroke-width="2"/></svg>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const moveIcon = icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="%23dfba6b" stroke="%230f172a" stroke-width="2.5"/><path d="M12 6 v12 M6 12 h12" stroke="%230f172a" stroke-width="2.5" stroke-linecap="round"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const flameIcon = icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M12 2C12 2 19 7 19 12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12C5 7 12 2 12 2Z" fill="%23ea580c" stroke="%237c2d12" stroke-width="1.5"/><circle cx="12" cy="13" r="3" fill="%23eab308"/></svg>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});


interface TerritoryMapContainerProps {
  polygon: Coordinates[];
  onPolygonChange?: (polygon: Coordinates[]) => void;
  drawEnabled?: boolean;
  className?: string;
  area?: AnalyzedArea | null;
  estaciones?: any[];
  activeLayers?: string[];
  analysisResult?: TerritoryAnalysisResponse | null;
  placingShape?: "square" | "rectangle" | "triangle" | null;
  onPlacingShapeChange?: (shape: "square" | "rectangle" | "triangle" | null) => void;
  wildfires?: MockEnvironmentalFeature[];
  focusFeature?: { lat: number; lng: number; timestamp: number } | null;
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


function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function MapContainer({
  polygon,
  onPolygonChange,
  drawEnabled = false,
  className,
  area,
  estaciones = [],
  activeLayers = [],
  analysisResult = null,
  placingShape = null,
  onPlacingShapeChange,
  wildfires = wildfiresData,
  focusFeature = null,
}: TerritoryMapContainerProps) {
  const positions = toLeafletLatLng(polygon);
  const [acuiferosData, setAcuiferosData] = useState<any>(null);

  const segments = [];
  if (polygon.length >= 2) {
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];
      if (polygon.length < 3 && i === polygon.length - 1) {
        break;
      }
      const distance = getHaversineDistance(p1.latitud, p1.longitud, p2.latitud, p2.longitud);
      segments.push({ from: p1, to: p2, distance });
    }
  }

  useEffect(() => {
    if (activeLayers.includes("acuiferos") && !acuiferosData) {
      api.get("/api/v1/dga/acuiferos")
        .then((res) => {
          setAcuiferosData(res.data);
        })
        .catch((err) => {
          console.error("Error cargando acuiferos:", err);
        });
    }
  }, [activeLayers, acuiferosData]);

  let polyColor = "#0e7490";
  let polyFill = "#2aa889";
  let polyOpacity = 0.2;

  const isEdificado = analysisResult?.edificado === true || 
    analysisResult?.modulos?.territorio?.datos?.edificado === true ||
    (analysisResult as any)?.modulos?.territorio?.avanzado?.edificado === true;

  if (isEdificado) {
    polyColor = "#eab308"; // Amarillo
    polyFill = "#fef08a";  // Amarillo claro
    polyOpacity = 0.45;
  } else if (activeLayers.includes("ndvi")) {
    polyColor = "#15803d"; 
    polyFill = "#22c55e";
    polyOpacity = 0.15; // Más transparente si se dibuja la grilla encima
  } else if (activeLayers.includes("sequia") || activeLayers.includes("incendios")) {
    polyColor = "#8b0000"; 
    polyFill = "#cc0000";
    polyOpacity = 0.4;
  }

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
        
        {/* World Mask removed so map looks normal */}

        {placingShape && onPlacingShapeChange && onPolygonChange && (
          <ShapePlacer
            shapeType={placingShape}
            onPlace={(points) => {
              onPolygonChange(points);
              onPlacingShapeChange(null);
            }}
            onCancel={() => {
              onPlacingShapeChange(null);
            }}
          />
        )}

        {onPolygonChange ? (
          <PolygonDrawer
            enabled={drawEnabled}
            points={polygon}
            onChange={onPolygonChange}
          />
        ) : null}
        <FitToGeometry polygon={polygon} area={area} />
        
        {/* Renderizado de Acuíferos GeoJSON */}
        {activeLayers.includes("acuiferos") && acuiferosData && (
          <GeoJSON 
            data={acuiferosData}
            style={{
              color: "#3b82f6",
              fillColor: "#60a5fa",
              fillOpacity: 0.35,
              weight: 1.5
            }}
            onEachFeature={(feature, layer) => {
              const name = feature?.properties?.nombre || "Acuífero DGA Protegido";
              const region = feature?.properties?.region || "";
              layer.bindTooltip(
                `<div class="text-xs font-sans p-1 max-w-[200px] whitespace-normal break-words font-semibold text-slate-900 dark:text-slate-100">
                  <span class="text-blue-500 font-bold block mb-0.5">Acuífero DGA</span>
                  <div class="leading-normal">${name}</div>
                  ${region ? `<div class="text-[10px] text-muted-foreground mt-0.5">${region}</div>` : ""}
                </div>`,
                { sticky: true, direction: "top" }
              );
            }}
          />
        )}

        {/* Renderizado del Calor NDVI GeoJSON */}
        {activeLayers.includes("ndvi") && analysisResult?.modulos?.vegetacion?.avanzado?.grilla_ndvi_geojson && (
          <GeoJSON 
            data={analysisResult.modulos.vegetacion.avanzado.grilla_ndvi_geojson as any}
            style={(feature) => {
              const fill = feature?.properties?.color || "#22c55e";
              return {
                color: "#16a34a",
                fillColor: fill,
                fillOpacity: 0.6,
                weight: 1
              };
            }}
            onEachFeature={(feature, layer) => {
              const ndviVal = feature?.properties?.ndvi || 0.45;
              layer.bindTooltip(
                `<div class="text-xs font-sans p-1 font-semibold text-slate-900 dark:text-slate-100">NDVI aproximado: <span class="font-bold text-emerald-500">${ndviVal.toFixed(2)}</span></div>`,
                { sticky: true, direction: "top" }
              );
            }}
          />
        )}

        {/* Renderizado de Incendios CONAF */}
        {activeLayers.includes("incendios") && wildfires.map((f, idx) => (
          <Marker
            key={`fire-${idx}`}
            position={[f.lat, f.lng]}
            icon={flameIcon}
          >
            <Tooltip sticky>
              <div className="p-2 text-xs max-w-[280px] whitespace-normal break-words font-sans text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-red-500 mb-0.5">{f.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-1">Registrado: {f.value}</p>
                <p className="leading-snug">{f.details}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Renderizado de Sequía Crítica */}
        {activeLayers.includes("sequia") && droughtZonesData.map((f, idx) => (
          <Circle
            key={`drought-${idx}`}
            center={[f.lat, f.lng]}
            radius={f.radius || 15000}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: "4 4"
            }}
          >
            <Tooltip sticky>
              <div className="p-2 text-xs max-w-[280px] whitespace-normal break-words font-sans text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-red-500 mb-0.5">{f.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-1">Región: {f.region}</p>
                <p className="leading-snug">{f.details}</p>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* Renderizado de Humedales Protegidos */}
        {activeLayers.includes("humedales") && wetlandsData.map((f, idx) => (
          <Circle
            key={`wetland-${idx}`}
            center={[f.lat, f.lng]}
            radius={f.radius || 4000}
            pathOptions={{
              color: "#059669",
              fillColor: "#10b981",
              fillOpacity: 0.22,
              weight: 2
            }}
          >
            <Tooltip sticky>
              <div className="p-2 text-xs max-w-[280px] whitespace-normal break-words font-sans text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-emerald-500 mb-0.5">{f.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-1">Región: {f.region}</p>
                <p className="leading-snug">{f.details}</p>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* Renderizado de Cuencas Hidrográficas DGA */}
        {activeLayers.includes("cuencas") && basinsData.map((f, idx) => (
          <Circle
            key={`basin-${idx}`}
            center={[f.lat, f.lng]}
            radius={f.radius || 30000}
            pathOptions={{
              color: "#4f46e5",
              fillColor: "#6366f1",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "3 3"
            }}
          >
            <Tooltip sticky>
              <div className="p-2 text-xs max-w-[280px] whitespace-normal break-words font-sans text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-indigo-500 mb-0.5">{f.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-1">Región: {f.region}</p>
                <p className="leading-snug">{f.details}</p>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {polygon.length >= 3 ? (
          <Polygon
            positions={positions}
            pathOptions={{
              color: polyColor,
              fillColor: polyFill,
              fillOpacity: polyOpacity,
              weight: 2,
            }}
          >
            <Tooltip sticky>Zona seleccionada</Tooltip>
          </Polygon>
        ) : polygon.length > 1 ? (
          <Polyline positions={positions} pathOptions={{ color: "#0e7490", weight: 2 }} />
        ) : null}

        {/* Controladores de Arrastre para Polígono (Movimiento) */}
        {onPolygonChange && polygon.length > 0 && (
          (() => {
            let sumLat = 0;
            let sumLng = 0;
            polygon.forEach(p => {
              sumLat += p.latitud;
              sumLng += p.longitud;
            });
            const centerLat = sumLat / polygon.length;
            const centerLng = sumLng / polygon.length;

            return (
              <Marker
                position={[centerLat, centerLng]}
                icon={moveIcon}
                draggable={true}
                eventHandlers={{
                  dragstart: (e) => {
                    const marker = e.target;
                    marker.options.startLatLng = marker.getLatLng();
                  },
                  drag: (e) => {
                    const marker = e.target;
                    const startLatLng = marker.options.startLatLng;
                    if (!startLatLng) return;
                    const currentLatLng = marker.getLatLng();
                    const dLat = currentLatLng.lat - startLatLng.lat;
                    const dLng = currentLatLng.lng - startLatLng.lng;
                    
                    const updated = polygon.map(p => ({
                      latitud: p.latitud + dLat,
                      longitud: p.longitud + dLng
                    }));
                    
                    marker.options.startLatLng = currentLatLng;
                    onPolygonChange(updated);
                  }
                }}
              >
                <Tooltip direction="bottom" offset={[0, 10]}>
                  <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-100">Arrastrar para mover polígono</span>
                </Tooltip>
              </Marker>
            );
          })()
        )}

        {/* Controladores de Arrastre para Vértices Individuales */}
        {onPolygonChange && polygon.map((point, index) => (
          <Marker
            key={`vertex-${index}`}
            position={[point.latitud, point.longitud]}
            icon={vertexIcon}
            draggable={true}
            eventHandlers={{
              drag: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                const updated = [...polygon];
                updated[index] = { latitud: position.lat, longitud: position.lng };
                onPolygonChange(updated);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -5]}>
              <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-100">Modificar vértice {index + 1}</span>
            </Tooltip>
          </Marker>
        ))}

        {/* Renderizado de segmentos de borde con tooltip de distancia */}
        {segments.map((seg, idx) => (
          <Polyline
            key={`seg-${idx}`}
            positions={[[seg.from.latitud, seg.from.longitud], [seg.to.latitud, seg.to.longitud]]}
            pathOptions={{
              color: "#fbbf24",
              weight: 4,
              opacity: 0.95
            }}
          >
            <Tooltip sticky>
              <div className="text-xs font-semibold p-1">
                Línea {idx + 1}: <span className="text-primary font-bold">{seg.distance.toFixed(1)} m</span> reales en Chile
              </div>
            </Tooltip>
          </Polyline>
        ))}
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
        <FocusFeatureController focusFeature={focusFeature} />
      </LeafletMapContainer>
    </div>
  );
}

function FitToGeometry({
  polygon,
  area,
}: {
  polygon: Coordinates[];
  area: AnalyzedArea | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (polygon.length > 0) {
      const bounds = latLngBounds(toLeafletLatLng(polygon));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (area?.bbox) {
      const bounds = latLngBounds(
        [area.bbox.min_latitud, area.bbox.min_longitud],
        [area.bbox.max_latitud, area.bbox.max_longitud]
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (area?.centroide) {
      map.setView([area.centroide.latitud, area.centroide.longitud], 12);
    }
  }, [polygon, area, map]);

  return null;
}

// Simplified Chile outline for masking background
const CHILE_OUTLINE: [number, number][] = [
  [-17.5, -69.6],
  [-22.8, -67.8],
  [-24.5, -68.4],
  [-26.9, -68.3],
  [-30.2, -69.8],
  [-32.6, -70.1],
  [-34.6, -70.2],
  [-36.1, -70.5],
  [-38.7, -71.2],
  [-41.0, -71.8],
  [-43.5, -71.6],
  [-46.5, -71.6],
  [-48.8, -72.3],
  [-50.8, -72.2],
  [-52.4, -69.8],
  [-52.4, -68.6],
  [-54.8, -68.6],
  [-55.0, -66.5],
  [-56.0, -67.2],
  [-54.0, -72.0],
  [-51.0, -74.5],
  [-48.0, -75.5],
  [-44.0, -75.0],
  [-41.8, -74.0],
  [-39.8, -73.5],
  [-36.8, -73.2],
  [-33.0, -71.8],
  [-28.0, -71.4],
  [-24.0, -70.7],
  [-20.0, -70.3],
  [-18.3, -70.4],
];

// Helper to generate coordinates for quick shapes
function getPointsForShape(
  shapeType: "square" | "rectangle" | "triangle",
  lat: number,
  lon: number,
  scale: number
): Coordinates[] {
  const baseSize = 0.0005 * scale;
  if (shapeType === "square") {
    return [
      { latitud: lat + baseSize, longitud: lon - baseSize },
      { latitud: lat + baseSize, longitud: lon + baseSize },
      { latitud: lat - baseSize, longitud: lon + baseSize },
      { latitud: lat - baseSize, longitud: lon - baseSize },
    ];
  } else if (shapeType === "rectangle") {
    return [
      { latitud: lat + baseSize, longitud: lon - baseSize * 2 },
      { latitud: lat + baseSize, longitud: lon + baseSize * 2 },
      { latitud: lat - baseSize, longitud: lon + baseSize * 2 },
      { latitud: lat - baseSize, longitud: lon - baseSize * 2 },
    ];
  } else {
    // Triangle
    return [
      { latitud: lat + baseSize * 1.2, longitud: lon },
      { latitud: lat - baseSize * 0.8, longitud: lon - baseSize * 1.4 },
      { latitud: lat - baseSize * 0.8, longitud: lon + baseSize * 1.4 },
    ];
  }
}

// ShapePlacer component that tracks cursor, scales on scroll wheel, places on left click, cancels on right click
function ShapePlacer({
  shapeType,
  onPlace,
  onCancel,
}: {
  shapeType: "square" | "rectangle" | "triangle";
  onPlace: (points: Coordinates[]) => void;
  onCancel: () => void;
}) {
  const map = useMap();
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [scale, setScale] = useState(1.0);

  // Disable standard map scroll wheel zoom and double click zoom during placing
  useEffect(() => {
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    return () => {
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
    };
  }, [map]);

  // Handle scroll wheel to scale shape preview size
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((prev) => {
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        const newScale = prev * factor;
        return Math.max(0.15, Math.min(8.0, newScale));
      });
    };

    const container = map.getContainer();
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  useMapEvents({
    mousemove(e) {
      setCenter([e.latlng.lat, e.latlng.lng]);
    },
    click(e) {
      if (!center) return;
      const points = getPointsForShape(shapeType, center[0], center[1], scale);
      onPlace(points);
    },
    contextmenu(e) {
      // Right click cancels placing shape
      e.originalEvent.preventDefault();
      onCancel();
    },
  });

  if (!center) return null;

  const points = getPointsForShape(shapeType, center[0], center[1], scale);

  return (
    <>
      <Polygon
        positions={points.map((p) => [p.latitud, p.longitud])}
        pathOptions={{
          color: "#dfba6b",
          fillColor: "#dfba6b",
          fillOpacity: 0.35,
          weight: 1.8,
          dashArray: "4 4",
        }}
      />
      
      {/* Botones de control flotantes en móvil para redimensionar la figura */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950/90 border border-slate-700/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-3 shadow-2xl pointer-events-auto">
        <span className="text-[10px] font-bold text-slate-300 select-none uppercase tracking-wider">Figura:</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setScale((prev) => Math.max(0.15, prev * 0.8));
          }}
          className="w-7 h-7 rounded-full bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center border border-slate-700 active:scale-[0.9] hover:bg-slate-700 transition"
          title="Achicar figura"
        >
          -
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setScale((prev) => Math.min(8.0, prev * 1.25));
          }}
          className="w-7 h-7 rounded-full bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center border border-slate-700 active:scale-[0.9] hover:bg-slate-700 transition"
          title="Agrandar figura"
        >
          +
        </button>
        <div className="w-[1px] h-4 bg-slate-700" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="text-[10px] text-red-400 font-bold hover:text-red-300 transition active:scale-[0.9]"
        >
          Cancelar
        </button>
      </div>
    </>
  );
}

function FocusFeatureController({
  focusFeature,
}: {
  focusFeature: { lat: number; lng: number; timestamp: number } | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusFeature) {
      map.flyTo([focusFeature.lat, focusFeature.lng], 13, { duration: 1.5 });
    }
  }, [focusFeature, map]);

  return null;
}
