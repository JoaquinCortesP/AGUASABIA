import { TerritorialMap } from "@/components/maps/territorial-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parcelas } from "@/services/mock-data";

export function PublicMapPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          Mapa publico territorial
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Exploracion abierta de zonas monitoreadas y condicion hidrica agregada.
        </p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Territorio comunal</CardTitle>
        </CardHeader>
        <CardContent>
          <TerritorialMap parcels={parcelas} />
        </CardContent>
      </Card>
    </div>
  );
}
