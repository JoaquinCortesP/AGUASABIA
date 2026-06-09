import { api } from "@/services/api";
import type { LoginPayload, RegisterPayload, TokenResponse, UserProfile } from "@/types/territory";

export const authApi = {
  login: async (data: LoginPayload): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", data.email);
    formData.append("password", data.password);
    
    // FastAPI OAuth2PasswordRequestForm expects form data
    const response = await api.post<TokenResponse>("/api/v1/usuarios/login/access-token", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<UserProfile> => {
    const response = await api.post<UserProfile>("/api/v1/usuarios/registro", {
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
