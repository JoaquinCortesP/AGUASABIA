import { useMemo, useState } from "react";
import { Filter, Plus, Search, Users } from "lucide-react";
import { KpiCard } from "@/components/cards/kpi-card";
import { ProducerCard } from "@/features/productores/components/producer-card";
import { ProducerRegistrationWizard } from "@/features/productores/components/producer-registration-wizard";
import { ProducersTable } from "@/components/tables/producers-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useCreateProductor,
  useProductores,
} from "@/features/productores/hooks/use-productores";
import type { KpiMetric } from "@/types/domain";

export function ProductoresPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const productores = useProductores();
  const createProductor = useCreateProductor();
  const records = useMemo(() => productores.data ?? [], [productores.data]);

  const filtered = useMemo(
    () =>
      records.filter((producer) => {
        const matchesSearch = [producer.nombre, producer.comuna, producer.cultivo]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRisk =
          riskFilter === "todos" || producer.estadoHidrico === riskFilter;
        return matchesSearch && matchesRisk;
      }),
    [records, riskFilter, search],
  );

  const metrics: KpiMetric[] = [
    {
      id: "productores-total",
      label: "Productores gestionados",
      value: String(records.length),
      delta: "Municipal activos",
      trend: "steady",
      tone: "blue",
    },
    {
      id: "superficie-total",
      label: "Superficie operativa",
      value: `${records.reduce((sum, item) => sum + item.hectareas, 0).toFixed(1)} ha`,
      delta: "Con trazabilidad territorial",
      trend: "up",
      tone: "green",
    },
    {
      id: "riesgo-alto",
      label: "Riesgo alto/critico",
      value: String(
        records.filter((item) => ["alto", "critico"].includes(item.estadoHidrico))
          .length,
      ),
      delta: "Requieren seguimiento",
      trend: "up",
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Gestion territorial de productores
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Administracion municipal de agricultores, superficie monitoreada,
            cultivos y estado hidrico por comuna.
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          Registrar productor
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <KpiCard key={metric.id} metric={metric} icon={Users} />
        ))}
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por productor, cultivo o comuna"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              className="w-48"
            >
              <option value="todos">Todos los estados</option>
              <option value="bajo">Riesgo bajo</option>
              <option value="medio">Riesgo medio</option>
              <option value="alto">Riesgo alto</option>
              <option value="critico">Critico</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {filtered.map((producer) => (
          <ProducerCard key={producer.id} producer={producer} />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Operacion productores</CardTitle>
        </CardHeader>
        <CardContent>
          <ProducersTable producers={filtered} />
        </CardContent>
      </Card>

      <Dialog
        open={drawerOpen}
        title="Registrar productor"
        description="Formulario operacional con datos personales, parcela y resumen."
        onOpenChange={setDrawerOpen}
      >
        <ProducerRegistrationWizard
          isSubmitting={createProductor.isPending}
          onSubmit={async (payload) => {
            await createProductor.mutateAsync(payload);
            setDrawerOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
