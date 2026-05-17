import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { createClient } from "@/lib/supabase/server";
import { buildHeatmap, computeStreak } from "@/lib/streak";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since = new Date();
  since.setDate(since.getDate() - 365);

  const { data: rows } = await supabase
    .from("daily_activity")
    .select("day, problems_solved")
    .eq("user_id", user.id)
    .gte("day", since.toISOString().slice(0, 10));

  const cells = buildHeatmap(rows ?? []);
  const streak = computeStreak(rows ?? []);

  const totalSolves = (rows ?? []).reduce((s, r) => s + r.problems_solved, 0);
  const activeDays = new Set((rows ?? []).filter((r) => r.problems_solved > 0).map((r) => r.day)).size;
  const busiest = [...(rows ?? [])].sort((a, b) => b.problems_solved - a.problems_solved)[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--color-foreground-muted)]">A year, day by day</p>
        <h1 className="font-display text-5xl">
          {totalSolves.toLocaleString()} problems · {activeDays} active days
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contribution graph</CardTitle>
          <CardDescription>
            Combined across all your connected platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap cells={cells} />
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Current streak" value={`${streak.current}d`} />
        <Stat label="Longest streak" value={`${streak.longest}d`} />
        <Stat
          label="Best day"
          value={
            busiest
              ? `${busiest.problems_solved} on ${formatDate(busiest.day)}`
              : "—"
          }
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-foreground-muted)]">
        {label}
      </p>
      <p className="font-display text-3xl mt-1">{value}</p>
    </Card>
  );
}
