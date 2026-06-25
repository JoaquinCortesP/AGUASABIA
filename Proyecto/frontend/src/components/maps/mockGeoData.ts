export interface MockEnvironmentalFeature {
  name: string;
  region: string;
  lat: number;
  lng: number;
  details: string;
  value?: string;
  radius?: number; // for circular representations
}

// Wildfires in Chile registered by CONAF (Incendios)
export const wildfiresData: MockEnvironmentalFeature[] = [
  // 2022
  {
    name: "Incendio Quillón",
    region: "Biobío",
    lat: -36.74,
    lng: -72.48,
    details: "Superficie afectada: 2.100 hectáreas. Controlado. Alta propagación en condiciones 30-30-30.",
    value: "Enero 2022"
  },
  {
    name: "Incendio Carahue",
    region: "Araucanía",
    lat: -38.71,
    lng: -73.16,
    details: "Superficie afectada: 800 hectáreas. Extinguido. Afectó matorrales y bosque nativo.",
    value: "Marzo 2022"
  },
  // 2023
  {
    name: "Incendio Santa Ana - Nacimiento",
    region: "Biobío",
    lat: -37.50,
    lng: -72.68,
    details: "Gran Incendio Forestal de la zona centro-sur. Afectó más de 74.000 hectáreas con severidad extrema.",
    value: "Febrero 2023"
  },
  {
    name: "Incendio Purén",
    region: "Araucanía",
    lat: -38.02,
    lng: -72.88,
    details: "Superficie afectada: 6.200 hectáreas. Extinguido. Foco destructivo en interfaz urbano-rural.",
    value: "Febrero 2023"
  },
  // 2024
  {
    name: "Incendio Reserva Lago Peñuelas",
    region: "Valparaíso",
    lat: -33.15,
    lng: -71.48,
    details: "Superficie afectada: 8.500 hectáreas. Controlado. Causa probable: Antrópica bajo investigación.",
    value: "Enero-Febrero 2024"
  },
  {
    name: "Incendio Fundo El Venado",
    region: "Biobío",
    lat: -36.85,
    lng: -73.08,
    details: "Superficie afectada: 1.200 hectáreas. Extinguido. Afectó principalmente plantaciones forestales y pastizales.",
    value: "Diciembre 2024"
  },
  {
    name: "Incendio Queri - Maule",
    region: "Maule",
    lat: -35.60,
    lng: -71.55,
    details: "Superficie afectada: 2.300 hectáreas. Controlado. Registró alta tasa de propagación por viento puelche seco.",
    value: "Febrero 2024"
  },
  {
    name: "Incendio Galvarino - Cholchol",
    region: "Araucanía",
    lat: -38.41,
    lng: -72.78,
    details: "Superficie afectada: 3.100 hectáreas. Extinguido. Alta afectación de bosque nativo y matorrales.",
    value: "Enero 2024"
  },
  {
    name: "Incendio Quebrada Escobares",
    region: "Valparaíso (Villa Alemana)",
    lat: -33.02,
    lng: -71.32,
    details: "Superficie afectada: 850 hectáreas. Extinguido. Alta vulnerabilidad por interfaz urbano-forestal.",
    value: "Noviembre 2024"
  },
  // 2025
  {
    name: "Incendio Melipilla - El Bollenar",
    region: "Metropolitana",
    lat: -33.61,
    lng: -71.21,
    details: "Superficie afectada: 1.500 hectáreas. Controlado. Afectó quebradas con vegetación xerófita.",
    value: "Enero 2025"
  },
  {
    name: "Incendio Viña del Mar - Sausalito",
    region: "Valparaíso",
    lat: -33.01,
    lng: -71.53,
    details: "Superficie afectada: 400 hectáreas. Extinguido. Foco rápido originado en pastizales de interfaz.",
    value: "Marzo 2025"
  },
  // 2026
  {
    name: "Incendio San José de Maipo - El Canelo",
    region: "Metropolitana",
    lat: -33.58,
    lng: -70.45,
    details: "Incendio activo en precordillera. Superficie estimada: 120 hectáreas. Control aéreo en progreso.",
    value: "Enero 2026"
  },
  {
    name: "Incendio Casablanca - Lo Orozco",
    region: "Valparaíso",
    lat: -33.22,
    lng: -71.35,
    details: "Foco activo. Control en progreso. Alta densidad de humo visible desde la ruta 68.",
    value: "Febrero 2026"
  }
];

