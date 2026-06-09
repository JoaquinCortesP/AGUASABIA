import { demoAdmin } from "@/app/store/auth-store";
import { apiClient, type ApiClientError } from "@/lib/axios/client";
import type {
  LoginCredentials,
  LoginResult,
  TokenResponse,
} from "@/features/auth/types/auth.types";
import type { AdminUser } from "@/types/domain";

const primaryTokenPath = "/auth/access-token";
const legacyTokenPath = "/login/access-token";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const token = await requestToken(primaryTokenPath, credentials).catch((error) => {
      if (isApiError(error) && error.status === 404) {
        return requestToken(legacyTokenPath, credentials);
      }

      throw error;
    });

    return {
      accessToken: token.access_token,
      user: demoAdmin,
    };
  },

  async me(): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>("/auth/me");
    return data;
  },
};

async function requestToken(path: string, credentials: LoginCredentials) {
  const formData = new URLSearchParams();
  formData.set("username", credentials.email);
  formData.set("password", credentials.password);

  const { data } = await apiClient.post<TokenResponse>(path, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return data;
}

function isApiError(error: unknown): error is ApiClientError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  );
}
