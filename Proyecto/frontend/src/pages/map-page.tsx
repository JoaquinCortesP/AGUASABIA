import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MapContainer } from "@/components/maps/MapContainer";
import { LayerSelector } from "@/components/maps/LayerSelector";
import { territorioApi } from "@/features/territorio/api/territorio-api";
import type { Coordinates, TerritoryAnalysisResponse } from "@/types/territory";

export function MapPage() {
  const [polygon, setPolygon] = useState<Coordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const mutation = useMutation({
    mutationFn: (coords: Coordinates[]) =>
      territorioApi.analizar({
        poligono: coords,
        modo: "resumen",
        guardar: false,
        modulos: ["agua", "clima", "territorio", "vegetacion", "riesgos"],
      }),
  });

  const handleAnalyze = () => {
    if (polygon.length >= 3) {
      mutation.mutate(polygon);
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    setPolygon([]);
    mutation.reset();
  };

  const [activeLayers, setActiveLayers] = useState<string[]>([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Panel Izquierdo */}
      <div className="w-80 bg-card border-r border-border p-4 flex flex-col overflow-y-auto">
        <h2 className="font-bold text-lg mb-4 text-primary">Herramientas</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDrawing(!isDrawing)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${isDrawing ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}`}
            >
              {isDrawing ? "Dibujando..." : "Dibujar Polígono"}
            </button>
            <button 
              onClick={handleClear}
              className="py-2 px-4 rounded-md text-sm font-medium bg-muted hover:bg-destructive hover:text-destructive-foreground transition"
            >
              Limpiar
            </button>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={polygon.length < 3 || mutation.isPending}
            className="w-full bg-secondary text-secondary-foreground py-2 rounded-md font-medium hover:bg-secondary/90 transition disabled:opacity-50"
          >
            {mutation.isPending ? "Analizando..." : "Analizar Territorio"}
          </button>
        </div>

        <LayerSelector selected={activeLayers} onChange={setActiveLayers} />
      </div>

      {/* Mapa Central */}
      <div className="flex-1 bg-muted relative p-4">
        <MapContainer 
          polygon={polygon} 
          onPolygonChange={setPolygon}
          drawEnabled={isDrawing}
          area={mutation.data?.area}
          className="h-full rounded-xl shadow-sm border-border"
        />
      </div>

      {/* Panel Derecho */}
      <div className="w-96 bg-card border-l border-border p-6 flex flex-col overflow-y-auto">
        <h2 className="font-bold text-lg mb-4 text-primary">Resultado del Análisis</h2>
        
        {mutation.isPending && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Analizando datos satelitales y climáticos...
          </div>
        )}

        {mutation.isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
            Ocurrió un error al analizar el territorio. Por favor, intenta de nuevo.
          </div>
        )}

        {!mutation.isPending && !mutation.isError && !mutation.data && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Dibuja un polígono en el mapa y presiona "Analizar Territorio" para ver los resultados.
          </div>
        )}

        {mutation.data && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 text-foreground">Resumen General</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mutation.data.resumen_general || "La zona seleccionada ha sido analizada con éxito."}
              </p>
              {mutation.data.area?.superficie_aprox_ha && (
                <div className="mt-3 text-xs font-medium text-primary">
                  Superficie: {mutation.data.area.superficie_aprox_ha.toFixed(2)} hectáreas
                </div>
              )}
            </div>

            {Object.entries(mutation.data.modulos).map(([key, modulo]) => (
              modulo && (
                <div key={key} className="border border-border rounded-lg p-4 bg-card shadow-sm">
                  <h4 className="font-semibold text-foreground mb-1 capitalize">{modulo.titulo}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{modulo.explicacion}</p>
                  
                  {modulo.datos && Object.keys(modulo.datos).length > 0 && (
                    <div className="bg-muted p-3 rounded-md text-xs font-mono mb-3">
                      {JSON.stringify(modulo.datos, null, 2)}
                    </div>
                  )}
                  
                  {modulo.avanzado_restringido && (
                    <div className="text-xs text-secondary-foreground bg-secondary/20 p-2 rounded flex items-center justify-center">
                      ⭐ Modo avanzado requiere suscripción
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
