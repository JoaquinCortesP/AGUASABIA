import { Navigate, useParams } from "react-router-dom";
import { Activity, Bell, Droplets, MessageSquare, Satellite } from "lucide-react";
import { Et0TrendChart } from "@/components/charts/et0-trend-chart";
import { WaterBalanceChart } from "@/components/charts/water-balance-chart";
import { KpiCard } from "@/components/cards/kpi-card";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductores } from "@/features/productores/hooks/use-productores";
import { et0Series } from "@/services/mock-data";
import type { KpiMetric } from "@/types/domain";

export function ProductorProfilePage() {
  const params = useParams();
  const productorId = Number(params.id);
  const productores = useProductores();
  const productor = productores.data?.find((item) => item.id === productorId);

  if (!productores.isLoading && !productor) {
    return <Navigate to="/app/productores" replace />;
  }

  const metrics: KpiMetric[] = [
    {
      id: "et0",
      label: "ET0 parcela",
      value: "5,1 mm",
      delta: "Sobre promedio comunal",
      trend: "up",
      tone: "cyan",
    },
    {
      id: "consumo",
      label: "Consumo hidrico",
      value: "46 m3",
      delta: "Ultimas 24 h",
      trend: "steady",
      tone: "blue",
    },
    {
      id: "balance",
      label: "Balance hidrico",
      value: "-12%",
      delta: "Deficit relativo",
      trend: "down",
      tone: "amber",
    },
    {
      id: "ndvi",
      label: "NDVI futuro",
      value: "Preparado",
      delta: "Integracion satelital",
      trend: "steady",
      tone: "green",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            {productor?.nombre ?? "Perfil productor"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dashboard tecnico de cultivo, consumo, alertas y mensajeria operacional.
          </p>
        </div>
        {productor ? <RiskBadge level={productor.estadoHidrico} /> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <KpiCard
            key={metric.id}
            metric={metric}
            icon={
              metric.id === "ndvi"
                ? Satellite
                : metric.id === "balance"
                  ? Activity
                  : Droplets
            }
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ET0 e historial climatico</CardTitle>
          </CardHeader>
          <CardContent>
            <Et0TrendChart data={et0Series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comparacion ideal vs real</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterBalanceChart data={et0Series} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historial de alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["ET0 elevada", "Deficit de riego", "Seguimiento semanal"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
              ),
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historial WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Recomendacion enviada", "Confirmacion recibida", "Alerta leida"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <MessageSquare className="h-4 w-4 text-cyan-700" />
                  <span className="font-medium text-foreground">{item}</span>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
