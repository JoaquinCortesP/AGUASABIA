import { Bell, Building2, KeyRound, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const integrationItems = [
  { label: "JWT FastAPI", value: "Activo", icon: KeyRound },
  { label: "Socket.IO", value: "Preparado", icon: RadioTower },
];

export function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
          Configuracion municipal
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Preferencias institucionales, umbrales hidricos, integraciones y perfil
          del administrador municipal.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Municipio
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre institucional</Label>
              <Input defaultValue="Municipalidad de Paine" />
            </div>
            <div className="space-y-2">
              <Label>Codigo municipal</Label>
              <Input defaultValue="MUN-PAI-001" />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select defaultValue="metropolitana">
                <option value="metropolitana">Metropolitana de Santiago</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comuna</Label>
              <Select defaultValue="paine">
                <option value="paine">Paine</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Umbrales de alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ET0 alta</Label>
              <Input type="number" defaultValue="5.2" />
            </div>
            <div className="space-y-2">
              <Label>Deficit semanal</Label>
              <Input type="number" defaultValue="18" />
            </div>
            <div className="space-y-2">
              <Label>Canal prioritario</Label>
              <Select defaultValue="whatsapp">
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select defaultValue="diaria">
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {integrationItems.map((item) => {
          const Icon = item.icon;
          return (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-medium text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.value}</div>
                </div>
              </div>
              <Button variant="outline">Revisar</Button>
            </CardContent>
          </Card>
          );
        })}
      </section>
    </div>
  );
}
