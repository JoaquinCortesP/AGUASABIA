import { BarChart3, CloudSun, Gauge, LineChart } from "lucide-react";
import { Et0TrendChart } from "@/components/charts/et0-trend-chart";
import { WaterBalanceChart } from "@/components/charts/water-balance-chart";
import { KpiCard } from "@/components/cards/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { et0Series } from "@/services/mock-data";
import type { KpiMetric } from "@/types/domain";

const metrics: KpiMetric[] = [
  {
    id: "tendencia-et0",
    label: "Tendencia ET0",
    value: "+8,2%",
    delta: "Comparativo semanal",
    trend: "up",
    tone: "cyan",
  },
  {
    id: "consumo-semanal",
    label: "Consumo semanal",
    value: "298 m3",
    delta: "Productores activos",
    trend: "steady",
    tone: "blue",
  },
  {
    id: "balance",
    label: "Balance promedio",
    value: "0,86",
    delta: "Indice comunal",
    trend: "up",
    tone: "green",
  },
  {
    id: "riesgo",
    label: "Sectores bajo estres",
    value: "7",
    delta: "Priorizacion operativa",
    trend: "up",
    tone: "amber",
  },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          Analytics hidrico territorial
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Tendencias comunales, evolucion climatica, consumo semanal y comparativas
          para planificacion municipal.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard
            key={metric.id}
            metric={metric}
            icon={
              metric.id === "tendencia-et0"
                ? LineChart
                : metric.id === "consumo-semanal"
                  ? BarChart3
                  : metric.id === "balance"
                    ? Gauge
                    : CloudSun
            }
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ET0 historica y precipitacion</CardTitle>
          </CardHeader>
          <CardContent>
            <Et0TrendChart data={et0Series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consumo semanal y riego recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterBalanceChart data={et0Series} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["Paine Oriente", "Buin Rural", "Melipilla Norte"].map((sector, index) => (
          <Card key={sector}>
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-foreground">{sector}</div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${72 - index * 12}%` }}
                />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Indice de eficiencia territorial
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
