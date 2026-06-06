import { Link } from "react-router-dom";
import { ArrowRight, MapPinned } from "lucide-react";
import { Et0TrendChart } from "@/components/charts/et0-trend-chart";
import { TerritorialMap } from "@/components/maps/territorial-map";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { et0Series, parcelas, publicIndicators } from "@/services/mock-data";

export function PublicDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-panel">
          <div>
            <div className="inline-flex rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Portal territorial publico
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Indicadores hidricos comunales para decision publica.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Explora ET0, clima, riesgo ambiental y mapas territoriales sin acceso
              administrativo.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className={buttonVariants()}>
              Acceso municipal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/mapa-publico"
              className={buttonVariants({ variant: "outline" })}
            >
              Ver mapa
              <MapPinned className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mapa comunal publico</CardTitle>
          </CardHeader>
          <CardContent>
            <TerritorialMap parcels={parcelas} dense />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {publicIndicators.map((indicator) => (
          <Card key={indicator.label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{indicator.label}</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {indicator.value}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {indicator.helper}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>ET0 y precipitacion comunal</CardTitle>
        </CardHeader>
        <CardContent>
          <Et0TrendChart data={et0Series} />
        </CardContent>
      </Card>
    </div>
  );
}
