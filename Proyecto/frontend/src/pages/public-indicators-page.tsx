import { Et0TrendChart } from "@/components/charts/et0-trend-chart";
import { WaterBalanceChart } from "@/components/charts/water-balance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { et0Series, publicIndicators } from "@/services/mock-data";

export function PublicIndicatorsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          Indicadores publicos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vista abierta de ET0, clima, eficiencia estimada y riesgo ambiental comunal.
        </p>
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
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ET0 comunal</CardTitle>
          </CardHeader>
          <CardContent>
            <Et0TrendChart data={et0Series} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ahorro y recomendacion</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterBalanceChart data={et0Series} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
