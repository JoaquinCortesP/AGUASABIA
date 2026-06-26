export type Role = "visitante" | "usuario" | "premium" | "admin";
export type Plan = "gratis" | "premium" | "profesional" | "institucional";
export type AnalysisMode = "resumen" | "avanzado";
export type ModuleName = "agua" | "clima" | "territorio" | "vegetacion" | "riesgos" | "suelo";
export type ModuleStatus =
  | "normal"
  | "moderado"
  | "alto"
  | "informativo"
  | "pendiente"
  | "no_disponible";

export interface Coordinates {
  latitud: number;
  longitud: number;
}

export interface BBox {
  min_latitud: number;
  min_longitud: number;
  max_latitud: number;
  max_longitud: number;
}

export interface AnalyzedArea {
  centroide: Coordinates;
  bbox: BBox;
  superficie_aprox_ha?: number | null;
  poligono?: Coordinates[] | null;
}

export interface DataSource {
  nombre: string;
  tipo: string;
  descripcion?: string | null;
  url?: string | null;
}

export interface AnalysisModule {
  estado: ModuleStatus;
  titulo: string;
  explicacion: string;
  datos: Record<string, unknown>;
  fuentes: DataSource[];
  avanzado: Record<string, unknown>;
  avanzado_restringido: boolean;
}

export interface TerritoryAnalysisRequest {
  poligono: Coordinates[];
  modo: AnalysisMode;
  guardar: boolean;
  nombre?: string;
  cliente_anonimo_id?: string;
  fecha_historica?: string;
  modulos: ModuleName[];
}

export interface TerritoryAnalysisResponse {
  consulta_id: number | null;
  guardada: boolean;
  modo: AnalysisMode;
  modo_avanzado_disponible: boolean;
  modo_avanzado_habilitado: boolean;
  requiere_plan_pago: boolean;
  limite_diario_visitante?: number | null;
  consultas_restantes_visitante?: number | null;
  area: AnalyzedArea;
  resumen_general: string;
  modulos: Partial<Record<ModuleName, AnalysisModule>>;
  edificado?: boolean | null;
  edificado_mensaje?: string | null;
}

export interface HistoryItem {
  id: number;
  nombre?: string | null;
  modo: AnalysisMode;
  guardada: boolean;
  resumen_general?: string | null;
  centroide_latitud: number;
  centroide_longitud: number;
  superficie_aprox_ha?: number | null;
  created_at: string;
}

export interface Region {
  id: number;
  nombre: string;
}

export interface Comuna {
  id: number;
  region_id: number;
  nombre: string;
  situacion?: string | null;
}

export interface UserProfile {
  id: number;
  nombre?: string | null;
  email: string;
  plan: Plan | string;
  is_active: boolean;
  created_at: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  nombre?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface AdminMetrics {
  usuarios_registrados: number;
  consultas_realizadas: number;
  consultas_hoy: number;
  consultas_mes: number;
}
