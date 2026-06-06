import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { TimeSeriesPoint } from "@/types/domain";

interface WaterBalanceChartProps {
  data: TimeSeriesPoint[];
}

export function WaterBalanceChart({ data }: WaterBalanceChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
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
          <Legend />
          <Bar
            dataKey="consumo"
            name="Consumo real"
            fill="#1d4ed8"
            radius={[6, 6, 0, 0]}
          />
          <Line
            dataKey="recomendado"
            name="Riego recomendado"
            stroke="#2aa889"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
