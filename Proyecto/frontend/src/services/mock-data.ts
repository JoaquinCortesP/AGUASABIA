import type {
  AlertRecord,
  Comuna,
  KpiMetric,
  MessageRecord,
  ParcelSummary,
  ProducerSummary,
  PublicIndicator,
  Region,
  TimeSeriesPoint,
} from "@/types/domain";

export const regions: Region[] = [
  { id: 1, nombre: "Metropolitana de Santiago" },
  { id: 2, nombre: "Valparaiso" },
  { id: 3, nombre: "O'Higgins" },
];

export const comunas: Comuna[] = [
  { id: 1, region_id: 1, nombre: "Paine" },
  { id: 2, region_id: 1, nombre: "Buin" },
  { id: 3, region_id: 1, nombre: "Melipilla" },
  { id: 4, region_id: 2, nombre: "Quillota" },
  { id: 5, region_id: 3, nombre: "Rengo" },
];

export const dashboardKpis: KpiMetric[] = [
  {
    id: "et0",
    label: "ET0 promedio",
    value: "4,8 mm",
    delta: "+0,6 vs 7 dias",
    trend: "up",
    tone: "cyan",
  },
  {
    id: "precipitacion",
    label: "Precipitacion",
    value: "12,4 mm",
    delta: "-18% mensual",
    trend: "down",
    tone: "blue",
  },
  {
    id: "hectareas",
    label: "Hectareas monitoreadas",
    value: "1.284 ha",
    delta: "+86 ha activas",
    trend: "up",
    tone: "green",
  },
  {
    id: "productores",
    label: "Productores activos",
    value: "418",
    delta: "92% con parcela",
    trend: "steady",
    tone: "slate",
  },
  {
    id: "riesgo",
    label: "Riesgo hidrico",
    value: "Medio",
    delta: "3 sectores criticos",
    trend: "up",
    tone: "amber",
  },
  {
    id: "eficiencia",
    label: "Eficiencia hidrica",
    value: "78%",
    delta: "+4,1 pp",
    trend: "up",
    tone: "green",
  },
];

export const et0Series: TimeSeriesPoint[] = [
  { fecha: "Lun", et0: 4.1, precipitacion: 1.2, consumo: 38, recomendado: 34 },
  { fecha: "Mar", et0: 4.5, precipitacion: 0.3, consumo: 42, recomendado: 39 },
  { fecha: "Mie", et0: 4.9, precipitacion: 0, consumo: 47, recomendado: 45 },
  { fecha: "Jue", et0: 5.3, precipitacion: 0, consumo: 51, recomendado: 48 },
  { fecha: "Vie", et0: 5.1, precipitacion: 2.1, consumo: 46, recomendado: 41 },
  { fecha: "Sab", et0: 4.7, precipitacion: 4.6, consumo: 39, recomendado: 35 },
  { fecha: "Dom", et0: 4.3, precipitacion: 4.2, consumo: 35, recomendado: 31 },
];

export const productores: ProducerSummary[] = [
  {
    id: 1,
    nombre: "Maria Contreras",
    telefono: "+56 9 8421 3310",
    comuna: "Paine",
    cultivo: "Nogal",
    hectareas: 12.5,
    estadoHidrico: "medio",
    eficiencia: 82,
    parcelas: 3,
    ultimaLectura: "Hace 18 min",
  },
  {
    id: 2,
    nombre: "Cooperativa El Carmen",
    telefono: "+56 9 6152 8871",
    comuna: "Buin",
    cultivo: "Hortalizas",
    hectareas: 8.2,
    estadoHidrico: "alto",
    eficiencia: 69,
    parcelas: 2,
    ultimaLectura: "Hace 42 min",
  },
  {
    id: 3,
    nombre: "Agricola Santa Elisa",
    telefono: "+56 9 7530 1290",
    comuna: "Melipilla",
    cultivo: "Vid",
    hectareas: 28.4,
    estadoHidrico: "bajo",
    eficiencia: 88,
    parcelas: 5,
    ultimaLectura: "Hace 1 h",
  },
  {
    id: 4,
    nombre: "Juan Fuentes",
    telefono: "+56 9 9911 3044",
    comuna: "Paine",
    cultivo: "Cerezo",
    hectareas: 6.7,
    estadoHidrico: "critico",
    eficiencia: 57,
    parcelas: 1,
    ultimaLectura: "Hace 2 h",
  },
];

