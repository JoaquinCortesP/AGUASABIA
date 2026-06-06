import type { Coordinates, ParcelSummary } from "@/types/domain";

export interface ParcelaCreatePayload {
  nombre: string;
  agricultor_id: number;
  comuna_id: number;
  poligono_vertices: Coordinates[];
}

export type ParcelaRecord = ParcelSummary;
