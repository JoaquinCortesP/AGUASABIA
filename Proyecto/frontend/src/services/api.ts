import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl && !envUrl.includes("192.168.") && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.")) {
    // Si es una URL de producción (ej: render/railway), usarla
    return envUrl;
  }
  
  // Si estamos en desarrollo (Vite) o en Expo Go (React Native Webview),
  // detectar la IP dinámicamente desde el navegador/webview.
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  
  return envUrl || "http://localhost:8000";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      // Solo desloguear si había un token y el endpoint requería autenticación
      // (no borrar por endpoints públicos que devuelven 401 por falta de plan)
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/login") || url.includes("/register");
      if (token && !isAuthEndpoint) {
        // Verificar que el 401 sea por token inválido, no por permisos de plan
        const detail = error.response?.data?.detail || "";
        const isPlanRestriction = detail.includes("plan") || detail.includes("modo avanzado") || detail.includes("Mejora");
        if (!isPlanRestriction) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("auth:unauthorized"));
        }
      }
    }
    return Promise.reject(error);
  }
);

