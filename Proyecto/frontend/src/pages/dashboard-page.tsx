import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Gauge,
  LandPlot,
  TrendingUp,
  Users,
} from "lucide-react";
import { Et0TrendChart } from "@/components/charts/et0-trend-chart";
import { WaterBalanceChart } from "@/components/charts/water-balance-chart";
import { KpiCard } from "@/components/cards/kpi-card";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { TerritorialMap } from "@/components/maps/territorial-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParcelas } from "@/features/parcelas/hooks/use-parcelas";
import { alertas, dashboardKpis, et0Series } from "@/services/mock-data";

const iconMap = {
  et0: Droplets,
  precipitacion: CloudRain,
  hectareas: LandPlot,
  productores: Users,
  riesgo: AlertTriangle,
  eficiencia: Gauge,
};

export function DashboardPage() {
  const parcelas = useParcelas();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="cyan">Operacion comunal en tiempo real</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Dashboard municipal de gestion hidrica
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Monitoreo ET0, balance hidrico, productores activos y riesgo ambiental
            para decisiones territoriales.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboardKpis.map((metric) => {
          const Icon = iconMap[metric.id as keyof typeof iconMap] ?? TrendingUp;
          return <KpiCard key={metric.id} metric={metric} icon={Icon} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Historico ET0 y precipitacion</CardTitle>
          </CardHeader>
          <CardContent>
            <Et0TrendChart data={et0Series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas activas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{alerta.titulo}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alerta.descripcion}
                    </p>
                  </div>
                  <RiskBadge level={alerta.severidad} />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {alerta.comuna} - {alerta.fecha}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Balance ideal vs consumo real</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterBalanceChart data={et0Series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mapa territorial de parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            {parcelas.isLoading ? (
              <Skeleton className="h-[420px]" />
            ) : (
              <TerritorialMap parcels={parcelas.data ?? []} dense />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
