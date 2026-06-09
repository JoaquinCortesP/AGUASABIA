import type { AdminUser } from "@/types/domain";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface LoginResult {
  accessToken: string;
  user: AdminUser;
}
