import { Layers, MapPinned, RadioTower } from "lucide-react";
import { TerritorialMap } from "@/components/maps/territorial-map";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParcelas } from "@/features/parcelas/hooks/use-parcelas";

const layerItems = [
  { label: "Parcelas monitoreadas", status: "Activo" },
  { label: "Riesgo hidrico", status: "Activo" },
  { label: "Productores", status: "Activo" },
  { label: "Comunas", status: "Preparado" },
  { label: "NDVI satelital", status: "Futuro" },
];

export function MapaTerritorialPage() {
  const parcelas = useParcelas();
  const records = parcelas.data ?? [];
  const operationalStats = [
    { label: "Poligonos", value: String(records.length), icon: MapPinned },
    { label: "Overlays activos", value: "3", icon: Layers },
    { label: "Tiempo real", value: "Socket preparado", icon: RadioTower },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="secondary">ArcGIS style operational map</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Mapa territorial comunal
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Parcelas, productores, capas de riesgo hidrico y lectura territorial
            para fiscalizacion municipal.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capas operacionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layerItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <Badge variant={item.status === "Activo" ? "green" : "outline"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Parcelas criticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {records
                .filter((parcel) => ["alto", "critico"].includes(parcel.riesgo))
                .map((parcel) => (
                  <div key={parcel.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {parcel.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {parcel.productor}
                        </div>
                      </div>
                      <RiskBadge level={parcel.riesgo} />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </aside>

        <Card>
          <CardContent className="p-3">
            {parcelas.isLoading ? (
              <Skeleton className="h-[680px]" />
            ) : (
              <TerritorialMap parcels={records} className="min-h-[680px]" />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {operationalStats.map((item) => {
          const Icon = item.icon;
          return (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="font-semibold text-foreground">{item.value}</div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </section>
    </div>
  );
}
