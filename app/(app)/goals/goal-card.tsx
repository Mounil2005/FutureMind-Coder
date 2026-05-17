"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GoalKind } from "@/lib/supabase/types";
import { saveGoal } from "./actions";

interface Props {
  kind: GoalKind;
  label: string;
  description: string;
  suffix: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  defaultTarget: number;
  target: number | null;
  active: boolean;
  progress: number;
}

export function GoalCard({
  kind,
  label,
  description,
  suffix,
  icon: Icon,
  defaultTarget,
  target,
  active,
  progress,
}: Props) {
  const [editing, setEditing] = React.useState(target == null);
  const [pending, startTransition] = React.useTransition();
  const [draft, setDraft] = React.useState(String(target ?? defaultTarget));

  const numericTarget = target ?? defaultTarget;
  const pct = active ? Math.min(100, (progress / numericTarget) * 100) : 0;
  const done = active && progress >= numericTarget;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-[var(--radius-md)] shrink-0",
            active
              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
              : "bg-[var(--color-surface-2)] text-[var(--color-foreground-muted)]",
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-sm font-medium">{label}</h3>
            {done && <Badge variant="success">done · today</Badge>}
            {!active && <Badge variant="outline">not set</Badge>}
            <p className="text-xs text-[var(--color-foreground-muted)] basis-full">
              {description}
            </p>
          </div>

          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = parseInt(draft, 10);
                if (!Number.isFinite(t) || t < 1) {
                  toast.error("Pick a positive number.");
                  return;
                }
                startTransition(async () => {
                  try {
                    await saveGoal(kind, t, true);
                    toast.success("Goal saved.");
                    setEditing(false);
                  } catch (e: any) {
                    toast.error(e.message ?? "Could not save.");
                  }
                });
              }}
              className="flex items-end gap-2"
            >
              <div className="space-y-1">
                <Label htmlFor={`g-${kind}`}>Target</Label>
                <Input
                  id={`g-${kind}`}
                  type="number"
                  min={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-32"
                />
              </div>
              <span className="text-xs text-[var(--color-foreground-muted)] mb-2.5">
                {suffix}
              </span>
              <Button type="submit" size="sm" disabled={pending}>
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                Save
              </Button>
              {target != null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(String(target));
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline justify-between text-xs text-[var(--color-foreground-muted)]">
                  <span className="tabular-nums text-[var(--color-foreground)]">
                    {progress} of {numericTarget}
                  </span>
                  <span>{suffix}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
