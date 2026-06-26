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
import { latLngBounds, type LatLngExpression, icon, circleMarker } from "leaflet";
import { PolygonDrawer } from "@/components/maps/PolygonDrawer";
import { toLeafletLatLng } from "@/lib/leaflet/geo";
import { cn } from "@/lib/utils/cn";
import type { AnalyzedArea, Coordinates, TerritoryAnalysisResponse } from "@/types/territory";
import { api } from "@/services/api";

function WetlandsLayer() {
  const [wetlandsGeoData, setWetlandsGeoData] = useState<any>(null);
  const map = useMapEvents({
    moveend: () => {
      fetchWetlandsInView();
    }
  });

  useEffect(() => {
    fetchWetlandsInView();
  }, []);

  const fetchWetlandsInView = async () => {
    const bounds = map.getBounds();
    const geometry = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    const url = "https://arcgis.mma.gob.cl/server/rest/services/SIMBIO/SIMBIO_HUMEDALES/MapServer/0/query";
    const params = new URLSearchParams({
      geometry: geometry,
      geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "NOM_HUMDET,ORDEN_1",
      outSR: "4326",
      f: "geojson"
    });
    try {
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();
      setWetlandsGeoData(data);
    } catch (error) {
      console.error("Error al cargar humedales MMA:", error);
    }
  };

  return wetlandsGeoData ? (
    <GeoJSON 
      data={wetlandsGeoData} 
      style={(feature: any) => ({
        color: feature.properties.ORDEN_1 === 30 ? "#bff0f5" : "#41f0ca",
        weight: 1,
        fillOpacity: 0.5
      })}
      onEachFeature={(feature, layer) => {
        if (feature.properties && feature.properties.NOM_HUMDET) {
          layer.bindTooltip(`Humedal: ${feature.properties.NOM_HUMDET}`);
        }
      }}
    />
  ) : null;
}

