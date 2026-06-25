import { Layers } from "lucide-react";
import { environmentalLayers } from "@/components/maps/layers";
import { cn } from "@/lib/utils/cn";

interface LayerSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  wildfireYear?: string;
  onWildfireYearChange?: (year: string) => void;
  layerItems?: Record<string, { name: string; lat: number; lng: number }[]>;
  onItemSelect?: (item: { name: string; lat: number; lng: number }) => void;
}

export function LayerSelector({ 
  selected, 
  onChange,
  wildfireYear = "2026",
  onWildfireYearChange,
  layerItems = {},
  onItemSelect,
}: LayerSelectorProps) {
  
  function toggle(layerId: string) {
    if (selected.includes(layerId)) {
      onChange(selected.filter((item) => item !== layerId));
      return;
    }
    onChange([...selected, layerId]);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {environmentalLayers.map((layer) => {
        const isSelected = selected.includes(layer.id);
        const hasItems = layerItems[layer.id] && layerItems[layer.id].length > 0;

        return (
          <div 
            key={layer.id} 
            className={cn(
              "relative group flex flex-col gap-1.5 p-1.5 rounded-lg border border-border/50 bg-background/40 transition-all",
              isSelected && "border-primary/40 bg-primary/5 shadow-sm"
            )}
          >
            <button
              type="button"
              className={cn(
                "w-full flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-2 py-1.5 text-left text-xs transition-all hover:bg-muted/80 justify-center text-center",
                isSelected && "border-primary/80 bg-secondary/80 text-secondary-foreground font-semibold shadow-sm",
              )}
              onClick={() => toggle(layer.id)}
            >
              <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{layer.label}</span>
            </button>
            
            {/* Si está seleccionado y es Incendios, mostrar selector de años */}
            {isSelected && layer.id === "incendios" && onWildfireYearChange && (
              <select
                value={wildfireYear}
                onChange={(e) => onWildfireYearChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-background border border-border/70 rounded px-1.5 py-0.5 text-[9px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-medium cursor-pointer"
              >
                <option value="2026">2026 (Actual)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            )}

            {/* Si está seleccionado y tiene elementos DGA/Geográficos, mostrar desplegable de fly-to */}
            {isSelected && layer.id !== "incendios" && hasItems && onItemSelect && (
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx) && layerItems[layer.id]?.[idx]) {
                    onItemSelect(layerItems[layer.id][idx]);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-background border border-border/70 rounded px-1.5 py-0.5 text-[9px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-medium cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>-- Centrar en --</option>
                {layerItems[layer.id].map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* Tooltip flotante superior */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block z-[9999] w-48 p-2 bg-slate-950 text-slate-200 text-[10px] rounded-lg shadow-xl border border-border/80 pointer-events-none leading-normal">
              <span className="font-bold text-primary block mb-0.5">{layer.label}</span>
              <span>{layer.description}</span>
              {/* Flecha del Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
