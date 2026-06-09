import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface UiState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  selectedRegionId: number;
  selectedComunaId: number;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setTerritory: (regionId: number, comunaId: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      selectedRegionId: 1,
      selectedComunaId: 1,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTerritory: (regionId, comunaId) =>
        set({ selectedRegionId: regionId, selectedComunaId: comunaId }),
    }),
    {
      name: "aguasabia-ui",
    },
  ),
);
