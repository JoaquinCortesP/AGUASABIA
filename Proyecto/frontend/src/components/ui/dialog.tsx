import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({
  open,
  title,
  description,
  children,
  className,
  onOpenChange,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/40 backdrop-blur-sm">
      <div
        className={cn(
          "h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-background shadow-2xl",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-background/95 p-5 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Cerrar"
            size="icon"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
