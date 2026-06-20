import { useState } from "react";

export function LearnPage() {
  const [precipitacion, setPrecipitacion] = useState(16);
  const [et0, setEt0] = useState(4.2);
  const [ndvi, setNdvi] = useState(0.45);

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
    if (val === 0) return "🌧️ 0 mm: Sin lluvias. El suelo no recibe aporte de agua externo.";
    if (val < 5) return `🌧️ ${val} mm: Llovizna o lluvia débil. Aporte mínimo (equivalente a ${val} litros de agua por metro cuadrado).`;
    if (val < 15) return `🌧️ ${val} mm: Lluvia moderada (equivalente a ${val} litros de agua por metro cuadrado). Humedece la superficie del suelo de forma estable.`;
    return `🌧️ ${val} mm: Lluvia intensa (equivalente a ${val} litros de agua por metro cuadrado). Gran aporte de humedad, útil para recargar napas pero con riesgo de escorrentía si el suelo está saturado.`;
  };

  const getEt0Explicacion = (val: number) => {
    if (val < 2) return `☀️ ${val.toFixed(1)} mm: Evaporación muy baja. Condición fría o muy húmeda. La pérdida de agua del suelo es mínima.`;
    if (val < 5) return `☀️ ${val.toFixed(1)} mm: Evaporación moderada. Condición templada estándar. Pérdida de ${val.toFixed(1)} litros de agua por metro cuadrado diarios.`;
    return `☀️ ${val.toFixed(1)} mm: Evaporación muy alta. Condición cálida, soleada o con viento seco. El suelo y las plantas pierden agua de forma crítica hacia la atmósfera.`;
  };

  const getNdviExplicacion = (val: number) => {
    if (val < 0.2) return `🌿 ${val.toFixed(2)}: Suelo desnudo, rocas, agua o vegetación muerta/seca. Ausencia de fotosíntesis activa.`;
    if (val < 0.4) return `🌿 ${val.toFixed(2)}: Arbustos dispersos, pastizales secos o vegetación bajo estrés severo.`;
    if (val < 0.7) return `🌿 ${val.toFixed(2)}: Vegetación de vigor medio, cultivos jóvenes en crecimiento activo.`;
    return `🌿 ${val.toFixed(2)}: Follaje denso y verde saludable en plenitud de fotosíntesis (bosque o cultivo maduro irrigado).`;
  };

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-8 bg-background text-foreground">
      {/* Cabecera */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          🎮 Simulador Educativo Interactivo
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-gradient">
          Simulador de Balance y Riesgo Hídrico
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Manipula las variables ambientales del simulador para comprender cómo interactúan la atmósfera, la lluvia y las plantas para definir la salud de un territorio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Izquierdo: Controles (Sliders) */}
        <div className="lg:col-span-5 bg-card border border-border/60 p-6 rounded-xl space-y-6 shadow-sm">
          <h2 className="font-bold text-lg border-b border-border/40 pb-2 flex items-center gap-2">
            ⚙️ Variables Ambientales
          </h2>

          {/* Slider Precipitación */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-1.5">
                🌧️ Lluvia Reciente (Precipitación)
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">
                {precipitacion} mm
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="1"
              value={precipitacion}
              onChange={(e) => setPrecipitacion(Number(e.target.value))}
              className="w-full accent-primary bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-primary bg-primary/5 p-2 rounded-lg border border-primary/10 leading-snug">
              {getPrecipitacionExplicacion(precipitacion)}
            </p>
          </div>

          {/* Slider Evapotranspiración */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-1.5">
                ☀️ Evaporación Atmosférica (Et0)
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">
                {et0.toFixed(1)} mm
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1"
              value={et0}
              onChange={(e) => setEt0(Number(e.target.value))}
              className="w-full accent-amber-500 bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-amber-600 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-snug">
              {getEt0Explicacion(et0)}
            </p>
          </div>

          {/* Slider NDVI */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-semibold flex items-center gap-1.5">
                🌿 Vigor de Vegetación (NDVI)
              </label>
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold text-emerald-500">
                {ndvi.toFixed(2)}
              </span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.01"
              value={ndvi}
              onChange={(e) => setNdvi(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-muted rounded-lg appearance-none cursor-pointer h-2"
            />
            <p className="text-[11px] text-emerald-600 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 leading-snug">
              {getNdviExplicacion(ndvi)}
            </p>
          </div>
        </div>

        {/* Panel Derecho: Cálculos e Interpretaciones en tiempo real */}
        <div className="lg:col-span-7 bg-card border border-border/60 p-6 rounded-xl space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="font-bold text-lg border-b border-border/40 pb-2 flex items-center gap-2">
              📊 Balance e Interpretación Científica
            </h2>

            {/* Fila de Tarjetas de Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balance Hídrico */}
              <div className="bg-background/60 border border-border/50 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Balance Hídrico Neto Diario
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-extrabold ${balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {balance >= 0 ? "+" : ""}{balance.toFixed(1)} mm
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">L/m²</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  Calculado como <span className="font-mono font-semibold">Lluvia - Evaporación</span>. Un valor negativo representa pérdida neta de humedad en el suelo.
                </p>
              </div>

              {/* Riesgo Inferencia */}
              <div className="bg-background/60 border border-border/50 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Nivel de Riesgo Predictivo
                </span>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colorClase}`}>
                    ⚠️ {estadoRiesgo}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  Evaluación automatizada combinando vigor foliar satelital y sequedad atmosférica.
                </p>
              </div>
            </div>

            {/* Diagnóstico Detallado */}
            <div className="bg-muted/40 border border-border/30 p-4 rounded-lg space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                🔍 Explicación Ecológica
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {explicacion}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/60 text-right pt-4 border-t border-border/30">
            Fórmulas empleadas: Balance = P - Et0 | Algoritmo de Decisión Basado en Reglas Sentinel-2 y FAO-56.
          </div>
        </div>
      </div>
    </div>
  );
}