function MapResizer() {

  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    if (container) {
      observer.observe(container);
    }
    return () => {
      if (container) observer.unobserve(container);
      observer.disconnect();
    };
  }, [map]);
  return null;
}



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
  focusFeature?: { lat: number; lng: number; timestamp: number } | null;
  userType?: string;
  fechaInicio?: string;
  fechaHistorica?: string;
  selectedWildfireYear?: string;
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
  focusFeature = null,
  userType = "visitante",
  fechaInicio,
  fechaHistorica,
  selectedWildfireYear,
}: TerritoryMapContainerProps) {
  const positions = toLeafletLatLng(polygon);
  const [acuiferosData, setAcuiferosData] = useState<any>(null);
  const [droughtGeoData, setDroughtGeoData] = useState<any>(null);
  const [basinsGeoData, setBasinsGeoData] = useState<any>(null);
  const [wildfiresGeoData, setWildfiresGeoData] = useState<any>(null);

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
    if (activeLayers.includes("sequia") && !droughtGeoData) {
      api.get("/api/v1/dga/decretos-escasez")
        .then((res) => {
          setDroughtGeoData(res.data);
        })
        .catch((err) => {
          console.error("Error cargando decretos escasez:", err);
        });
    }
  }, [activeLayers, droughtGeoData]);

  useEffect(() => {
    if (activeLayers.includes("cuencas") && !basinsGeoData) {
      api.get("/api/v1/dga/cuencas")
        .then((res) => {
          setBasinsGeoData(res.data);
        })
        .catch((err) => {
          console.error("Error cargando cuencas DGA:", err);
        });
    }
  }, [activeLayers, basinsGeoData]);

  useEffect(() => {
    if (activeLayers.includes("incendios")) {
      const fetchWildfires = async () => {
        try {
          const res = await api.get("/api/v1/territorio/incendios-historicos", {
            params: { 
              userType: userType, 
              year: selectedWildfireYear || "2024",
              startDate: fechaInicio,
              endDate: fechaHistorica
            }
          });
          setWildfiresGeoData(res.data);
        } catch (error) {
          console.error("Error al cargar incendios históricos", error);
        }
      };
      fetchWildfires();
    }
  }, [activeLayers, userType, selectedWildfireYear, fechaInicio, fechaHistorica]);

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

  // Si se está dibujando y hay 1 o 2 puntos, mostramos una línea en lugar de un polígono
  const showPolyline = polygon.length > 0 && polygon.length < 3;
  const showPolygon = polygon.length >= 3;

  return (
    <div className={cn("relative h-full min-h-[520px] overflow-hidden rounded-lg border border-border", className)}>
      <LeafletMapContainer
        center={[-33.45, -70.66]}
        zoom={6}
        minZoom={4}
        scrollWheelZoom
        className="h-full min-h-[520px] w-full z-0"
      >
        <MapResizer />
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
        <FitToGeometry area={area} />
        
        {/* Renderizado de Acuíferos GeoJSON */}
        {activeLayers.includes("acuiferos") && acuiferosData && (
          <GeoJSON 
            key={`acuiferos-${acuiferosData?.features?.length || 0}`}
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
                { sticky: true, direction: "top", className: "text-slate-800" }
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

        {/* Renderizado de Incendios CONAF (Históricos) */}
        {activeLayers.includes("incendios") && wildfiresGeoData && (
          <GeoJSON 
            key={`incendios-${wildfiresGeoData?.features?.length || 0}`}
            data={wildfiresGeoData} 
            pointToLayer={(feature, latlng) => {
              return circleMarker(latlng, {
                radius: 6,
                fillColor: "#ef4444",
                color: "#ea580c",
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.8
              });
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const props = feature.properties;
                const temporada = props.temporada || props.TEMPORADA || "Desconocida";
                const comuna = props.comuna || props.COMUNA || "Desconocida";
                const sup = props.superficie || props.SUPERFICIE || "0";
                layer.bindTooltip(`Incendio (${temporada}) - Comuna: ${comuna} - Sup: ${sup} ha`, { className: "text-slate-800 font-semibold" });
              }
            }}
          />
        )}

        {/* Renderizado de Sequía Crítica (Decretos MOP) */}
        {activeLayers.includes("sequia") && droughtGeoData && (
          <GeoJSON 
            key={`sequia-${droughtGeoData?.features?.length || 0}`}
            data={droughtGeoData} 
            style={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: "4 4"
            }}
            onEachFeature={(feature, layer) => {
              const num = feature.properties?.numero_decreto || feature.properties?.ID_IDE || "Activo";
              layer.bindTooltip(`Decreto Escasez Hídrica DGA (N°: ${num})`, { className: "text-slate-800 font-semibold" });
            }}
          />
        )}

        {/* Renderizado de Estaciones DGA (Ríos y Embalses) */}
        {(activeLayers.includes("rios") || activeLayers.includes("embalses")) && estaciones && estaciones.length > 0 && (
          <>
            {estaciones.map((est, idx) => {
              // Filtrar según capa seleccionada (básico)
              const tipo = (est.tipo_estacion || "").toLowerCase();
              const isRio = tipo.includes("fluvio") || tipo.includes("calidad");
              const isEmbalse = tipo.includes("control") || tipo.includes("nivel");
              
              if (activeLayers.includes("rios") && !isRio && !activeLayers.includes("embalses")) return null;
              if (activeLayers.includes("embalses") && !isEmbalse && !activeLayers.includes("rios")) return null;
              
              const p = est.point_wgs84;
              if (!p || p.coordinates.length < 2) return null;
              return (
                <CircleMarker
                  key={`est-${est.id}-${idx}`}
                  center={[p.coordinates[1], p.coordinates[0]]}
                  radius={5}
                  pathOptions={{
                    color: "white",
                    weight: 1,
                    fillColor: getEstacionColor(est.tipo_estacion),
                    fillOpacity: 0.9,
                  }}
                >
                  <Tooltip className="text-slate-800 font-semibold">
                    <div className="font-bold text-blue-600 border-b border-blue-200 pb-1 mb-1">Estación DGA</div>
                    {est.nom_estacion}<br />
                    <span className="text-xs text-slate-500 font-normal">Tipo: {est.tipo_estacion}</span>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </>
        )}

        {/* Renderizado de Humedales Protegidos */}
        {activeLayers.includes("humedales") && <WetlandsLayer />}

        {/* Renderizado de Cuencas Hidrográficas SMA */}
        {activeLayers.includes("cuencas") && basinsGeoData && (
          <GeoJSON 
            key={`cuencas-${basinsGeoData?.features?.length || 0}`}
            data={basinsGeoData} 
            style={{
              color: "#4f46e5",
              fillColor: "#6366f1",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "3 3"
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.nombre || feature.properties?.NOM_CUEN || "Cuenca DGA";
              layer.bindTooltip(`Cuenca: ${name}`, { className: "text-slate-800 font-semibold" });
            }}
          />
        )}
        {/* Renderizado de Puntos del Polígono */}
        {polygon.map((p, idx) => (
          <Marker
            key={`poly-vertex-${idx}`}
            position={[p.latitud, p.longitud]}
            icon={vertexIcon}
          />
        ))}

        {/* Línea temporal cuando hay 1 o 2 puntos dibujados */}
        {showPolyline && (
          <Polyline
            positions={polygon.map((p) => [p.latitud, p.longitud])}
            pathOptions={{
              color: polyColor,
              weight: 3,
              dashArray: "5 5",
            }}
          />
        )}

        {/* Polígono completo */}
        {showPolygon && (
          <Polygon
            positions={polygon.map((p) => [p.latitud, p.longitud])}
            pathOptions={{
              color: polyColor,
              fillColor: polyFill,
              fillOpacity: polyOpacity,
              weight: 3,
            }}
          >
            <Tooltip sticky>Zona seleccionada</Tooltip>
          </Polygon>
        )}

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
                <div className="font-sans min-w-[160px] p-1 text-slate-800">
                  <h4 className="font-bold text-sm mb-1 leading-tight text-slate-900">
                    {feature.properties.nombre}
                  </h4>
                  <p className="text-xs leading-normal mb-1">
                    <span className="font-semibold text-slate-500">Código:</span> {feature.properties.cod_estacion}<br />
                    <span className="font-semibold text-slate-500">Tipo:</span>{" "}
                    <span
                      style={{
                        color: "#ffffff",
                        fontWeight: "bold",
                        background: color,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
                      }}
                    >
                      {tipo}
                    </span>
                  </p>
                  {(tipo.toLowerCase().includes("control") || tipo.toLowerCase().includes("nivel") || tipo.toLowerCase().includes("embalse") || tipo.toLowerCase().includes("lago")) && (
                    <div className="mt-2 pt-2 border-t border-slate-300">
                      <span className="text-xs font-bold text-amber-600 block mb-1">
                        💧 Volumen/Nivel:
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium italic block">
                        Fechas disponibles proximamente. . . .
                      </span>
                    </div>
                  )}
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
  area,
}: {
  area: AnalyzedArea | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (area?.bbox) {
      const bounds = latLngBounds(
        [area.bbox.min_latitud, area.bbox.min_longitud],
        [area.bbox.max_latitud, area.bbox.max_longitud]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (area?.centroide) {
      map.setView([area.centroide.latitud, area.centroide.longitud], 14);
    }
  }, [area, map]);

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
