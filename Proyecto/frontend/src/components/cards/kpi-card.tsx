import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { KpiMetric } from "@/types/domain";

const toneClasses: Record<KpiMetric["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  steady: ArrowRight,
};

interface KpiCardProps {
  metric: KpiMetric;
  icon: LucideIcon;
}

export function KpiCard({ metric, icon: Icon }: KpiCardProps) {
  const TrendIcon = trendIcons[metric.trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
                {metric.value}
              </p>
            </div>
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                toneClasses[metric.tone],
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendIcon className="h-3.5 w-3.5" />
            <span className="truncate">{metric.delta}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
