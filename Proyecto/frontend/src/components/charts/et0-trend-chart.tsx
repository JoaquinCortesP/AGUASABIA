import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { TimeSeriesPoint } from "@/types/domain";

interface Et0TrendChartProps {
  data: TimeSeriesPoint[];
}

export function Et0TrendChart({ data }: Et0TrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="fecha"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="et0"
            name="ET0"
            stroke="#0891b2"
            fill="#0891b2"
            fillOpacity={0.16}
            strokeWidth={2.5}
          />
          <Area
            type="monotone"
            dataKey="precipitacion"
            name="Precipitacion"
            stroke="#2aa889"
            fill="#2aa889"
            fillOpacity={0.12}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
