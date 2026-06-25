import { useState } from "react";

export function LearnPage() {
  const [precipitacion, setPrecipitacion] = useState(16);
  const [et0, setEt0] = useState(4.2);
  const [ndvi, setNdvi] = useState(0.45);
  const [hoveredVar, setHoveredVar] = useState<string | null>(null);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  // Cálculos dinámicos
  const balance = precipitacion - et0;
  
  // Lógica de inferencia educativa (coincide con el motor de riesgos del backend)
  let estadoRiesgo = "Bajo";
  let colorClase = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let explicacion = "Las condiciones del territorio son estables. El vigor vegetal es adecuado y no se detectan alertas críticas.";

  if (ndvi < 0.2) {
    estadoRiesgo = "Crítico / Alto";
    colorClase = "text-red-500 bg-red-500/10 border-red-500/20";
    explicacion = "El vigor de la vegetación (NDVI < 0.2) es críticamente bajo, indicando sequía severa, suelo desnudo o vegetación muerta.";
  } else if (precipitacion < 5 && ndvi < 0.4) {
    estadoRiesgo = "Moderado (Estrés Hídrico Severo)";
    colorClase = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    explicacion = "La vegetación muestra pérdida de verdor (NDVI < 0.4) combinada con nula o escasa lluvia reciente (< 5 mm). Hay déficit hídrico activo en el suelo.";
  } else if (ndvi >= 0.4) {
    estadoRiesgo = "Bajo (Vegetación Saludable)";
    colorClase = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    explicacion = "El índice NDVI indica presencia de vegetación fotosintéticamente activa con buena densidad foliar. Resiliencia alta.";
  } else if (precipitacion === 0 && et0 >= 5) {
    estadoRiesgo = "Moderado (Atención Climática)";
    colorClase = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    explicacion = "Lluvia nula y alta evapotranspiración (evaporación diaria >= 5 mm). El suelo está perdiendo humedad rápidamente; la vegetación entrará en estrés pronto.";
  }

  // Descripciones didácticas dinámicas de lo que representan las cantidades elegidas
  const getPrecipitacionExplicacion = (val: number) => {
    if (val === 0) return "0 mm: Sin lluvias. El suelo no recibe aporte de agua externo.";
    if (val < 5) return `${val} mm: Llovizna o lluvia débil. Aporte mínimo (equivalente a ${val} litros de agua por metro cuadrado).`;
    if (val < 15) return `${val} mm: Lluvia moderada (equivalente a ${val} litros de agua por metro cuadrado). Humedece la superficie del suelo de forma estable.`;
    return `${val} mm: Lluvia intensa (equivalente a ${val} litros de agua por metro cuadrado). Gran aporte de humedad, útil para recargar napas pero con riesgo de escorrentía si el suelo está saturado.`;
  };

  const getEt0Explicacion = (val: number) => {
    if (val < 2) return `${val.toFixed(1)} mm: Evaporación muy baja. Condición fría o muy húmeda. La pérdida de agua del suelo es mínima.`;
    if (val < 5) return `${val.toFixed(1)} mm: Evaporación moderada. Condición templada estándar. Pérdida de ${val.toFixed(1)} litros de agua por metro cuadrado diarios.`;
    return `${val.toFixed(1)} mm: Evaporación muy alta. Condición cálida, soleada o con viento seco. El suelo y las plantas pierden agua de forma crítica hacia la atmósfera.`;
  };

  const getNdviExplicacion = (val: number) => {
    if (val < 0.2) return `${val.toFixed(2)}: Suelo desnudo, rocas, agua o vegetación muerta/seca. Ausencia de fotosíntesis activa.`;
    if (val < 0.4) return `${val.toFixed(2)}: Arbustos dispersos, pastizales secos o vegetación bajo estrés severo.`;
    if (val < 0.7) return `${val.toFixed(2)}: Vegetación de vigor medio, cultivos jóvenes en crecimiento activo.`;
    return `${val.toFixed(2)}: Follaje denso y verde saludable en plenitud de fotosíntesis (bosque o cultivo maduro irrigado).`;
  };

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-8 bg-background text-foreground">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Simulador Educativo Interactivo
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-gradient">
          Simulador de Balance y Riesgo Hídrico
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Modifique las variables ambientales para comprender la interacción física entre la atmósfera, la precipitación y la vegetación en un predio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Izquierdo: Controles (Sliders) */}
        <div className="lg:col-span-5 bg-card border border-border/60 p-6 rounded-xl space-y-6 shadow-sm">
          <h2 className="font-bold text-lg border-b border-border/40 pb-2">
            Variables Ambientales
          </h2>

          {/* Slider Precipitación */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm relative">
              <label 
                onMouseEnter={() => setHoveredVar("precipitacion")}
                onMouseLeave={() => setHoveredVar(null)}
                className="font-semibold cursor-help border-b border-dashed border-muted-foreground/60 pb-0.5 text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Precipitación Reciente
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold text-emerald-500">
                {precipitacion} mm
              </span>
              
              {hoveredVar === "precipitacion" && (
                <div className="absolute z-30 bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl w-64 -top-20 left-0 border border-border/40 backdrop-blur-sm">
                  Cantidad de lluvia registrada en el predio. Aporta humedad directa al perfil del suelo y recarga acuíferos.
                </div>
              )}
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="1"
              value={precipitacion}
              onChange={(e) => setPrecipitacion(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-emerald-600 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 leading-snug">
              {getPrecipitacionExplicacion(precipitacion)}
            </p>
          </div>

          {/* Slider Evapotranspiración */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm relative">
              <label 
                onMouseEnter={() => setHoveredVar("et0")}
                onMouseLeave={() => setHoveredVar(null)}
                className="font-semibold cursor-help border-b border-dashed border-muted-foreground/60 pb-0.5 text-red-500 hover:text-red-400 transition-colors"
              >
                Evapotranspiración (ET0)
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold text-red-500">
                {et0.toFixed(1)} mm
              </span>

              {hoveredVar === "et0" && (
                <div className="absolute z-30 bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl w-64 -top-20 left-0 border border-border/40 backdrop-blur-sm">
                  Pérdida de agua combinada por evaporación directa del suelo y transpiración foliar de las plantas hacia la atmósfera.
                </div>
              )}
            </div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1"
              value={et0}
              onChange={(e) => setEt0(Number(e.target.value))}
              className="w-full accent-red-500 bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-red-600 bg-red-500/5 p-2 rounded-lg border border-red-500/10 leading-snug">
              {getEt0Explicacion(et0)}
            </p>
          </div>

          {/* Slider NDVI */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm relative">
              <label 
                onMouseEnter={() => setHoveredVar("ndvi")}
                onMouseLeave={() => setHoveredVar(null)}
                className="font-semibold cursor-help border-b border-dashed border-muted-foreground/60 pb-0.5 text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                Vigor de Vegetación (NDVI)
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold text-cyan-500">
                {ndvi.toFixed(2)}
              </span>

              {hoveredVar === "ndvi" && (
                <div className="absolute z-30 bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl w-64 -top-20 left-0 border border-border/40 backdrop-blur-sm">
                  Índice de vegetación satelital. Mide el vigor fotosintético y clorofila foliar de la cobertura vegetal.
                </div>
              )}
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.01"
              value={ndvi}
              onChange={(e) => setNdvi(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-cyan-600 bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10 leading-snug">
              {getNdviExplicacion(ndvi)}
            </p>
          </div>
        </div>

        {/* Panel Derecho: Cálculos e Interpretaciones en tiempo real */}
        <div className="lg:col-span-7 bg-card border border-border/60 p-6 rounded-xl space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="font-bold text-lg border-b border-border/40 pb-2">
              Balance e Interpretación Científica
            </h2>

            {/* Fila de Tarjetas de Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balance Hídrico */}
              <div 
                onMouseEnter={() => setShowBalanceDetails(true)}
                onMouseLeave={() => setShowBalanceDetails(false)}
                className="bg-background/60 border border-border/50 p-4 rounded-lg flex flex-col justify-between relative cursor-help"
              >
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Balance Hídrico Neto Diario
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-extrabold ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {balance >= 0 ? "+" : ""}{balance.toFixed(1)} mm
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">L/m²</span>
                </div>
                <div className="mt-2 text-xs font-semibold">
                  {balance >= 0 ? (
                    <span className="text-emerald-500">Superávit Hídrico</span>
                  ) : (
                    <span className="text-red-500">Déficit Hídrico</span>
                  )}
                </div>

                {showBalanceDetails && (
                  <div className="absolute inset-0 bg-slate-900/95 text-white text-xs p-4 rounded-lg shadow-xl flex items-center justify-center text-center border border-border/40">
                    Calculado como: Precipitación menos Evapotranspiración. Un balance negativo indica pérdida neta de humedad en el suelo hacia la atmósfera.
                  </div>
                )}
              </div>

              {/* Riesgo Inferencia */}
              <div className="bg-background/60 border border-border/50 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Nivel de Riesgo Predictivo
                </span>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colorClase}`}>
                    Riesgo {estadoRiesgo}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  Evaluación automatizada de sequía basada en el vigor vegetal y el déficit acumulado del suelo.
                </p>
              </div>
            </div>

            {/* Diagnóstico Detallado */}
            <div className="bg-muted/40 border border-border/30 p-4 rounded-lg space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Explicación Ecológica
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {explicacion}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/60 text-right pt-4 border-t border-border/30">
            Fórmulas empleadas: Balance = P - ET0 | Algoritmo predictivo basado en el estándar FAO-56.
          </div>
        </div>
      </div>
    </div>
  );
}
