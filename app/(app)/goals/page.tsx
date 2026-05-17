import { Target, Flame, Hourglass } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { GoalCard } from "./goal-card";
import type { GoalKind } from "@/lib/supabase/types";

export const metadata = { title: "Goals" };

const GOAL_DEFS: { kind: GoalKind; label: string; description: string; suffix: string; icon: typeof Target; defaultTarget: number }[] = [
  {
    kind: "daily_problems",
    label: "Daily problems",
    description: "A small, repeatable target — the kind that builds streaks.",
    suffix: "/day",
    icon: Flame,
    defaultTarget: 2,
  },
  {
    kind: "weekly_problems",
    label: "Weekly problems",
    description: "Total problems solved across all platforms each week.",
    suffix: "/week",
    icon: Target,
    defaultTarget: 14,
  },
  {
    kind: "weekly_minutes",
    label: "Focused minutes",
    description: "Time spent inside coding platforms — tracked by the extension.",
    suffix: "min/week",
    icon: Hourglass,
    defaultTarget: 300,
  },
];

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  // Compute progress for each goal
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dayStr = today.toISOString().slice(0, 10);
  const weekStr = startOfWeek.toISOString().slice(0, 10);

  const { data: weekRows } = await supabase
    .from("daily_activity")
    .select("day, problems_solved, seconds_spent")
    .eq("user_id", user.id)
    .gte("day", weekStr);

  const todayRows = (weekRows ?? []).filter((r) => r.day === dayStr);
  const dailyProgress = todayRows.reduce((s, r) => s + r.problems_solved, 0);
  const weeklyProblems = (weekRows ?? []).reduce((s, r) => s + r.problems_solved, 0);
  const weeklyMinutes = Math.round(
    (weekRows ?? []).reduce((s, r) => s + r.seconds_spent, 0) / 60,
  );

  const progressByKind: Record<GoalKind, number> = {
    daily_problems: dailyProgress,
    weekly_problems: weeklyProblems,
    weekly_minutes: weeklyMinutes,
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Targets you set, not ones we made up.
        </p>
        <h1 className="font-display text-5xl">Goals</h1>
      </header>

      <div className="space-y-3">
        {GOAL_DEFS.map((def) => {
          const existing = goals?.find((g) => g.kind === def.kind);
          return (
            <GoalCard
              key={def.kind}
              kind={def.kind}
              label={def.label}
              description={def.description}
              suffix={def.suffix}
              icon={def.icon}
              defaultTarget={def.defaultTarget}
              target={existing?.target ?? null}
              active={existing?.active ?? false}
              progress={progressByKind[def.kind]}
            />
          );
        })}
      </div>

      <Card className="bg-[var(--color-surface-2)] border-dashed border-[var(--color-border-strong)]">
        <CardHeader>
          <CardTitle>How streaks work here</CardTitle>
          <CardDescription>
            A day &ldquo;counts&rdquo; if you solved at least one problem on any
            connected platform. Miss a day and the streak resets — that&rsquo;s
            kind of the point.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
