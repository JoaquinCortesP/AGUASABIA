import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const labels: Record<string, string> = {
  app: "Panel",
  dashboard: "Dashboard",
  productores: "Productores",
  mapa: "Mapa Territorial",
  analytics: "Analytics",
  alertas: "Alertas",
  mensajeria: "Mensajeria",
  configuracion: "Configuracion",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
      <Link to="/app/dashboard" className="transition-colors hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={path} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {labels[segment] ?? segment}
              </span>
            ) : (
              <Link to={path} className="transition-colors hover:text-foreground">
                {labels[segment] ?? segment}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