export const parcelas: ParcelSummary[] = [
  {
    id: 1,
    nombre: "Parcela Norte",
    agricultorId: 1,
    productor: "Maria Contreras",
    cultivo: "Nogal",
    hectareas: 4.2,
    riesgo: "medio",
    comuna: "Paine",
    poligono_vertices: [
      { latitud: -33.811, longitud: -70.744 },
      { latitud: -33.808, longitud: -70.731 },
      { latitud: -33.817, longitud: -70.726 },
      { latitud: -33.824, longitud: -70.739 },
    ],
  },
  {
    id: 2,
    nombre: "Sector Canal Oriente",
    agricultorId: 2,
    productor: "Cooperativa El Carmen",
    cultivo: "Hortalizas",
    hectareas: 8.2,
    riesgo: "alto",
    comuna: "Buin",
    poligono_vertices: [
      { latitud: -33.735, longitud: -70.719 },
      { latitud: -33.729, longitud: -70.706 },
      { latitud: -33.741, longitud: -70.699 },
      { latitud: -33.748, longitud: -70.713 },
    ],
  },
  {
    id: 3,
    nombre: "Lote Vina Sur",
    agricultorId: 3,
    productor: "Agricola Santa Elisa",
    cultivo: "Vid",
    hectareas: 15.6,
    riesgo: "bajo",
    comuna: "Melipilla",
    poligono_vertices: [
      { latitud: -33.684, longitud: -71.209 },
      { latitud: -33.675, longitud: -71.19 },
      { latitud: -33.692, longitud: -71.178 },
      { latitud: -33.704, longitud: -71.198 },
    ],
  },
  {
    id: 4,
    nombre: "Cerezo Alto",
    agricultorId: 4,
    productor: "Juan Fuentes",
    cultivo: "Cerezo",
    hectareas: 6.7,
    riesgo: "critico",
    comuna: "Paine",
    poligono_vertices: [
      { latitud: -33.79, longitud: -70.681 },
      { latitud: -33.784, longitud: -70.669 },
      { latitud: -33.794, longitud: -70.66 },
      { latitud: -33.804, longitud: -70.674 },
    ],
  },
];

export const alertas: AlertRecord[] = [
  {
    id: 1,
    titulo: "ET0 elevada en Paine Oriente",
    descripcion: "Proyeccion supera umbral municipal para cultivos frutales.",
    severidad: "alto",
    comuna: "Paine",
    fecha: "Hoy 08:40",
    estado: "activa",
  },
  {
    id: 2,
    titulo: "Deficit de precipitacion acumulada",
    descripcion: "Sector norponiente registra 21 dias bajo linea base.",
    severidad: "medio",
    comuna: "Buin",
    fecha: "Ayer 17:12",
    estado: "observacion",
  },
  {
    id: 3,
    titulo: "Estres hidrico critico",
    descripcion: "Parcela Cerezo Alto requiere recomendacion operacional.",
    severidad: "critico",
    comuna: "Paine",
    fecha: "Hoy 10:15",
    estado: "activa",
  },
];

export const mensajes: MessageRecord[] = [
  {
    id: 1,
    productor: "Maria Contreras",
    asunto: "Recomendacion de riego semanal",
    canal: "WhatsApp",
    estado: "entregado",
    fecha: "Hoy 09:05",
  },
  {
    id: 2,
    productor: "Cooperativa El Carmen",
    asunto: "Alerta por ET0 elevada",
    canal: "WhatsApp",
    estado: "leido",
    fecha: "Hoy 08:50",
  },
  {
    id: 3,
    productor: "Juan Fuentes",
    asunto: "Seguimiento estres hidrico",
    canal: "SMS",
    estado: "enviado",
    fecha: "Ayer 18:34",
  },
];

export const publicIndicators: PublicIndicator[] = [
  { label: "ET0 comunal", value: "4,8 mm", helper: "Promedio ultimas 24 h" },
  { label: "Riesgo ambiental", value: "Medio", helper: "Con 3 sectores en observacion" },
  { label: "Ahorro estimado", value: "16%", helper: "Respecto a riego calendario" },
];
