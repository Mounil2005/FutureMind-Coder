"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_CLASSES = [
  "bg-[var(--color-surface-2)]",
  "bg-[oklch(from_var(--color-primary)_l_c_h_/_0.18)]",
  "bg-[oklch(from_var(--color-primary)_l_c_h_/_0.40)]",
  "bg-[oklch(from_var(--color-primary)_l_c_h_/_0.66)]",
  "bg-[var(--color-primary)]",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const weeks = React.useMemo(() => {
    const out: HeatmapCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      out.push(cells.slice(i, i + 7));
    }
    return out;
  }, [cells]);

  const monthLabels = React.useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const first = week[0];
      if (!first) return;
      const month = new Date(first.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ col: i, label: MONTHS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="space-y-2">
      <div className="relative ml-7 grid grid-flow-col text-[10px] text-[var(--color-foreground-muted)]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0,1fr))` }}>
        {monthLabels.map((m, i) => {
          const next = monthLabels[i + 1]?.col ?? weeks.length;
          return (
            <span
              key={`${m.label}-${i}`}
              className="col-span-1"
              style={{ gridColumn: `${m.col + 1} / span ${next - m.col}` }}
            >
              {m.label}
            </span>
          );
        })}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col justify-between text-[10px] text-[var(--color-foreground-muted)] pt-0.5 pb-0.5">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        <div className="flex gap-[3px] flex-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                if (!cell) return <div key={di} className="size-3" />;
                return (
                  <div
                    key={cell.date}
                    title={`${cell.count} ${cell.count === 1 ? "problem" : "problems"} · ${cell.date}`}
                    className={cn(
                      "size-3 rounded-[3px] transition-transform hover:scale-125",
                      LEVEL_CLASSES[cell.level],
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-[var(--color-foreground-muted)] pt-1">
        <span>Less</span>
        {LEVEL_CLASSES.map((c, i) => (
          <div key={i} className={cn("size-3 rounded-[3px]", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
