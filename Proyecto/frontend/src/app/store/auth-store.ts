import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/types/domain";

interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  setCredentials: (accessToken: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

export const demoAdmin: AdminUser = {
  id: 1,
  nombre: "Administracion Municipal",
  email: "admin@aguasabia.cl",
  rol: "admin_municipal",
  municipio: {
    id: 1,
    nombre: "Municipalidad de Paine",
    codigo: "MUN-PAI-001",
    region: { id: 1, nombre: "Metropolitana de Santiago" },
    comuna: { id: 1, region_id: 1, nombre: "Paine" },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setCredentials: (accessToken, user) => set({ accessToken, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "aguasabia-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

export function useIsAuthenticated() {
  return useAuthStore((state) => Boolean(state.accessToken && state.user));
}
