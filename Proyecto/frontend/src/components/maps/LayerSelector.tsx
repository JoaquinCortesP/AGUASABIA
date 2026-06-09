import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { environmentalLayers } from "@/components/maps/layers";
import { cn } from "@/lib/utils/cn";

interface LayerSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function LayerSelector({ selected, onChange }: LayerSelectorProps) {
  function toggle(layerId: string) {
    if (selected.includes(layerId)) {
      onChange(selected.filter((item) => item !== layerId));
      return;
    }
    onChange([...selected, layerId]);
  }

  return (
    <div className="space-y-2">
      {environmentalLayers.map((layer) => {
        const isSelected = selected.includes(layer.id);

        return (
          <button
            key={layer.id}
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
              isSelected && "border-primary/40 bg-secondary text-secondary-foreground",
            )}
            onClick={() => toggle(layer.id)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{layer.label}</span>
            </span>
            <Badge variant={layer.status === "preparada" ? "green" : "outline"}>
              {layer.status}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
