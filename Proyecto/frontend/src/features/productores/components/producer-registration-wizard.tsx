import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, MapPinned, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { PolygonDesigner } from "@/components/maps/polygon-designer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { calculatePolygonAreaHa } from "@/lib/leaflet/geo";
import { comunas } from "@/services/mock-data";
import {
  productorSchema,
  type ProducerFormValues,
} from "@/features/productores/schemas/productor.schema";
import type { ProducerCreatePayload } from "@/features/productores/types/productor.types";
import type { Coordinates } from "@/types/domain";

interface ProducerRegistrationWizardProps {
  isSubmitting?: boolean;
  onSubmit: (payload: ProducerCreatePayload) => Promise<void> | void;
}

const steps = [
  { label: "Datos", icon: UserRound },
  { label: "Parcelas", icon: MapPinned },
  { label: "Resumen", icon: Check },
];

export function ProducerRegistrationWizard({
  isSubmitting = false,
  onSubmit,
}: ProducerRegistrationWizardProps) {
  const [step, setStep] = useState(0);
  const [polygon, setPolygon] = useState<Coordinates[]>([]);
  const form = useForm<ProducerFormValues>({
    resolver: zodResolver(productorSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      comuna: "Paine",
      cultivo: "",
      hectareas: 1,
    },
  });
  const values = form.watch();
  const area = calculatePolygonAreaHa(polygon);

  async function goNext() {
    if (step === 0) {
      const valid = await form.trigger([
        "nombre",
        "telefono",
        "comuna",
        "cultivo",
        "hectareas",
      ]);
      if (!valid) {
        return;
      }
    }

    if (step === 1 && polygon.length < 3) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  const handleSubmit = form.handleSubmit((formValues) =>
    onSubmit({ ...formValues, poligono_vertices: polygon }),
  );

  return (
    <form className="space-y-6 p-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const active = index === step;
          const complete = index < step;

          return (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-3"
            >
              <span
                className={
                  active || complete
                    ? "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    : "flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                }
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre productor" error={form.formState.errors.nombre?.message}>
            <Input placeholder="Ej. Maria Contreras" {...form.register("nombre")} />
          </Field>
          <Field label="Telefono" error={form.formState.errors.telefono?.message}>
            <Input placeholder="+56 9 1234 5678" {...form.register("telefono")} />
          </Field>
          <Field label="Comuna" error={form.formState.errors.comuna?.message}>
            <Select {...form.register("comuna")}>
              {comunas.map((comuna) => (
                <option key={comuna.id} value={comuna.nombre}>
                  {comuna.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cultivo principal" error={form.formState.errors.cultivo?.message}>
            <Input placeholder="Ej. Nogal, vid, hortalizas" {...form.register("cultivo")} />
          </Field>
          <Field label="Hectareas declaradas" error={form.formState.errors.hectareas?.message}>
            <Input type="number" step="0.1" min="0" {...form.register("hectareas")} />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <PolygonDesigner value={polygon} onChange={setPolygon} />
          {polygon.length < 3 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950 dark:text-amber-300">
              Agrega al menos tres vertices para registrar el poligono de la parcela.
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Productor" value={values.nombre} />
          <SummaryItem label="Telefono" value={values.telefono} />
          <SummaryItem label="Comuna" value={values.comuna} />
          <SummaryItem label="Cultivo" value={values.cultivo} />
          <SummaryItem label="Hectareas declaradas" value={`${values.hectareas} ha`} />
          <SummaryItem label="Area visual" value={`${area.toFixed(2)} ha`} />
          <SummaryItem label="Vertices" value={`${polygon.length}`} />
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            <Check className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Registrar productor"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value || "No informado"}</div>
    </div>
  );
}
