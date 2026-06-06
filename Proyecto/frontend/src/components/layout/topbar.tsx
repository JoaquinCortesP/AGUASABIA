import { useEffect, useMemo } from "react";
import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";
import { useUiStore } from "@/app/store/ui-store";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { comunas, regions } from "@/services/mock-data";

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const selectedRegionId = useUiStore((state) => state.selectedRegionId);
  const selectedComunaId = useUiStore((state) => state.selectedComunaId);
  const setTerritory = useUiStore((state) => state.setTerritory);

  const filteredComunas = useMemo(
    () => comunas.filter((comuna) => comuna.region_id === selectedRegionId),
    [selectedRegionId],
  );

  useEffect(() => {
    const comunaExists = filteredComunas.some(
      (comuna) => comuna.id === selectedComunaId,
    );

    if (!comunaExists && filteredComunas[0]) {
      setTerritory(selectedRegionId, filteredComunas[0].id);
    }
  }, [filteredComunas, selectedComunaId, selectedRegionId, setTerritory]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="md:hidden">
            <div className="text-sm font-semibold text-foreground">AGUASABIA</div>
            <div className="text-xs text-muted-foreground">Panel municipal</div>
          </div>
          <Breadcrumbs />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground xl:flex">
            <Search className="h-4 w-4" />
            <span>Buscar productor, parcela o comuna</span>
          </div>
          <Select
            aria-label="Region"
            className="w-[190px]"
            value={selectedRegionId}
            onChange={(event) => {
              const nextRegionId = Number(event.target.value);
              const nextComunaId =
                comunas.find((comuna) => comuna.region_id === nextRegionId)?.id ?? 1;
              setTerritory(nextRegionId, nextComunaId);
            }}
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nombre}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Comuna"
            className="w-[150px]"
            value={selectedComunaId}
            onChange={(event) =>
              setTerritory(selectedRegionId, Number(event.target.value))
            }
          >
            {filteredComunas.map((comuna) => (
              <option key={comuna.id} value={comuna.id}>
                {comuna.nombre}
              </option>
            ))}
          </Select>
          <Button aria-label="Cambiar tema" size="icon" variant="outline" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button aria-label="Notificaciones" size="icon" variant="outline">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground">
              AM
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {user?.nombre ?? "Admin municipal"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.municipio?.nombre ?? "Municipio"}
              </div>
            </div>
          </div>
          <Button aria-label="Cerrar sesion" size="icon" variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
