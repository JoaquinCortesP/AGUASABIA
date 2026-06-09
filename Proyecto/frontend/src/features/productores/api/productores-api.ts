import { apiClient } from "@/lib/axios/client";
import { productores } from "@/services/mock-data";
import type {
  ProducerCreatePayload,
  ProducerRecord,
} from "@/features/productores/types/productor.types";

interface BackendAgricultor {
  id: number;
  nombre: string;
  email?: string;
  is_active?: boolean;
}

export const productoresApi = {
  async list(): Promise<ProducerRecord[]> {
    try {
      const { data } = await apiClient.get<BackendAgricultor[]>("/agricultores");
      return data.map(mapAgricultorToProducer);
    } catch {
      return productores;
    }
  },

  async create(payload: ProducerCreatePayload): Promise<ProducerRecord> {
    try {
      const { data } = await apiClient.post<BackendAgricultor>("/agricultores", {
        nombre: payload.nombre,
        telefono: payload.telefono,
        comuna: payload.comuna,
        cultivo: payload.cultivo,
        hectareas: payload.hectareas,
        poligono_vertices: payload.poligono_vertices,
      });

      return {
        ...mapAgricultorToProducer(data),
        telefono: payload.telefono,
        comuna: payload.comuna,
        cultivo: payload.cultivo,
        hectareas: payload.hectareas,
      };
    } catch {
      return {
        id: Date.now(),
        nombre: payload.nombre,
        telefono: payload.telefono,
        comuna: payload.comuna,
        cultivo: payload.cultivo,
        hectareas: payload.hectareas,
        estadoHidrico: "medio",
        eficiencia: 76,
        parcelas: payload.poligono_vertices.length >= 3 ? 1 : 0,
        ultimaLectura: "Recien registrado",
      };
    }
  },
};

function mapAgricultorToProducer(agricultor: BackendAgricultor): ProducerRecord {
  return {
    id: agricultor.id,
    nombre: agricultor.nombre,
    telefono: "Sin telefono",
    comuna: "Municipal",
    cultivo: "No informado",
    hectareas: 0,
    estadoHidrico: agricultor.is_active === false ? "alto" : "medio",
    eficiencia: agricultor.is_active === false ? 48 : 72,
    parcelas: 0,
    ultimaLectura: "API backend",
  };
}
