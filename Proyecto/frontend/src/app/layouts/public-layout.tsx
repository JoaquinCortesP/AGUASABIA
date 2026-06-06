import { NavLink, Outlet } from "react-router-dom";
import { Droplets, Moon, Sun } from "lucide-react";
import { useUiStore } from "@/app/store/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const publicLinks = [
  { label: "Zona", href: "/" },
  { label: "Indicadores", href: "/indicadores" },
  { label: "Mapa", href: "/mapa-publico" },
];

export function PublicLayout() {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplets className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                AGUASABIA
              </span>
              <span className="block text-xs text-muted-foreground">
                Indicadores territoriales
              </span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
                    isActive && "bg-secondary text-secondary-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Button aria-label="Cambiar tema" size="icon" variant="outline" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
