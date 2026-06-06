import { CheckCheck, Clock3, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mensajes } from "@/services/mock-data";

const messageMetrics = [
  { label: "Mensajes enviados", value: "1.284", icon: Send },
  { label: "Entregados", value: "96%", icon: CheckCheck },
  { label: "Pendientes", value: "14", icon: Clock3 },
];

export function MensajeriaPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            Mensajeria operacional
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Historial WhatsApp, alertas enviadas, mensajes automaticos y estado
            de entrega por productor.
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4" />
          Nuevo comunicado
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {messageMetrics.map((item) => {
          const Icon = item.icon;
          return (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
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
          <CardTitle>Historial institucional</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Productor</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mensajes.map((mensaje) => (
                <TableRow key={mensaje.id}>
                  <TableCell className="font-medium">{mensaje.productor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {mensaje.asunto}
                    </div>
                  </TableCell>
                  <TableCell>{mensaje.canal}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        mensaje.estado === "fallido"
                          ? "red"
                          : mensaje.estado === "enviado"
                            ? "cyan"
                            : "green"
                      }
                    >
                      {mensaje.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{mensaje.fecha}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
