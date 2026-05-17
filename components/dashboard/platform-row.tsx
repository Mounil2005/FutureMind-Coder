import { cn, formatDuration } from "@/lib/utils";
import type { Platform } from "@/lib/supabase/types";

const META: Record<Platform, { label: string; tone: string }> = {
  leetcode: { label: "LeetCode", tone: "oklch(0.72 0.140 75)" },
  codeforces: { label: "Codeforces", tone: "oklch(0.62 0.140 240)" },
  github: { label: "GitHub", tone: "oklch(0.50 0.020 280)" },
  codechef: { label: "CodeChef", tone: "oklch(0.55 0.110 30)" },
  atcoder: { label: "AtCoder", tone: "oklch(0.20 0.010 60)" },
};

interface Row {
  platform: Platform;
  username: string | null;
  problems: number;
  minutes: number;
}

export function PlatformRow({
  row,
  totalMinutes,
}: {
  row: Row;
  totalMinutes: number;
}) {
  const { label, tone } = META[row.platform];
  const pct = totalMinutes > 0 ? (row.minutes / totalMinutes) * 100 : 0;

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: tone }}
            />
            <span className="font-medium truncate">{label}</span>
            {row.username && (
              <span className="text-xs text-[var(--color-foreground-muted)] truncate">
                @{row.username}
              </span>
            )}
          </div>
          <span className="text-xs tabular-nums text-[var(--color-foreground-muted)]">
            {row.problems} solved · {formatDuration(row.minutes * 60)}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-[var(--color-surface-2)] overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all")}
            style={{ width: `${pct}%`, backgroundColor: tone }}
          />
        </div>
      </div>
    </div>
  );
}
