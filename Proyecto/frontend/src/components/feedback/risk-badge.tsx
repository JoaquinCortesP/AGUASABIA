import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types/domain";

const riskLabels: Record<RiskLevel, string> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Critico",
};

const riskVariants: Record<RiskLevel, "green" | "amber" | "red"> = {
  bajo: "green",
  medio: "amber",
  alto: "red",
  critico: "red",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge variant={riskVariants[level]}>{riskLabels[level]}</Badge>;
}
