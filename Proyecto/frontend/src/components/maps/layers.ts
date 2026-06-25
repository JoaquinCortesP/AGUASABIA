import type { ModuleName } from "@/types/territory";

export interface MapLayerDefinition {
  id: ModuleName | "rios" | "embalses" | "cuencas" | "ndvi" | "sequia" | "incendios" | "humedales" | "acuiferos";
  label: string;
  category: "agua" | "territorio" | "vegetacion" | "riesgos";
  status: "preparada" | "pendiente";
  description: string;
}

export const environmentalLayers: MapLayerDefinition[] = [
  { 
    id: "rios", 
    label: "Ríos", 
    category: "agua", 
    status: "preparada", 
    description: "Red fluviométrica nacional y cursos de agua monitoreados por la DGA." 
  },
  { 
    id: "embalses", 
    label: "Lagos y Niveles DGA", 
    category: "agua", 
    status: "preparada", 
    description: "Estaciones de control de lagos, embalses y sus respectivos niveles de volumen." 
  },
  { 
    id: "acuiferos", 
    label: "Acuíferos", 
    category: "agua", 
    status: "preparada", 
    description: "Límites geográficos de acuíferos protegidos y reservas de aguas subterráneas de la DGA." 
  },
  { 
    id: "cuencas", 
    label: "Cuencas", 
    category: "territorio", 
    status: "preparada", 
    description: "División territorial de cuencas hidrográficas oficiales de Chile." 
  },

  { 
    id: "sequia", 
    label: "Sequía", 
    category: "riesgos", 
    status: "preparada", 
    description: "Zonas bajo decretos de escasez hídrica y déficit hídrico extremo." 
  },
  { 
    id: "incendios", 
    label: "Incendios", 
    category: "riesgos", 
    status: "preparada", 
    description: "Registro de focos activos e históricos de incendios forestales de CONAF." 
  },
  { 
    id: "humedales", 
    label: "Humedales", 
    category: "territorio", 
    status: "preparada", 
    description: "Humedales urbanos y ecosistemas acuáticos protegidos por el Ministerio del Medio Ambiente." 
  },
];
