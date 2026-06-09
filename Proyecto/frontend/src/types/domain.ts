export type RiskLevel = "bajo" | "medio" | "alto" | "critico";

export type DeliveryStatus = "enviado" | "entregado" | "leido" | "fallido";

export interface Coordinates {
  latitud: number;
  longitud: number;
}

export interface Region {
  id: number;
  nombre: string;
}

export interface Comuna {
  id: number;
  region_id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  region: Region;
  comuna: Comuna;
  codigo: string;
}

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  rol: "admin_municipal" | "publico";
  municipio?: Municipio;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "steady";
  tone: "blue" | "cyan" | "green" | "amber" | "red" | "slate";
}

export interface TimeSeriesPoint {
  fecha: string;
  et0: number;
  precipitacion: number;
  consumo: number;
  recomendado: number;
}

export interface ProducerSummary {
  id: number;
  nombre: string;
  telefono: string;
  comuna: string;
  cultivo: string;
  hectareas: number;
  estadoHidrico: RiskLevel;
  eficiencia: number;
  parcelas: number;
  ultimaLectura: string;
}

export interface ParcelSummary {
  id: number;
  nombre: string;
  agricultorId: number;
  productor: string;
  cultivo: string;
  hectareas: number;
  riesgo: RiskLevel;
  comuna: string;
  poligono_vertices: Coordinates[];
}

export interface AlertRecord {
  id: number;
  titulo: string;
  descripcion: string;
  severidad: RiskLevel;
  comuna: string;
  fecha: string;
  estado: "activa" | "observacion" | "resuelta";
}

export interface MessageRecord {
  id: number;
  productor: string;
  asunto: string;
  canal: "WhatsApp" | "SMS" | "Email";
  estado: DeliveryStatus;
  fecha: string;
}

export interface PublicIndicator {
  label: string;
  value: string;
  helper: string;
}
