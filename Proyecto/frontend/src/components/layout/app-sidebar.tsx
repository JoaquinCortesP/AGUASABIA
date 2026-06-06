import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  Droplets,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useUiStore } from "@/app/store/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Productores", href: "/app/productores", icon: Users },
  { label: "Mapa Territorial", href: "/app/mapa", icon: Map },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Alertas", href: "/app/alertas", icon: Bell },
  { label: "Mensajeria", href: "/app/mensajeria", icon: MessageSquare },
  { label: "Configuracion", href: "/app/configuracion", icon: Settings },
];

export function AppSidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-all duration-300 md:flex",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <NavLink to="/app/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Droplets className="h-5 w-5" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                AGUASABIA
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Gestion hidrica municipal
              </span>
            </span>
          ) : null}
        </NavLink>
        <Button
          aria-label="Contraer menu"
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive &&
                    "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-border",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div
          className={cn(
            "rounded-lg border border-border bg-muted/40 p-3",
            collapsed && "p-2",
          )}
        >
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            {!collapsed ? "Operacion municipal" : "OP"}
          </div>
          {!collapsed ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Monitoreo ET0, productores, alertas y parcelas por comuna.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium text-muted-foreground",
                  isActive && "bg-secondary text-secondary-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
