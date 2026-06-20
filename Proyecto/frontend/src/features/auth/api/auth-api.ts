import { api } from "@/services/api";
import type { LoginPayload, RegisterPayload, TokenResponse, UserProfile } from "@/types/territory";

export const authApi = {
  login: async (data: LoginPayload): Promise<TokenResponse> => {
    try {
      // Intenta primero iniciar sesión como usuario regular (JSON POST)
      const response = await api.post<TokenResponse>("/api/v1/usuarios/login", {
        email: data.email,
        password: data.password
      });
      return response.data;
    } catch (error: any) {
      // Si falla, intentamos ingresar como Administrador usando OAuth2 Form Data
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);
      
      const response = await api.post<TokenResponse>("/api/v1/login/access-token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      return response.data;
    }
  },

  register: async (data: RegisterPayload): Promise<UserProfile> => {
    const response = await api.post<UserProfile>("/api/v1/usuarios/register", {
      email: data.email,
      password: data.password,
      nombre: data.nombre,
    });
    return response.data;
  },

  verifyEmail: async (email: string): Promise<{ msg: string }> => {
    const response = await api.post<{ msg: string }>(`/api/v1/usuarios/verify-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>("/api/v1/usuarios/me");
    return response.data;
  },

  getAdminProfile: async (): Promise<any> => {
    const response = await api.get<any>("/api/v1/admin/me");
    return response.data;
  },
};

