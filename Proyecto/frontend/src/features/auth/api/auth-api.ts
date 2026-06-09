import { api } from "@/services/api";
import type { LoginPayload, RegisterPayload, TokenResponse, UserProfile } from "@/types/territory";

export const authApi = {
  login: async (data: LoginPayload): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>("/api/v1/usuarios/login", {
      email: data.email,
      password: data.password
    });
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<UserProfile> => {
    const response = await api.post<UserProfile>("/api/v1/usuarios/register", {
      email: data.email,
      password: data.password,
      nombre: data.nombre,
    });
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/api/v1/usuarios/me");
    return response.data;
  },
};
