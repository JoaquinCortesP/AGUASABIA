import { api } from "@/services/api";
import type { 
  TerritoryAnalysisRequest, 
  TerritoryAnalysisResponse, 
  HistoryItem 
} from "@/types/territory";

export const territorioApi = {
  analizar: async (data: TerritoryAnalysisRequest): Promise<TerritoryAnalysisResponse> => {
    const response = await api.post<TerritoryAnalysisResponse>("/api/v1/territorio/consultas/analizar", data);
    return response.data;
  },

  getHistorial: async (): Promise<HistoryItem[]> => {
    const response = await api.get<HistoryItem[]>("/api/v1/territorio/consultas");
    return response.data;
  },

  getConsulta: async (id: number): Promise<TerritoryAnalysisResponse> => {
    const response = await api.get<TerritoryAnalysisResponse>(`/api/v1/territorio/consultas/${id}`);
    return response.data;
  },

  eliminarConsulta: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/territorio/consultas/${id}`);
  },

  getEstaciones: async (limit: number = 5000): Promise<any> => {
    const response = await api.get<any>(`/api/v1/dga-ingest/ingest/estaciones?limit=${limit}`);
    return response.data;
  }
};
