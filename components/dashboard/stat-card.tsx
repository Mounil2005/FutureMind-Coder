import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  trend?: { delta: number; window: string };
  icon?: LucideIcon;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  trend,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-5 flex flex-col gap-3 relative overflow-hidden",
        accent && "bg-[var(--color-primary-soft)] border-transparent",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.12em] text-[var(--color-foreground-muted)]">
          {label}
        </span>
        {Icon && <Icon className="size-4 text-[var(--color-foreground-muted)]" strokeWidth={1.6} />}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-4xl leading-none tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[var(--color-foreground-muted)]">
            {unit}
          </span>
        )}
      </div>

      {(hint || trend) && (
        <div className="flex items-center justify-between text-xs">
          {hint && (
            <span className="text-[var(--color-foreground-muted)]">{hint}</span>
          )}
          {trend && (
            <span
              className={cn(
                "tabular-nums",
                trend.delta > 0
                  ? "text-[var(--color-success)]"
                  : trend.delta < 0
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-foreground-muted)]",
              )}
            >
              {trend.delta > 0 ? "+" : ""}
              {trend.delta} {trend.window}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
