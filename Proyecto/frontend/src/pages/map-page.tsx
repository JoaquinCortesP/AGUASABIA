import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { MapContainer } from "@/components/maps/MapContainer";
import { LayerSelector } from "@/components/maps/LayerSelector";
import { territorioApi } from "@/features/territorio/api/territorio-api";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { Coordinates } from "@/types/territory";
import { calcularAreaHectareas } from "@/lib/leaflet/geo";
import { HelpCircle, Info } from "lucide-react";

export function MapPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const consultaIdParam = searchParams.get("consulta_id");

  const [polygon, setPolygon] = useState<Coordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  
  // Estado local para los resultados del análisis (permite cargar historial o reportes en vivo)
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Nivel de usuario
  const isGuest = user === null;
  const isRegisteredFree = user !== null && user.plan !== "pago" && user.role !== "admin";
  const isPremiumPro = user !== null && (user.plan === "pago" || user.role === "admin");

  const concepts: Record<string, { title: string; desc: string }> = {
    clima: {
      title: "Evapotranspiración (Et0) & Climatología",
      desc: "La evapotranspiración de referencia (Et0) estima la pérdida de agua por evaporación del suelo y transpiración foliar en mm/día. Junto con la precipitación, define la humedad disponible en el ecosistema."
    },
    agua: {
      title: "Balance Hídrico Predial",
      desc: "Corresponde al aporte neto diario (Precipitación - Evapotranspiración). Si es negativo, el terreno está perdiendo agua por demanda atmosférica, necesitando riego suplementario."
    },
    territorio: {
      title: "Proyección Geoespacial",
      desc: "Cálculo matemático de la superficie (ha) y ubicación central (centroide) del área de estudio. Para planes Premium, realiza una intersección PostGIS en base de datos con cuencas y decretos oficiales."
    },
    riesgos: {
      title: "Inferencia y Resiliencia Ecológica",
      desc: "Cálculo de vulnerabilidad combinando el verdor y clorofila foliar activa (NDVI obtenido por satélite) con la desecación atmosférica e histórico de anomalías térmicas."
    }
  };

  const mutation = useMutation({
    mutationFn: (coords: Coordinates[]) =>
      territorioApi.analizar({
        poligono: coords,
        modo: isPremiumPro ? "avanzado" : "resumen", // Determinado automáticamente
        guardar: !!user,
        modulos: ["agua", "clima", "territorio", "vegetacion", "riesgos"],
      }),
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        setShowPromoModal(true);
      }
    }
  });

  // Cargar consulta del historial si el parámetro consulta_id está en la URL
  useEffect(() => {
    if (consultaIdParam) {
      const loadSavedConsulta = async () => {
        try {
          const id = Number(consultaIdParam);
          const data = await territorioApi.getConsulta(id);
          setAnalysisResult(data);
          if (data.area?.poligono) {
            setPolygon(data.area.poligono);
          }
        } catch (err) {
          console.error("Error al cargar consulta guardada:", err);
          alert("No se pudo cargar el detalle del historial.");
        }
      };
      loadSavedConsulta();
    }
  }, [consultaIdParam]);

  const handleAnalyze = () => {
    if (polygon.length < 3) {
      alert("El polígono debe tener al menos 3 vértices para formar una geometría válida.");
      return;
    }
    
    const areaHa = calcularAreaHectareas(polygon);
    if (areaHa > 10000) {
      alert(`El área seleccionada es demasiado grande (${areaHa.toFixed(2)} ha). El límite máximo permitido es de 10,000 ha.`);
      return;
    }
    if (areaHa <= 0) {
      alert("El área del polígono es inválida. Asegúrate de no cruzar líneas.");
      return;
    }

    mutation.mutate(polygon);
    setIsDrawing(false);
  };

  const handleClear = () => {
    setPolygon([]);
    mutation.reset();
    setAnalysisResult(null);
    setActiveConcept(null);
  };

  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [todasLasEstaciones, setTodasLasEstaciones] = useState<any>(null);

  useEffect(() => {
    const loadEstaciones = async () => {
      try {
        const data = await territorioApi.getEstaciones();
        setTodasLasEstaciones(data);
      } catch (err) {
        console.error("Error cargando estaciones DGA:", err);
      }
    };
    loadEstaciones();
  }, []);

  const estacionesFiltradas = todasLasEstaciones?.features?.filter((f: any) => {
    if (!f.geometry || !f.properties || !f.properties.tipo_estacion) return false;
    const tipo = f.properties.tipo_estacion.toLowerCase();
    
    if (activeLayers.includes("rios") && tipo.includes("fluvio")) {
      return true;
    }
    if (activeLayers.includes("embalses") && (tipo.includes("control") || tipo.includes("nivel"))) {
      return true;
    }
    return false;
  }) || [];

  const renderModuloDatos = (moduloKey: string, modulo: any) => {
    if (!modulo || !modulo.datos || Object.keys(modulo.datos).length === 0) return null;
    const datos = modulo.datos;

    switch (moduloKey) {
      case "clima": {
        const { fecha, precipitacion_mm, et0_mm } = datos;
        
        if (isGuest) {
          return (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Precipitación:</span>
                <span className="text-xs font-bold text-foreground">🌧️ {precipitacion_mm ?? 0} mm</span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Evaporación:</span>
                <span className="text-xs font-bold text-foreground">☀️ {et0_mm ?? 0} mm</span>
              </div>
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-1 leading-snug">
                🔑 <strong>Ingreso requerido:</strong> Regístrate gratis para ver la interpretación climática y balances.
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Lluvia</span>
                <span className="text-base font-bold text-sky-500 flex items-center gap-1 mt-1">
                  🌧️ {precipitacion_mm ?? 0} mm
                </span>
              </div>
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Evaporación</span>
                <span className="text-base font-bold text-amber-500 flex items-center gap-1 mt-1">
                  ☀️ {et0_mm ?? 0} mm
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              La atmósfera demanda {et0_mm} mm de agua en base a la temperatura local. {precipitacion_mm > 0 ? `Se registran ${precipitacion_mm} mm de precipitación aportando agua al suelo.` : "No hay aporte de lluvias en las últimas 24 horas."}
            </p>

            {isRegisteredFree && (
              <div className="text-[10px] text-primary bg-primary/10 p-2 rounded-lg border border-primary/20 leading-snug">
                ⭐ <strong>Mejora a Pro:</strong> Visualiza datos climáticos históricos y satelitales avanzados.
              </div>
            )}

            {isPremiumPro && modulo.avanzado && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-primary block">🔍 Detalles Técnicos Pro:</span>
                <div className="font-mono text-[9px] text-muted-foreground space-y-0.5">
                  <div>Centroide: Lat {modulo.avanzado.latitud?.toFixed(4)}, Lon {modulo.avanzado.longitud?.toFixed(4)}</div>
                  <div>Fecha: {modulo.avanzado.fecha}</div>
                  <div>Fórmula: Evapotranspiración FAO-56 Penman-Monteith</div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "agua": {
        const rain = datos.precipitacion_diaria_mm ?? 0;
        const et0 = datos.demanda_atmosferica_et0_mm ?? 0;
        const balance = rain - et0;

        if (isGuest) {
          return (
            <div className="space-y-2 mt-2">
              <div className="bg-muted/30 p-2 rounded-lg border border-border/30 text-xs font-semibold text-muted-foreground">
                Balance Hídrico General: <span className={balance >= 0 ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>{balance >= 0 ? "Superávit" : "Déficit"}</span>
              </div>
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                🔑 <strong>Ingreso requerido:</strong> Regístrate gratis para ver el balance numérico y consejos de riego.
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-3 mt-2">
            <div className="bg-background/60 p-2.5 rounded-lg border border-border/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Balance Diario Neto</span>
                <span className={`text-base font-extrabold flex items-center gap-1 mt-1 ${balance >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {balance >= 0 ? "📈" : "📉"} {balance.toFixed(1)} mm
                </span>
              </div>
              <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
                <div>Ingreso: {rain} mm</div>
                <div>Egreso: {et0} mm</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {balance >= 0 
                ? "El agua de lluvias es mayor a la evaporada. El suelo cuenta con un balance positivo."
                : `Pérdida hídrica de ${Math.abs(balance).toFixed(1)} mm diarios. Se aconseja complementar con riego artificial.`
              }
            </p>

            {isRegisteredFree && (
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                ⭐ <strong>Mejora a Pro:</strong> Identifica cuencas hidrográficas y decretos de escasez DGA.
              </div>
            )}

            {isPremiumPro && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-primary block">💧 Capas Hidrográficas DGA (PostGIS):</span>
                {modulo.avanzado?.cuencas_dga && modulo.avanzado.cuencas_dga.length > 0 ? (
                  <div>
                    <span className="text-muted-foreground font-semibold">Cuencas Intersectadas:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-foreground font-mono mt-0.5">
                      {modulo.avanzado.cuencas_dga.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">Sin cuencas DGA detectadas en la zona.</div>
                )}

                {modulo.avanzado?.decretos_escasez_dga && modulo.avanzado.decretos_escasez_dga.length > 0 ? (
                  <div className="mt-1">
                    <span className="text-destructive font-semibold">Decretos de Escasez Activos:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-destructive font-mono mt-0.5">
                      {modulo.avanzado.decretos_escasez_dga.map((d: string, idx: number) => (
                        <li key={idx}>Decreto N° {d}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-500 mt-1 font-semibold">✓ Sin decretos de escasez hídrica activos.</div>
                )}

                {/* Acuíferos Protegidos */}
                {modulo.avanzado?.acuiferos_protegidos && modulo.avanzado.acuiferos_protegidos.length > 0 && (
                  <div className="mt-2">
                    <span className="text-primary font-semibold">Acuíferos Protegidos:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-muted-foreground font-mono mt-0.5">
                      {modulo.avanzado.acuiferos_protegidos.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {/* Áreas de Restricción */}
                {modulo.avanzado?.areas_restriccion && modulo.avanzado.areas_restriccion.length > 0 && (
                  <div className="mt-2">
                    <span className="text-amber-500 font-semibold">Restricción / Prohibición:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-amber-500 font-mono mt-0.5">
                      {modulo.avanzado.areas_restriccion.map((a: any, idx: number) => <li key={idx}>{a.nombre} ({a.tipo})</li>)}
                    </ul>
                  </div>
                )}

                {/* Agotamiento */}
                {modulo.avanzado?.declaraciones_agotamiento && modulo.avanzado.declaraciones_agotamiento.length > 0 && (
                  <div className="mt-2">
                    <span className="text-destructive font-semibold">Ríos Agotados:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-destructive font-mono mt-0.5">
                      {modulo.avanzado.declaraciones_agotamiento.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}
                
                {/* Decretos de Reserva */}
                {modulo.avanzado?.decretos_reserva && modulo.avanzado.decretos_reserva.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sky-500 font-semibold">Decretos Caudal Reserva:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-sky-500 font-mono mt-0.5">
                      {modulo.avanzado.decretos_reserva.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {/* Embalses */}
                {modulo.avanzado?.embalses_cercanos && modulo.avanzado.embalses_cercanos.length > 0 && (
                  <div className="mt-2">
                    <span className="text-blue-500 font-semibold">Embalses cercanos (5km):</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-blue-500 font-mono mt-0.5">
                      {modulo.avanzado.embalses_cercanos.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case "territorio": {
        const area = datos.superficie_aprox_ha ?? 0;
        const lat = datos.centroide?.latitud ?? 0;
        const lng = datos.centroide?.longitud ?? 0;

        if (isGuest) {
          return (
            <div className="space-y-2 mt-2">
              <div className="bg-muted/30 p-2 rounded-lg border border-border/30 text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Superficie:</span>
                <span className="text-foreground font-bold">{area.toFixed(2)} ha</span>
              </div>
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                🔑 <strong>Ingreso requerido:</strong> Regístrate gratis para ver la georreferenciación y coordenadas.
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Superficie</span>
                <span className="text-base font-bold text-foreground flex items-center gap-1 mt-1">
                  📐 {area.toFixed(2)} ha
                </span>
              </div>
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Centroide</span>
                <span className="text-[9px] font-mono text-muted-foreground block mt-1 leading-tight">
                  Lat: {lat.toFixed(4)}<br />
                  Lon: {lng.toFixed(4)}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              La consulta abarca {area.toFixed(2)} hectáreas. Coordenadas validadas correctamente.
            </p>

            {isPremiumPro && modulo.avanzado && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg text-xs leading-relaxed text-muted-foreground space-y-2">
                <div>
                  <strong className="text-primary block">✓ Validación PostGIS:</strong> Polígono verificado espacialmente en la proyección WGS84 (SRID 4326).
                </div>
                {modulo.avanzado.humedales_cercanos && (
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-400 block mt-2">🌿 Humedales Detectados:</strong>
                    <ul className="list-disc pl-4 text-[10px] mt-1">
                      {modulo.avanzado.humedales_cercanos.map((h: string, idx: number) => <li key={idx}>{h}</li>)}
                    </ul>
                  </div>
                )}
                {modulo.avanzado.factibilidad_economica && (
                  <div>
                    <strong className="text-amber-600 dark:text-amber-400 block mt-2">💰 Factibilidad Económica (IA):</strong>
                    <p className="text-[10px] mt-1">{modulo.avanzado.factibilidad_economica}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case "riesgos": {
        const { riesgo_sequia, estres_hidrico, incendios_cercanos } = datos;
        
        const getBadgeClass = (val: string) => {
          const lower = (val || "").toLowerCase();
          if (lower === "bajo" || lower === "normal") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
          if (lower === "medio" || lower === "alerta") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
          return "bg-destructive/10 text-destructive border-destructive/20";
        };

        if (isGuest) {
          return (
            <div className="space-y-2 mt-2">
              <div className="bg-muted/30 p-2 rounded-lg border border-border/30 text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Riesgo general:</span>
                <span className="text-emerald-500 font-bold">Bajo</span>
              </div>
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                🔑 <strong>Ingreso requerido:</strong> Regístrate gratis para ver el estrés vegetal foliar satelital.
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg border border-border/50">
                <span className="text-xs font-medium text-foreground">Riesgo de Sequía</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(riesgo_sequia)}`}>
                  {riesgo_sequia}
                </span>
              </div>
              <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg border border-border/50">
                <span className="text-xs font-medium text-foreground">Estrés Hídrico</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(estres_hidrico)}`}>
                  {estres_hidrico}
                </span>
              </div>
              <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg border border-border/50">
                <span className="text-xs font-medium text-foreground">Focos de Incendio</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${incendios_cercanos ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                  {incendios_cercanos ? `${incendios_cercanos} activos` : "Ninguno cercano"}
                </span>
              </div>
            </div>

            {isPremiumPro && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg text-xs leading-relaxed text-muted-foreground space-y-1">
                <span className="font-bold text-primary block">📊 Inferencia de Riesgo Pro:</span>
                <p className="text-[10px]">
                  Cruce espectral satelital NDVI con anomalía térmica y humedad atmosférica.
                </p>
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="bg-muted p-2 rounded-md text-xs font-mono mb-3">
            {JSON.stringify(datos, null, 2)}
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Panel Izquierdo - Herramientas */}
      <div className="w-80 glass-panel border-r border-border/50 p-5 flex flex-col overflow-y-auto space-y-6 animate-fade-in">
        <h2 className="font-extrabold text-xl text-brand-gradient tracking-tight border-b border-border/40 pb-2 flex items-center gap-2">
          🛠️ Herramientas
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDrawing(!isDrawing)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isDrawing ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted hover:bg-muted/80 text-foreground border border-border/60"}`}
            >
              {isDrawing ? "✏️ Dibujando..." : "🗺️ Dibujar Área"}
            </button>
            <button 
              onClick={handleClear}
              className="py-2.5 px-4 rounded-lg text-sm font-semibold bg-muted hover:bg-destructive/10 border border-border/60 hover:text-destructive transition-all duration-300"
            >
              Limpiar
            </button>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={polygon.length < 3 || mutation.isPending}
            className="w-full btn-premium"
          >
            {mutation.isPending ? "Analizando Datos..." : "Analizar Territorio"}
          </button>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/40">
          <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
            Capas Oficiales DGA
          </h3>
          <LayerSelector selected={activeLayers} onChange={setActiveLayers} />
        </div>
      </div>

      {/* Mapa Central */}
      <div className="flex-1 bg-muted relative p-4">
        <MapContainer 
          polygon={polygon} 
          onPolygonChange={setPolygon}
          drawEnabled={isDrawing}
          area={analysisResult?.area}
          estaciones={estacionesFiltradas}
          activeLayers={activeLayers}
          className="h-full rounded-xl shadow-lg border border-border/60 overflow-hidden"
        />
      </div>

      {/* Panel Derecho - Resultados */}
      <div className="w-96 glass-panel border-l border-border/50 p-6 flex flex-col overflow-y-auto space-y-6 relative">
        <h2 className="font-extrabold text-xl text-brand-gradient tracking-tight border-b border-border/40 pb-2">
          📋 Reporte Hídrico
        </h2>
        
        {/* Interactive glossary popup OVERLAY */}
        {activeConcept && concepts[activeConcept] && (
          <div className="absolute inset-0 z-20 bg-background/95 p-6 flex flex-col justify-between border-l border-border/50 animate-fade-in">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <h4 className="font-extrabold text-sm text-brand-gradient flex items-center gap-1.5">
                  💡 {concepts[activeConcept].title}
                </h4>
                <button 
                  onClick={() => setActiveConcept(null)}
                  className="text-muted-foreground hover:text-foreground font-bold text-lg p-1"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {concepts[activeConcept].desc}
              </p>
            </div>
            <button
              onClick={() => setActiveConcept(null)}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-xs transition hover:bg-primary/90"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Botón Actualizar en Vivo si viene del Historial */}
        {consultaIdParam && polygon.length >= 3 && (
          <button 
            onClick={handleAnalyze}
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-amber-500 text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-95 transition hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-1 text-xs"
          >
            🔄 Actualizar Reporte en Vivo
          </button>
        )}

        {mutation.isPending && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Consultando datos satelitales y meteorológicos...
          </div>
        )}

        {mutation.isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-xs border border-destructive/20">
            {(mutation.error as any)?.response?.data?.detail || "Ocurrió un error al analizar el territorio. Asegúrate de que el polígono esté dentro del territorio nacional y no posee cruces de líneas inválidas."}
          </div>
        )}

        {!mutation.isPending && !mutation.isError && !analysisResult && (
          <div className="text-center py-12 text-muted-foreground text-xs leading-relaxed space-y-2">
            <Info className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p>Dibuja un polígono sobre tu predio o parcela de interés y presiona "Analizar Territorio" para visualizar los balances hídricos.</p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-5">
            <div className="bg-muted/50 border border-border/40 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-xs uppercase text-primary tracking-wider">Resumen General</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysisResult.resumen_general || "La zona seleccionada ha sido analizada con éxito."}
              </p>
              {analysisResult.area?.superficie_aprox_ha && (
                <div className="text-xs font-semibold text-primary pt-1">
                  📐 Superficie: {analysisResult.area.superficie_aprox_ha.toFixed(2)} hectáreas
                </div>
              )}
            </div>

            {Object.entries(analysisResult.modulos).map(([key, modulo]: [string, any]) => (
              modulo && (
                <div key={key} className="border border-border/60 rounded-xl p-4 bg-card/45 shadow-sm space-y-2">
                  <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
                    <h4 className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                      {modulo.titulo}
                      {(modulo.estado === "pendiente" || modulo.estado === "no_disponible") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                          Próximamente
                        </span>
                      )}
                    </h4>
                    
                    {concepts[key] && (
                      <button 
                        onClick={() => setActiveConcept(key)}
                        className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                        title="Aprender más sobre este concepto"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground leading-normal">{modulo.explicacion}</p>
                  
                  {modulo.estado !== "pendiente" && modulo.estado !== "no_disponible" && (
                    <div className="pt-1">
                      {renderModuloDatos(key, modulo)}
                    </div>
                  )}
                  
                  {modulo.avanzado_restringido && (
                    <div className="text-[10px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-center font-semibold">
                      ⭐ Modo avanzado requiere suscripción
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Modal Promocional */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
            <span className="text-4xl">⭐</span>
            <h3 className="text-xl font-extrabold text-brand-gradient">Mejora tu Plan a Pro</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El modo avanzado e intersecciones PostGIS requieren una cuenta Premium. Obtén acceso a cruces espaciales completos de cuencas y decretos oficiales de la DGA, y datos satelitales crudos de Sentinel-2.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => setShowPromoModal(false)}
                className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg border border-border/80 text-xs transition"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  alert("Integración con pasarela de pagos próximamente...");
                  setShowPromoModal(false);
                }}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition shadow-md"
              >
                Ir a Pro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
