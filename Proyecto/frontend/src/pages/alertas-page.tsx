import { AlertTriangle, Flame, ThermometerSun, Waves } from "lucide-react";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alertas } from "@/services/mock-data";

const alertMetrics = [
  { label: "Olas de calor", value: "2 eventos", icon: Flame },
  { label: "Estres hidrico", value: "7 sectores", icon: Waves },
  { label: "ET0 elevada", value: "3 comunas", icon: ThermometerSun },
];

export function AlertasPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="red">Centro operacional</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Alertas ambientales e hidricas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Priorizacion de riesgo, estres hidrico, olas de calor y estados ET0
            para acciones municipales.
          </p>
        </div>
        <Button variant="outline">Configurar umbrales</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {alertMetrics.map((item) => {
          const Icon = item.icon;
          return (
          <Card key={item.label} className="border-amber-200/70 dark:border-amber-900/70">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="text-xl font-semibold text-foreground">{item.value}</div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Alertas activas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{alerta.titulo}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alerta.descripcion}
                    </p>
                  </div>
                </div>
                <RiskBadge level={alerta.severidad} />
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {alerta.comuna} - {alerta.fecha}
                </span>
                <Badge variant="outline">{alerta.estado}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
