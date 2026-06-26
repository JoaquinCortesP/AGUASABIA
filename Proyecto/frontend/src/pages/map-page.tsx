import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer } from "@/components/maps/MapContainer";
import { DashboardProModal } from "@/components/maps/DashboardProModal";
import { LayerSelector } from "@/components/maps/LayerSelector";
import { territorioApi } from "@/features/territorio/api/territorio-api";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authApi } from "@/features/auth/api/auth-api";
import type { Coordinates } from "@/types/territory";
import { calcularAreaHectareas } from "@/lib/leaflet/geo";
import { HelpCircle, Info, X, Menu, FileSpreadsheet, Download } from "lucide-react";
import { api } from "@/services/api";
export function MapPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const consultaIdParam = searchParams.get("consulta_id");

  const [polygon, setPolygon] = useState<Coordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [placingShape, setPlacingShape] = useState<"square" | "rectangle" | "triangle" | null>(null);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [fechaHistorica, setFechaHistorica] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  
  // VS Code / Visual Studio panel folding style
  const [leftPanelOpen, setLeftPanelOpen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : true);
  const [rightPanelOpen, setRightPanelOpen] = useState(typeof window !== "undefined" ? window.innerWidth > 768 : true);

  // Address search states
  const [addressSearch, setAddressSearch] = useState("");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastSelected, setLastSelected] = useState("");

  // Additional map navigation states
  const [selectedWildfireYear, setSelectedWildfireYear] = useState<string>("2026");
  const [focusFeature, setFocusFeature] = useState<{ lat: number; lng: number; timestamp: number } | null>(null);
  const [acuiferosData, setAcuiferosData] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [todasLasEstaciones, setTodasLasEstaciones] = useState<any>(null);

  useEffect(() => {
    if (activeLayers.includes("acuiferos") && !acuiferosData) {
      const loadAquifers = async () => {
        try {
          const res = await api.get("/api/v1/dga/acuiferos");
          setAcuiferosData(res.data);
        } catch (err) {
          console.error("Error loading aquifers list:", err);
        }
      };
      loadAquifers();
    }
  }, [activeLayers, acuiferosData]);

  useEffect(() => {
    if (addressSearch.trim().length < 3 || addressSearch === lastSelected) {
      setAddressSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&addressdetails=1&limit=8&q=${encodeURIComponent(addressSearch)}`);
        const data = await res.json();
        if (data) {
          setAddressSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [addressSearch, lastSelected]);

  // Premium features states
  const [showDashboard, setShowDashboard] = useState(false);
  const [openTooltipConcept, setOpenTooltipConcept] = useState<string | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  
  // Estado local para los resultados del análisis (permite cargar historial o reportes en vivo)
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Nivel de usuario
  const isGuest = user === null;
  const isRegisteredFree = user !== null && user.plan !== "pago" && user.plan !== "pro" && user.plan !== "municipal" && user.role !== "admin";
  const isPremiumPro = user !== null;

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
      desc: "Cálculo matemático de la superficie (ha) y ubicación central (centroide) del área de estudio. Para planes Premium, realiza un cruce espacial en base de datos con cuencas y decretos oficiales."
    },
    vegetacion: {
      title: "Vigor Vegetal (NDVI)",
      desc: "Índice de Diferencia Normalizada de Vegetación obtenido de Sentinel-2. Mide la densidad de clorofila activa para evaluar el vigor y salud de los cultivos."
    },
    suelo: {
      title: "Tipo de Suelo (SoilGrids)",
      desc: "Clasificación de la textura del suelo y propiedades edafológicas (arcilla, arena, limo, pH, nitrógeno) estimadas mediante SoilGrids en el centroide del predio."
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
        modulos: ["agua", "clima", "territorio", "vegetacion", "riesgos", "suelo"],
        fecha_inicio: isPremiumPro && fechaInicio ? fechaInicio : undefined,
        fecha_historica: fechaHistorica || undefined,
        fecha_fin: isPremiumPro && fechaHistorica ? fechaHistorica : undefined,
      }),
    onSuccess: (data) => {
      setAnalysisResult(data);
      setRightPanelOpen(true);
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
    setOpenTooltipConcept(null);
  };

  const handleSelectShape = (shapeType: "square" | "rectangle" | "triangle") => {
    const baseLat = analysisResult?.area?.centroide?.latitud || -33.45;
    const baseLon = analysisResult?.area?.centroide?.longitud || -70.66;
    
    let newPoly: Coordinates[] = [];
    if (shapeType === "square") {
      newPoly = [
        { latitud: baseLat + 0.0005, longitud: baseLon - 0.0005 },
        { latitud: baseLat + 0.0005, longitud: baseLon + 0.0005 },
        { latitud: baseLat - 0.0005, longitud: baseLon + 0.0005 },
        { latitud: baseLat - 0.0005, longitud: baseLon - 0.0005 },
      ];
    } else if (shapeType === "rectangle") {
      newPoly = [
        { latitud: baseLat + 0.0005, longitud: baseLon - 0.001 },
        { latitud: baseLat + 0.0005, longitud: baseLon + 0.001 },
        { latitud: baseLat - 0.0005, longitud: baseLon + 0.001 },
        { latitud: baseLat - 0.0005, longitud: baseLon - 0.001 },
      ];
    } else if (shapeType === "triangle") {
      newPoly = [
        { latitud: baseLat + 0.0006, longitud: baseLon },
        { latitud: baseLat - 0.0004, longitud: baseLon - 0.0007 },
        { latitud: baseLat - 0.0004, longitud: baseLon + 0.0007 },
      ];
    }
    setPolygon(newPoly);
    setIsDrawing(false);
  };

  const handleTogglePlacingShape = (shapeType: "square" | "rectangle" | "triangle") => {
    if (placingShape === shapeType) {
      setPlacingShape(null);
    } else {
      setPlacingShape(shapeType);
      setIsDrawing(false); // cancel freehand drawing
    }
  };

  const handleUpgradeToPro = () => {
    setShowUpgradeModal(true);
    setShowPromoModal(false);
  };

  const confirmUpgradeToPro = async () => {
    try {
      await authApi.changePlan("pro");
      alert("¡Felicidades! Has sido ascendido al Plan Pro por $5.000 CLP al mes. Realiza un nuevo análisis del terreno para ver los datos avanzados en tiempo real.");
      setShowUpgradeModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Debes iniciar sesión con una cuenta para poder pasar a Pro.");
    }
  };

  const handleDownloadCSV = () => {
    if (!analysisResult || !analysisResult.modulos) return;
    let csvContent = "data:text/csv;charset=utf-8,\\uFEFF";
    csvContent += "Modulo,Indicador/Parametro,Valor/Estado,Detalle/Descripcion\\n";
    csvContent += `Resumen,Resumen General,N/A,"${(analysisResult.resumen_general || "").replace(/"/g, '""')}"\\n`;
    Object.entries(analysisResult.modulos).forEach(([key, mod]: [string, any]) => {
      if (!mod) return;
      csvContent += `"${key}","${(mod.titulo || "").replace(/"/g, '""')}","${(mod.estado || "").replace(/"/g, '""')}","${(mod.explicacion || "").replace(/"/g, '""')}"\\n`;
      if (mod.avanzado) {
        Object.entries(mod.avanzado).forEach(([vKey, vVal]: [string, any]) => {
          const valStr = typeof vVal === 'object' ? JSON.stringify(vVal) : String(vVal);
          csvContent += `"${key} [Avanzado]","${vKey.replace(/"/g, '""')}","${valStr.replace(/"/g, '""')}",\\n`;
        });
      }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_aguasabia_${analysisResult.consulta_id || "temporal"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    if (!analysisResult) return;
    try {
      setIsExportingExcel(true);
      
      const { utils, write, writeFile } = await import("xlsx");
      
      const wb = utils.book_new();
      
      // Resumen Sheet
      const resumenData = [
        ["Reporte Territorial AguaSabia (Modo Pro)"],
        [],
        ["ID Consulta", analysisResult.consulta_id || "No Guardado"],
        ["Fecha", new Date().toLocaleString()],
        ["Superficie (ha)", analysisResult.area?.superficie_aprox_ha || "N/A"],
        ["Coordenadas (Centroide)", `Lat: ${analysisResult.area?.centroide?.latitud}, Lon: ${analysisResult.area?.centroide?.longitud}`],
        ["Edificado", analysisResult.modulos?.territorio?.datos?.edificado ? "Sí" : "No"],
        ["Cruza Río", analysisResult.modulos?.territorio?.datos?.atraviesa_rio ? "Sí" : "No"]
      ];
      
      const wsResumen = utils.aoa_to_sheet(resumenData);
      utils.book_append_sheet(wb, wsResumen, "Resumen");
      
      // Módulos Sheet
      const modulosData = [
        ["Módulo", "Dato", "Valor"]
      ];
      
      if (analysisResult.modulos?.suelo?.datos) {
        modulosData.push(["Suelo", "Textura", analysisResult.modulos.suelo.datos.textura || "N/A"]);
        modulosData.push(["Suelo", "pH", analysisResult.modulos.suelo.datos.ph_suelo || "N/A"]);
      }
      if (analysisResult.modulos?.clima?.datos) {
        modulosData.push(["Clima", "ET0 Anual (mm)", analysisResult.modulos.clima.datos.et0_anual || "N/A"]);
        modulosData.push(["Clima", "Temp Promedio (°C)", analysisResult.modulos.clima.datos.temp_promedio || "N/A"]);
      }
      
      const wsModulos = utils.aoa_to_sheet(modulosData);
      utils.book_append_sheet(wb, wsModulos, "Detalles Módulos");

      const filename = `Reporte_Pro_AguaSabia_${analysisResult.area?.superficie_aprox_ha || 0}ha.xlsx`;
      const rw = (window as any).ReactNativeWebView;

      if (rw) {
        // Send Base64 to Expo App
        const base64 = write(wb, { type: "base64", bookType: "xlsx" });
        rw.postMessage(JSON.stringify({
          type: "download_excel",
          filename,
          data: base64
        }));
      } else {
        // Normal Browser Download
        writeFile(wb, filename);
      }
    } catch (err: any) {
      console.error("Error al exportar Excel:", err);
      alert("Hubo un error al generar el archivo Excel Pro. Intenta nuevamente.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    setAddressSearch(sug.display_name);
    setLastSelected(sug.display_name);
    setShowSuggestions(false);
    setAddressSuggestions([]);

    const latNum = parseFloat(sug.lat);
    const lonNum = parseFloat(sug.lon);
    
    let bbox = undefined;
    if (sug.boundingbox && sug.boundingbox.length === 4) {
      bbox = {
        min_latitud: parseFloat(sug.boundingbox[0]),
        min_longitud: parseFloat(sug.boundingbox[2]),
        max_latitud: parseFloat(sug.boundingbox[1]),
        max_longitud: parseFloat(sug.boundingbox[3])
      };
    } else {
      bbox = {
        min_latitud: latNum - 0.005,
        min_longitud: lonNum - 0.005,
        max_latitud: latNum + 0.005,
        max_longitud: lonNum + 0.005
      };
    }

    setPolygon([]);
    setAnalysisResult({
      area: {
        centroide: { latitud: latNum, longitud: lonNum },
        bbox
      }
    } as any);
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;
    setIsSearchingAddress(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&q=${encodeURIComponent(addressSearch)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const sug = data[0];
        setAddressSearch(sug.display_name);
        setLastSelected(sug.display_name);
        setAddressSuggestions([]);
        
        const latNum = parseFloat(sug.lat);
        const lonNum = parseFloat(sug.lon);
        
        let bbox = undefined;
        if (sug.boundingbox && sug.boundingbox.length === 4) {
          bbox = {
            min_latitud: parseFloat(sug.boundingbox[0]),
            min_longitud: parseFloat(sug.boundingbox[2]),
            max_latitud: parseFloat(sug.boundingbox[1]),
            max_longitud: parseFloat(sug.boundingbox[3])
          };
        } else {
          bbox = {
            min_latitud: latNum - 0.005,
            min_longitud: lonNum - 0.005,
            max_latitud: latNum + 0.005,
            max_longitud: lonNum + 0.005
          };
        }

        setPolygon([]);
        setAnalysisResult({
          area: {
            centroide: { latitud: latNum, longitud: lonNum },
            bbox
          }
        } as any);
      } else {
        alert("Dirección o comuna no encontrada en Chile. Intente con otra búsqueda.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al buscar la dirección.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

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

            {!isPremiumPro && (
              <div className="text-[10px] text-primary bg-primary/10 p-2 rounded-lg border border-primary/20 leading-snug">
                ⭐ <strong>Análisis Pro:</strong> Habilita datos climáticos históricos y evapotranspiración detallada.
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

            {datos.atraviesa_rio ? (
              <div className="bg-cyan-500/10 border border-cyan-500/25 p-2.5 rounded-lg text-cyan-600 dark:text-cyan-400 text-[10px] font-semibold mt-2">
                🌊 El terreno atraviesa {datos.rios_intersectados_nombres?.length || 1} río(s):{" "}
                <span className="font-bold underline">{datos.rios_intersectados_nombres?.join(", ")}</span>
              </div>
            ) : (
              <div className="bg-muted/30 border border-border/30 p-2.5 rounded-lg text-muted-foreground text-[10px] mt-2">
                ✓ El terreno no atraviesa ningún río registrado.
              </div>
            )}

            {!isPremiumPro && (
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                ⭐ <strong>Análisis Pro:</strong> Identifica cuencas hidrográficas, acuíferos protegidos y decretos de escasez DGA.
              </div>
            )}

            {isPremiumPro && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-primary block">💧 Capas Hidrográficas DGA (Cruce Espacial):</span>
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

                {modulo.avanzado?.acuiferos_protegidos && modulo.avanzado.acuiferos_protegidos.length > 0 && (
                  <div className="mt-2">
                    <span className="text-primary font-semibold">Acuíferos Protegidos:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-muted-foreground font-mono mt-0.5">
                      {modulo.avanzado.acuiferos_protegidos.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {modulo.avanzado?.areas_restriccion && modulo.avanzado.areas_restriccion.length > 0 && (
                  <div className="mt-2">
                    <span className="text-amber-500 font-semibold">Restricción / Prohibición:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-amber-500 font-mono mt-0.5">
                      {modulo.avanzado.areas_restriccion.map((a: any, idx: number) => <li key={idx}>{a.nombre} ({a.tipo})</li>)}
                    </ul>
                  </div>
                )}

                {modulo.avanzado?.declaraciones_agotamiento && modulo.avanzado.declaraciones_agotamiento.length > 0 && (
                  <div className="mt-2">
                    <span className="text-destructive font-semibold">Ríos Agotados:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-destructive font-mono mt-0.5">
                      {modulo.avanzado.declaraciones_agotamiento.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}
                
                {modulo.avanzado?.decretos_reserva && modulo.avanzado.decretos_reserva.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sky-500 font-semibold">Decretos Caudal Reserva:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-sky-500 font-mono mt-0.5">
                      {modulo.avanzado.decretos_reserva.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {modulo.avanzado?.embalses_cercanos && modulo.avanzado.embalses_cercanos.length > 0 && (
                  <div className="mt-2">
                    <span className="text-blue-500 font-semibold">Embalses cercanos (5km):</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-blue-500 font-mono mt-0.5">
                      {modulo.avanzado.embalses_cercanos.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {modulo.avanzado?.rios_intersectados && modulo.avanzado.rios_intersectados.length > 0 && (
                  <div className="mt-2">
                    <span className="text-cyan-500 font-semibold">Ríos Intersectados:</span>
                    <ul className="list-disc list-inside pl-1 text-[10px] text-cyan-500 font-mono mt-0.5">
                      {modulo.avanzado.rios_intersectados.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
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
        const isEdificado = datos.edificado ?? false;
        const edificadoMensaje = datos.edificado_mensaje ?? "";

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

            {isEdificado && (
              <div className="bg-yellow-500/10 border border-yellow-500/35 p-2.5 rounded-lg text-yellow-700 dark:text-yellow-400 text-[10px] font-bold mt-2 flex items-start gap-1.5 animate-pulse">
                <span className="text-sm shrink-0">⚠️</span>
                <span>{edificadoMensaje || "Detección de edificación/construcción dentro del polígono."}</span>
              </div>
            )}

            {datos.atraviesa_rio && (
              <div className="bg-cyan-500/10 border border-cyan-500/35 p-2.5 rounded-lg text-cyan-700 dark:text-cyan-400 text-[10px] font-bold mt-2 flex items-start gap-1.5">
                <span className="text-sm shrink-0">🌊</span>
                <span>El polígono intersecta con un río o cauce superficial.</span>
              </div>
            )}

            {isPremiumPro && modulo.avanzado && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg text-xs leading-relaxed text-muted-foreground space-y-2">
                <div>
                  <strong className="text-primary block">✓ Validación Geoespacial:</strong> Polígono verificado espacialmente en la proyección WGS84 (SRID 4326).
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

      case "vegetacion": {
        return (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">NDVI Promedio</span>
                <div className="relative group inline-block mt-1">
                  <span className="text-base font-bold text-emerald-500 flex items-center gap-1 cursor-help border-b border-dashed border-emerald-500/50 pb-0.5">
                    🌿 {datos.ndvi_promedio ?? 0.45}
                  </span>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-64 p-3 bg-slate-800 text-white text-[11px] rounded-md shadow-lg z-50 normal-case font-normal leading-tight">
                    <p className="mb-1 font-bold text-emerald-400">Índice de Diferencia Normalizada de Vegetación</p>
                    {Number(datos.ndvi_promedio ?? 0.45) < 0.2 
                      ? "Valor muy bajo (0.0 - 0.2): Suelo desnudo, rocas, nieve o áreas muy secas sin vegetación." 
                      : Number(datos.ndvi_promedio ?? 0.45) < 0.5 
                        ? "Valor medio (0.2 - 0.5): Vegetación escasa, matorrales, pastizales secos o cultivos en etapa temprana."
                        : "Valor alto (0.5 - 1.0): Vegetación densa, bosques frondosos o cultivos muy saludables."}
                    <div className="absolute left-4 top-full w-0 h-0 border-t-[6px] border-t-slate-800 border-x-[6px] border-x-transparent" />
                  </div>
                </div>
              </div>
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Vigor Vegetal</span>
                <div className="relative group inline-block mt-1">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1 cursor-help border-b border-dashed border-border pb-0.5">
                    {datos.cobertura_vegetal ?? "Media"}
                  </span>
                  <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2.5 bg-slate-800 text-white text-[11px] rounded-md shadow-lg z-50 normal-case font-normal leading-tight">
                    Interpretación cualitativa de la densidad y actividad fotosintética (salud) de las plantas en el terreno.
                    <div className="absolute right-4 top-full w-0 h-0 border-t-[6px] border-t-slate-800 border-x-[6px] border-x-transparent" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              El verdor satelital indica un vigor vegetal medio en el predio. No hay anomalías graves.
            </p>

            {!isPremiumPro && (
              <div className="text-[10px] text-primary bg-primary/10 p-2 rounded-lg border border-primary/20 leading-snug">
                ⭐ <strong>Análisis Pro:</strong> Habilita la grilla interactiva NDVI sobre el mapa para ver la distribución de clorofila.
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

            <p className="text-xs text-muted-foreground leading-relaxed">
              {(riesgo_sequia === "Alto" || estres_hidrico === "Alto") 
                ? "Atención: La zona presenta indicadores elevados de sequía o estrés térmico. Se recomienda monitorear fuentes de agua."
                : "Los indicadores de peligro y anomalías térmicas se encuentran estables en la zona seleccionada."
              }
            </p>

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

      case "suelo": {
        const { textura, ph_suelo } = datos;
        
        const TEXTURE_DESCRIPTIONS: Record<string, string> = {
          "Arenosa": "Suelo ligero, retiene poca agua y nutrientes. Alto drenaje.",
          "Areno-Franca": "Suelo ligero con algo más de limo/arcilla. Drenaje rápido.",
          "Franco-Arenosa": "Equilibrado pero tendiendo a arenoso. Buen drenaje.",
          "Franco": "Textura ideal agrícola. Equilibrio perfecto entre retención y drenaje.",
          "Franco-Limosa": "Equilibrado, suave y retiene bien el agua y nutrientes.",
          "Limosa": "Partículas finas, retiene mucha agua, susceptible a compactación.",
          "Franco-Arcillosa": "Retiene bastante humedad y nutrientes, pero puede presentar mal drenaje.",
          "Franco-Arcillo-Arenosa": "Mezcla pesada con algo de arena. Difícil de trabajar en mojado.",
          "Franco-Arcillo-Limosa": "Mezcla pesada con limo. Muy retentivo de humedad.",
          "Arcillo-Arenosa": "Suelo pesado y pegajoso, mal drenaje pero retiene nutrientes.",
          "Arcillo-Limosa": "Suelo muy pesado, retiene mucha agua, lento drenaje.",
          "Arcillosa": "Suelo muy pesado, drena muy lento y se agrieta al secarse."
        };
        const tooltipDesc = TEXTURE_DESCRIPTIONS[textura ?? "Franco"] || "Clasificación de textura edafológica.";

        return (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Textura</span>
                <div className="relative group inline-block mt-1">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 cursor-help border-b border-dashed border-amber-600/50 pb-0.5">
                    🪵 {textura ?? "Franco"}
                  </span>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2.5 bg-slate-800 text-white text-[11px] rounded-md shadow-lg z-50 normal-case font-normal leading-tight">
                    {tooltipDesc}
                    <div className="absolute left-4 top-full w-0 h-0 border-t-[6px] border-t-slate-800 border-x-[6px] border-x-transparent" />
                  </div>
                </div>
              </div>
              <div className="bg-background/60 p-2.5 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">pH del Suelo</span>
                <div className="relative group inline-block mt-1">
                  <span className="text-base font-bold text-emerald-500 flex items-center gap-1 cursor-help border-b border-dashed border-emerald-500/50 pb-0.5">
                    🧪 {ph_suelo ?? "6.5"}
                  </span>
                  <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-56 p-2.5 bg-slate-800 text-white text-[11px] rounded-md shadow-lg z-50 normal-case font-normal leading-tight">
                    {Number(ph_suelo ?? 6.5) < 5.5 
                      ? "Suelo Ácido: Puede limitar la disponibilidad de nutrientes como fósforo y requerir encalado." 
                      : Number(ph_suelo ?? 6.5) > 7.5 
                        ? "Suelo Alcalino: Puede presentar deficiencia de micronutrientes (hierro, zinc) por insolubilidad."
                        : "Suelo Neutro/Óptimo: Máxima disponibilidad de la mayoría de los nutrientes esenciales para las plantas."}
                    <div className="absolute right-4 top-full w-0 h-0 border-t-[6px] border-t-slate-800 border-x-[6px] border-x-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              El suelo en el centroide posee textura predominante de tipo {textura ?? "Franco"}, con un pH promedio de {ph_suelo ?? "6.5"}.
            </p>

            {!isPremiumPro && (
              <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-snug">
                ⭐ <strong>Análisis Pro:</strong> Habilita el detalle de la composición porcentual de arcilla, arena y limo.
              </div>
            )}

            {isPremiumPro && modulo.avanzado && (
              <div className="bg-primary/5 border border-primary/15 p-2.5 rounded-lg space-y-1 text-xs">
                <span className="font-bold text-primary block">🌱 Composición Edafológica Pro:</span>
                {modulo.avanzado.composicion ? (
                  <div className="font-mono text-[10px] text-muted-foreground space-y-0.5">
                    <div>• Arcilla: {modulo.avanzado.composicion.arcilla_pct}%</div>
                    <div>• Arena: {modulo.avanzado.composicion.arena_pct}%</div>
                    <div>• Limo: {modulo.avanzado.composicion.limo_pct}%</div>
                    <div>• Nitrógeno: {modulo.avanzado.propiedades?.nitrogeno_g_kg} g/kg</div>
                    <div>• Lat/Lon Consulta: {modulo.avanzado.coordenadas_consulta?.latitud?.toFixed(4)}, {modulo.avanzado.coordenadas_consulta?.longitud?.toFixed(4)}</div>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">Datos detallados no disponibles.</div>
                )}
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

  // Preparar elementos de capas para desplegables de centrado
  const layerItems: Record<string, { name: string; lat: number; lng: number }[]> = {};

  if (activeLayers.includes("acuiferos") && acuiferosData?.features) {
    layerItems["acuiferos"] = acuiferosData.features.map((f: any) => {
      let lat = -33.45;
      let lng = -70.66;
      if (f.geometry?.type === "MultiPolygon" && f.geometry.coordinates?.[0]?.[0]?.[0]) {
        const coord = f.geometry.coordinates[0][0][0];
        lng = coord[0];
        lat = coord[1];
      } else if (f.geometry?.type === "Polygon" && f.geometry.coordinates?.[0]?.[0]) {
        const coord = f.geometry.coordinates[0][0];
        lng = coord[0];
        lat = coord[1];
      }
      return {
        name: f.properties?.nombre || "Acuífero DGA",
        lat,
        lng
      };
    });
  }

  // Capas eliminadas del listado lateral para optimización de rendimiento:
  // - humedales
  // - cuencas
  // - incendios
  // - sequia

  if (activeLayers.includes("rios")) {
    layerItems["rios"] = (estacionesFiltradas || [])
      .filter((f: any) => f.properties?.tipo_estacion?.toLowerCase().includes("fluvio"))
      .map((f: any) => ({
        name: f.properties?.nombre || "Estación Fluviométrica",
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));
  }

  if (activeLayers.includes("embalses")) {
    layerItems["embalses"] = (estacionesFiltradas || [])
      .filter((f: any) => {
        const t = f.properties?.tipo_estacion?.toLowerCase() || "";
        return t.includes("control") || t.includes("nivel");
      })
      .map((f: any) => ({
        name: f.properties?.nombre || "Embalse/Estación Control",
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));
  }

  const handleItemSelect = (item: { name: string; lat: number; lng: number }) => {
    setFocusFeature({ lat: item.lat, lng: item.lng, timestamp: Date.now() });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden bg-background relative">
      {/* Panel Izquierdo - Herramientas (Collapsible) */}
      {leftPanelOpen ? (
        <div className="absolute md:relative left-0 top-0 bottom-0 z-[1001] md:z-auto w-72 md:w-80 bg-background md:bg-card/65 border-r border-border/50 p-5 flex flex-col overflow-y-auto space-y-6 shadow-2xl md:shadow-none shrink-0 h-full">
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground border border-border/50 p-1.5 rounded bg-muted/40 transition active:scale-[0.97]"
            title="Ocultar herramientas"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="font-extrabold text-xl text-brand-gradient tracking-tight border-b border-border/40 pb-2 flex items-center gap-2 pt-2">
            Herramientas
          </h2>
          
          {/* Búsqueda por dirección */}
          <form onSubmit={handleAddressSearch} className="space-y-1.5 pt-1 relative">
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Buscar dirección o comuna
            </label>
            <div className="flex gap-1.5 relative">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Ej. Avenida Central, Chile"
                  value={addressSearch}
                  onChange={(e) => {
                    setAddressSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full p-2 text-xs border border-border/80 rounded-md bg-background focus:ring-1 focus:ring-primary outline-none"
                />
                
                {showSuggestions && addressSuggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={() => setShowSuggestions(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-card border border-border/80 rounded-lg shadow-xl z-[50] max-h-60 overflow-y-auto divide-y divide-border/40 animate-fade-in">
                      {addressSuggestions.map((sug, idx) => {
                        const addr = sug.address || {};
                        const main = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.amenity || addr.historic || addr.city || addr.state || sug.display_name.split(',')[0];
                        const secondaryParts = [
                          addr.city || addr.town || addr.village || addr.municipality || addr.suburb,
                          addr.state || addr.region
                        ].filter(Boolean);
                        const secondary = secondaryParts.join(', ');

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(sug)}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-xs transition-colors flex flex-col gap-0.5 border-b border-border/10 last:border-b-0"
                          >
                            <span className="font-bold text-foreground truncate">{main}</span>
                            {secondary && <span className="text-[10px] text-muted-foreground truncate">{secondary}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSearchingAddress}
                className="bg-muted hover:bg-muted/80 text-foreground border border-border/80 font-bold px-3 py-2 rounded-md text-xs transition active:scale-[0.95] shrink-0"
              >
                {isSearchingAddress ? "..." : "Buscar"}
              </button>
            </div>
          </form>

          {/* Formas Geométricas automáticas */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Formas Rápidas (Pincel de polígono)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPlacingShape(placingShape === "square" ? null : "square");
                  setIsDrawing(false);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition border border-border/60 ${
                  placingShape === "square" 
                    ? "bg-primary/20 border-primary text-primary font-bold shadow-sm shadow-primary/10" 
                    : "bg-muted hover:bg-primary/10 border-border/60 text-foreground"
                }`}
                title="Haz click en el mapa para ubicar un cuadrado. Rueda del mouse para agrandar/achicar."
              >
                Cuadrado
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlacingShape(placingShape === "rectangle" ? null : "rectangle");
                  setIsDrawing(false);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition border border-border/60 ${
                  placingShape === "rectangle" 
                    ? "bg-primary/20 border-primary text-primary font-bold shadow-sm shadow-primary/10" 
                    : "bg-muted hover:bg-primary/10 border-border/60 text-foreground"
                }`}
                title="Haz click en el mapa para ubicar un rectángulo. Rueda del mouse para agrandar/achicar."
              >
                Rectángulo
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlacingShape(placingShape === "triangle" ? null : "triangle");
                  setIsDrawing(false);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition border border-border/60 ${
                  placingShape === "triangle" 
                    ? "bg-primary/20 border-primary text-primary font-bold shadow-sm shadow-primary/10" 
                    : "bg-muted hover:bg-primary/10 border-border/60 text-foreground"
                }`}
                title="Haz click en el mapa para ubicar un triángulo. Rueda del mouse para agrandar/achicar."
              >
                Triángulo
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsDrawing(!isDrawing);
                  setPlacingShape(null); // Cancel placing shape
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isDrawing ? "bg-destructive text-destructive-foreground shadow-md shadow-destructive/20" : "bg-muted hover:bg-muted/80 text-foreground border border-border/60"}`}
              >
                {isDrawing ? "Detener Dibujo" : "Dibujar Área"}
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
            <LayerSelector 
              selected={activeLayers} 
              onChange={setActiveLayers}
              layerItems={layerItems}
              onItemSelect={handleItemSelect}
            />
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setLeftPanelOpen(true)}
          className="hidden md:flex w-10 bg-card border-r border-border/50 hover:bg-muted transition items-center justify-center font-bold text-primary shrink-0 text-sm active:bg-muted/50"
          title="Maximizar herramientas"
        >
          ▶
        </button>
      )}

      {/* Mapa Central */}
      <div className={`flex-1 bg-muted relative p-0 md:p-4 h-full w-full ${isDrawing ? "cursor-paintbrush" : ""} ${placingShape ? "cursor-crosshair" : ""}`}>
        <MapContainer 
          polygon={polygon} 
          onPolygonChange={setPolygon}
          drawEnabled={isDrawing}
          area={analysisResult?.area}
          estaciones={estacionesFiltradas}
          activeLayers={activeLayers}
          analysisResult={analysisResult}
          placingShape={placingShape}
          onPlacingShapeChange={setPlacingShape}
          focusFeature={focusFeature}
          userType={isPremiumPro ? "pro" : "visitante"}
          fechaInicio={fechaInicio}
          fechaHistorica={fechaHistorica}
          selectedWildfireYear={selectedWildfireYear}
          className="h-full rounded-xl shadow-lg border border-border/60 overflow-hidden"
        />

        {/* Botón flotante X para cerrar el mapa y volver al Home */}
        <Link
          to="/"
          className="absolute top-4 right-4 z-[999] w-10 h-10 rounded-full bg-slate-950/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 active:scale-[0.95] shadow-lg transition-all"
          title="Salir al Inicio"
        >
          <X className="h-5 w-5" />
        </Link>

        {/* Botón flotante de menú para abrir Herramientas en móvil */}
        {!leftPanelOpen && (
          <button 
            onClick={() => setLeftPanelOpen(true)}
            className="absolute top-4 left-4 z-[999] p-2.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-primary shadow-xl hover:bg-slate-800 transition active:scale-[0.9] md:hidden"
            title="Mostrar herramientas"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Botón flotante de info para abrir Reporte en móvil */}
        {!rightPanelOpen && (
          <button 
            onClick={() => setRightPanelOpen(true)}
            className="absolute top-4 right-16 z-[999] p-2.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-primary shadow-xl hover:bg-slate-800 transition active:scale-[0.9] md:hidden"
            title="Mostrar reporte"
          >
            <Info className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Panel Derecho - Resultados (Collapsible) */}
      {rightPanelOpen ? (
        <div className="absolute md:relative right-0 top-0 bottom-0 z-[1001] md:z-auto w-72 md:w-96 bg-background md:bg-card/65 border-l border-border/50 p-6 flex flex-col overflow-y-auto space-y-6 shadow-2xl md:shadow-none shrink-0 h-full">
          <button 
            onClick={() => setRightPanelOpen(false)}
            className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground border border-border/50 p-1.5 rounded bg-muted/40 transition active:scale-[0.97] z-10"
            title="Ocultar reporte"
          >
            ▶
          </button>
          
          <h2 className="font-extrabold text-xl text-brand-gradient tracking-tight border-b border-border/40 pb-2 pt-2">
            Reporte Hídrico
          </h2>

          {/* Botón Dashboard Completo para usuarios Pro */}
          {isPremiumPro && analysisResult && (
            <button 
              onClick={() => setShowDashboard(true)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white py-3 rounded-lg font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition text-xs flex items-center justify-center gap-1.5"
            >
              📊 Dashboard Completo (Pro)
            </button>
          )}

          {/* Botón Actualizar en Vivo si viene del Historial */}
          {consultaIdParam && polygon.length >= 3 && (
            <button 
              onClick={handleAnalyze}
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-amber-500 text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-95 transition hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-1 text-xs"
            >
              Actualizar Reporte en Vivo
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

          {!mutation.isPending && !mutation.isError && (!analysisResult || !analysisResult.modulos) && (
            <div className="text-center py-12 text-muted-foreground text-xs leading-relaxed space-y-2">
              <Info className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p>Dibuja un polígono sobre tu predio o parcela de interés y presiona "Analizar Territorio" para visualizar los balances hídricos.</p>
            </div>
          )}

          {analysisResult && analysisResult.modulos && (
            <div className="space-y-5">
              {(() => {
                const centerLat = analysisResult.area?.centroide?.latitud;
                const centerLng = analysisResult.area?.centroide?.longitud;
                if (centerLat !== undefined && centerLng !== undefined) {
                  // Rough mainland Chile bounds check
                  const isMainlandChile = centerLat >= -56.0 && centerLat <= -17.0 && centerLng >= -76.0 && centerLng <= -66.0;
                  if (!isMainlandChile) {
                    return (
                      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1 mb-2">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                          <span>⚠️</span>
                          <span>Análisis fuera de territorio continental</span>
                        </div>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 leading-relaxed">
                          El polígono seleccionado abarca zona marítima u otros países. Los cruces con capas oficiales (DGA, CONAF) y las predicciones agroclimáticas pueden no estar disponibles o presentar desviaciones.
                        </p>
                      </div>
                    );
                  }
                }
                return null;
              })()}
              
              {analysisResult.resumen_general && (
                <div className="bg-muted/50 border border-border/40 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold text-xs uppercase text-primary tracking-wider">Resumen General</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {analysisResult.resumen_general}
                  </p>
                </div>
              )}

              {Object.entries(analysisResult.modulos).map(([key, modulo]: [string, any]) => (
                modulo && (
                  <div key={key} className="border border-border/60 rounded-xl p-4 bg-card/45 shadow-sm space-y-2">
                    <div className="flex justify-between items-center border-b border-border/30 pb-1.5 relative">
                      <h4 className="font-bold text-sm text-foreground capitalize flex items-center gap-1.5">
                        {modulo.titulo}
                        {(modulo.estado === "pendiente" || modulo.estado === "no_disponible") && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                            Próximamente
                          </span>
                        )}
                      </h4>
                      
                      {concepts[key] && (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTooltipConcept(openTooltipConcept === key ? null : key);
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                            title="Aprender más sobre este concepto"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>

                          {openTooltipConcept === key && (
                            <div className="absolute right-0 bottom-6 z-30 bg-slate-900 text-white text-[11px] p-3 rounded-lg shadow-xl w-60 border border-border/40 leading-relaxed font-sans font-normal normal-case">
                              <div className="font-bold border-b border-white/20 pb-1 mb-1 flex justify-between items-center">
                                <span>{concepts[key].title}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenTooltipConcept(null);
                                  }}
                                  className="text-white hover:text-red-400 font-bold ml-2"
                                >
                                  ×
                                </button>
                              </div>
                              {concepts[key].desc}
                              {/* Pequeña flecha hacia abajo */}
                              <div className="absolute right-2 -bottom-2 w-0 h-0 border-t-8 border-t-slate-900 border-x-8 border-x-transparent" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-foreground/80 leading-relaxed">{modulo.explicacion}</p>
                    
                    {modulo.estado !== "pendiente" && modulo.estado !== "no_disponible" && (
                      <div className="pt-1">
                        {renderModuloDatos(key, modulo)}
                      </div>
                    )}
                  </div>
                )
              ))}

              {/* Botón Análisis Pro al final del reporte para usuarios no pro */}
              {!isPremiumPro && (
                <button 
                  onClick={() => setShowPromoModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-3 rounded-lg font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition text-xs flex items-center justify-center gap-1.5 mt-4"
                >
                  ⭐ Análisis Pro
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setRightPanelOpen(true)}
          className="hidden md:flex w-10 bg-card border-l border-border/50 hover:bg-muted transition items-center justify-center font-bold text-primary shrink-0 text-sm active:bg-muted/50"
          title="Maximizar reporte"
        >
          ◀
        </button>
      )}

      {/* Modal Promocional */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
            <span className="text-4xl">⭐</span>
            <h3 className="text-xl font-extrabold text-brand-gradient">Mejora tu Plan a Pro</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El modo avanzado e intersecciones geoespaciales requieren una cuenta Premium. Obtén acceso a cruces espaciales completos de cuencas y decretos oficiales de la DGA, y datos satelitales crudos de Sentinel-2.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => setShowPromoModal(false)}
                className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg border border-border/80 text-xs transition"
              >
                Cerrar
              </button>
              <button 
                onClick={handleUpgradeToPro}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition shadow-md"
              >
                Ir a Pro
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Upgrade Pro detallado */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-card border border-border/85 rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="text-4xl text-amber-400 drop-shadow block animate-bounce">⭐</span>
              <h3 className="text-xl font-black text-brand-gradient">Suscripción Profesional Pro</h3>
              <p className="text-xs text-muted-foreground">
                Desbloquea la suite completa de teledetección satelital e hidrometría de precisión.
              </p>
            </div>

            <div className="border-t border-b border-border/40 py-3.5 space-y-2.5">
              {[
                { title: "Balances Hídricos Avanzados", desc: "Cálculos diarios basados en modelos evapotranspiración FAO-56 Penman-Monteith." },
                { title: "Teledetección Satelital NDVI", desc: "Grilla espectral activa sobre el mapa obtenida en tiempo real de Sentinel-2 para medir vigor vegetal." },
                { title: "Cruces Geoespaciales Oficiales", desc: "Cruce geográfico automático con capas oficiales de la DGA (Cuencas afectadas, Decretos de Escasez Hídrica)." },
                { title: "Estudio de Inversión Predial", desc: "Inferencia de riesgos ecológicos y factibilidad de compra predial asistida." },
                { title: "Exportación Ilimitada", desc: "Descarga tus análisis territoriales en formatos tabulares CSV y reportes de impresión PDF." },
                { title: "Historial Ilimitado", desc: "Almacena sin restricciones todas tus consultas territoriales en tu cuenta." }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-2 text-xs">
                  <span className="text-amber-400 font-bold shrink-0">✓</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block leading-tight">{b.title}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg border border-border/80 text-xs transition active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmUpgradeToPro}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-lg text-xs transition shadow-md active:scale-[0.97]"
              >
                Suscribirse ($5.000/mes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dashboard Pro */}
      {showDashboard && (
        <DashboardProModal 
          onClose={() => setShowDashboard(false)} 
          analysisResult={analysisResult} 
          fechaHistorica={fechaHistorica}
        />
      )}
    </div>
  );
}
