import { apiClient } from "@/lib/axios/client";
import { parcelas } from "@/services/mock-data";
import type { Coordinates } from "@/types/domain";
import type { ParcelaRecord } from "@/features/parcelas/types/parcela.types";

interface BackendParcela {
  id: number;
  nombre: string;
  agricultor_id: number;
  comuna_id: number;
  latitud?: number | null;
  longitud?: number | null;
  superficie?: number | null;
  tipo_cultivo?: string | null;
}

export const parcelasApi = {
  async list(): Promise<ParcelaRecord[]> {
    try {
      const { data } = await apiClient.get<BackendParcela[]>("/parcelas");
      return data.map(mapBackendParcela);
    } catch {
      return parcelas;
    }
  },
};

function mapBackendParcela(parcela: BackendParcela): ParcelaRecord {
  const latitud = parcela.latitud ?? -33.4489;
  const longitud = parcela.longitud ?? -70.6693;
  const polygon = createFallbackPolygon({ latitud, longitud });

  return {
    id: parcela.id,
    nombre: parcela.nombre,
    agricultorId: parcela.agricultor_id,
    productor: `Agricultor ${parcela.agricultor_id}`,
    cultivo: parcela.tipo_cultivo ?? "No informado",
    hectareas: parcela.superficie ?? 0,
    riesgo: "medio",
    comuna: `Comuna ${parcela.comuna_id}`,
    poligono_vertices: polygon,
  };
}

function createFallbackPolygon(center: Coordinates): Coordinates[] {
  const delta = 0.004;

  return [
    { latitud: center.latitud - delta, longitud: center.longitud - delta },
    { latitud: center.latitud - delta, longitud: center.longitud + delta },
    { latitud: center.latitud + delta, longitud: center.longitud + delta },
    { latitud: center.latitud + delta, longitud: center.longitud - delta },
  ];
}