// Drought rings representing zones of high impact (Sequía)
export const droughtZonesData: MockEnvironmentalFeature[] = [
  {
    name: "Emergencia Hídrica Petorca",
    region: "Valparaíso",
    lat: -32.25,
    lng: -71.01,
    radius: 12000,
    details: "Déficit de precipitaciones acumulado: 75%. Acuíferos subterráneos en restricción severa y escasez hídrica declarada."
  },
  {
    name: "Agotamiento Cuenca Copiapó",
    region: "Atacama",
    lat: -27.36,
    lng: -70.33,
    radius: 18000,
    details: "Déficit freático acumulado. Zona desértica con demanda agrícola y minera que supera la recarga natural."
  },
  {
    name: "Déficit Hídrico Limarí",
    region: "Coquimbo",
    lat: -30.60,
    lng: -71.20,
    radius: 16000,
    details: "Embalses locales (La Paloma, Cogotí) a menos del 15% de su capacidad. Sequía agrícola extrema activa."
  },
  {
    name: "Estrés Hídrico Central - Santiago",
    region: "Metropolitana",
    lat: -33.45,
    lng: -70.66,
    radius: 20000,
    details: "Megasequía acumulada por 14 años. Baja acumulación nival en cordillera y restricciones en el río Maipo."
  },
  {
    name: "Déficit Hídrico Valle del Huasco",
    region: "Atacama",
    lat: -28.57,
    lng: -70.75,
    radius: 15000,
    details: "Embalse Santa Juana con niveles mínimos históricos. Sequía prolongada afecta la cuenca del río Huasco."
  },
  {
    name: "Escasez Hídrica San Felipe",
    region: "Valparaíso",
    lat: -32.75,
    lng: -70.72,
    radius: 14000,
    details: "Sección superior del río Aconcagua con caudales mínimos históricos. Priorización de consumo humano activa."
  },
  {
    name: "Sequía Agrícola Colchagua",
    region: "O'Higgins",
    lat: -34.58,
    lng: -71.20,
    radius: 17000,
    details: "Decreto de escasez hídrica del Ministerio de Obras Públicas. Embalse Convento Viejo en niveles críticos."
  },
  {
    name: "Estrés Hídrico Secano Costero",
    region: "Maule",
    lat: -35.33,
    lng: -72.01,
    radius: 22000,
    details: "Pérdida de cultivos de secano y escasez extrema para bebida de ganado en comunas costeras."
  },
  {
    name: "Crisis Hídrica Choapa - Illapel",
    region: "Coquimbo",
    lat: -31.63,
    lng: -71.17,
    radius: 15000,
    details: "Déficit extremo de precipitaciones y nieve. Racionamiento de agua activo en sectores rurales."
  }
];

// Wetlands (Humedales)
export const wetlandsData: MockEnvironmentalFeature[] = [
  {
    name: "Santuario de la Naturaleza Humedal de Batuco",
    region: "Metropolitana (Lampa)",
    lat: -33.22,
    lng: -70.78,
    radius: 3500,
    details: "Área ecológica protegida. Hábitat clave para aves migratorias en Chile central. Vulnerable a sequías e interfaz urbana."
  },
  {
    name: "Humedal El Yali",
    region: "Valparaíso (Santo Domingo)",
    lat: -33.76,
    lng: -71.72,
    radius: 4500,
    details: "Reserva nacional Ramsar. Complejo de lagunas costeras con alto valor de biodiversidad en zona centro-sur."
  },
  {
    name: "Santuario Carlos Anwandter - Humedal Río Cruces",
    region: "Los Ríos (Valdivia)",
    lat: -39.75,
    lng: -73.25,
    radius: 7000,
    details: "Humedal de importancia internacional Ramsar. Famoso por albergar poblaciones de cisnes de cuello negro."
  }
];

// Major Water Basins (Cuencas)
export const basinsData: MockEnvironmentalFeature[] = [
  {
    name: "Cuenca del Río Maipo (Cod. DGA: 057)",
    region: "Metropolitana / Valparaíso",
    lat: -33.64,
    lng: -70.87,
    radius: 28000,
    details: "Cuenca exorreica de régimen mixto. Abastece a más del 70% de la población del país y soporta alta demanda de riego."
  },
  {
    name: "Cuenca del Río Copiapó (Cod. DGA: 034)",
    region: "Atacama",
    lat: -27.50,
    lng: -70.10,
    radius: 32000,
    details: "Cuenca de régimen nival y pluvial en tramo superior, altamente regulada e intervenida. Restricción absoluta para nuevos derechos."
  },
  {
    name: "Cuenca del Río Biobío (Cod. DGA: 083)",
    region: "Biobío / Araucanía",
    lat: -37.58,
    lng: -72.35,
    radius: 38000,
    details: "Una de las cuencas más caudalosas de Chile. Posee un fuerte aprovechamiento hidroeléctrico, forestal e industrial."
  }
];
