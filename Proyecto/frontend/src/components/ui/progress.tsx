import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
