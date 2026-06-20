import type { ModuleName } from "@/types/territory";

export interface MapLayerDefinition {
  id: ModuleName | "rios" | "embalses" | "cuencas" | "ndvi" | "sequia" | "incendios" | "humedales";
  label: string;
  category: "agua" | "territorio" | "vegetacion" | "riesgos";
  status: "preparada" | "pendiente";
}

export const environmentalLayers: MapLayerDefinition[] = [
  { id: "rios", label: "Rios", category: "agua", status: "preparada" },
  { id: "embalses", label: "Embalses", category: "agua", status: "preparada" },
  { id: "cuencas", label: "Cuencas", category: "territorio", status: "pendiente" },
  { id: "ndvi", label: "NDVI", category: "vegetacion", status: "pendiente" },
  { id: "sequia", label: "Sequia", category: "riesgos", status: "pendiente" },
  { id: "incendios", label: "Incendios", category: "riesgos", status: "pendiente" },
  { id: "humedales", label: "Humedales", category: "territorio", status: "pendiente" },
];
