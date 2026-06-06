import type { ComponentType } from "react";
import { MapPinned, Sprout, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { RiskBadge } from "@/components/feedback/risk-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { formatHectares, formatPercentage } from "@/lib/utils/formatters";
import type { ProducerRecord } from "@/features/productores/types/productor.types";

interface ProducerCardProps {
  producer: ProducerRecord;
}

export function ProducerCard({ producer }: ProducerCardProps) {
  return (
    <Link to={`/app/productores/${producer.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {producer.nombre}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{producer.telefono}</div>
            </div>
            <RiskBadge level={producer.estadoHidrico} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Metric icon={Sprout} label={producer.cultivo} />
            <Metric icon={MapPinned} label={formatHectares(producer.hectareas)} />
            <Metric icon={UserRound} label={`${producer.parcelas} parcelas`} />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Eficiencia hidrica</span>
              <span className="font-medium text-foreground">
                {formatPercentage(producer.eficiencia)}
              </span>
            </div>
            <Progress value={producer.eficiencia} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
