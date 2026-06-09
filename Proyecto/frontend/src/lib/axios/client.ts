import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/app/store/auth-store";

export interface ApiClientError {
  status: number;
  message: string;
  details?: unknown;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 500;

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    const normalized: ApiClientError = {
      status,
      message:
        getErrorMessage(error.response?.data) ??
        error.message ??
        "Error inesperado de comunicacion con la API.",
      details: error.response?.data,
    };

    return Promise.reject(normalized);
  },
);

function getErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }

  return null;
}
