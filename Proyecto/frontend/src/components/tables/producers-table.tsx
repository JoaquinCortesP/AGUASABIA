import { Link } from "react-router-dom";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHectares, formatPercentage } from "@/lib/utils/formatters";
import type { ProducerRecord } from "@/features/productores/types/productor.types";

interface ProducersTableProps {
  producers: ProducerRecord[];
}

export function ProducersTable({ producers }: ProducersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Productor</TableHead>
          <TableHead>Comuna</TableHead>
          <TableHead>Cultivo</TableHead>
          <TableHead>Superficie</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Eficiencia</TableHead>
          <TableHead>Ultima lectura</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {producers.map((producer) => (
          <TableRow key={producer.id}>
            <TableCell>
              <Link
                to={`/app/productores/${producer.id}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {producer.nombre}
              </Link>
              <div className="text-xs text-muted-foreground">{producer.telefono}</div>
            </TableCell>
            <TableCell>{producer.comuna}</TableCell>
            <TableCell>{producer.cultivo}</TableCell>
            <TableCell>{formatHectares(producer.hectareas)}</TableCell>
            <TableCell>
              <RiskBadge level={producer.estadoHidrico} />
            </TableCell>
            <TableCell className="min-w-36">
              <div className="mb-1 text-xs text-muted-foreground">
                {formatPercentage(producer.eficiencia)}
              </div>
              <Progress value={producer.eficiencia} />
            </TableCell>
            <TableCell>{producer.ultimaLectura}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
