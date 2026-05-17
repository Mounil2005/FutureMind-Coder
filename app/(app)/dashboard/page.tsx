import Link from "next/link";
import { Flame, Trophy, Timer, Code2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { PlatformRow } from "@/components/dashboard/platform-row";
import { createClient } from "@/lib/supabase/server";
import { computeStreak, buildHeatmap } from "@/lib/streak";
import { formatDate } from "@/lib/utils";
import type { Platform } from "@/lib/supabase/types";

export const metadata = { title: "Overview" };

const PLATFORMS: Platform[] = ["leetcode", "codeforces", "github", "codechef", "atcoder"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("platform, username")
    .eq("user_id", user.id);

  const since = new Date();
  since.setDate(since.getDate() - 365);

  const { data: activity } = await supabase
    .from("daily_activity")
    .select("day, platform, problems_solved, seconds_spent")
    .eq("user_id", user.id)
    .gte("day", since.toISOString().slice(0, 10));

  const rows = activity ?? [];
  const streak = computeStreak(rows);
  const cells = buildHeatmap(rows);

  const totalSolved = rows.reduce((s, r) => s + r.problems_solved, 0);
  const totalMinutes = Math.round(
    rows.reduce((s, r) => s + r.seconds_spent, 0) / 60,
  );

  // 7-day mini chart
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().slice(0, 10);
    const dayRows = rows.filter((r) => r.day === day);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      problems: dayRows.reduce((s, r) => s + r.problems_solved, 0),
      minutes: Math.round(
        dayRows.reduce((s, r) => s + r.seconds_spent, 0) / 60,
      ),
    };
  });

  const platformBreakdown = PLATFORMS.map((p) => {
    const platformRows = rows.filter((r) => r.platform === p);
    const account = accounts?.find((a) => a.platform === p);
    return {
      platform: p,
      username: account?.username ?? null,
      problems: platformRows.reduce((s, r) => s + r.problems_solved, 0),
      minutes: Math.round(
        platformRows.reduce((s, r) => s + r.seconds_spent, 0) / 60,
      ),
    };
  });

  const hasAnyAccount = (accounts?.length ?? 0) > 0;
  const today = new Date();
  const greeting =
    today.getHours() < 5
      ? "Up late"
      : today.getHours() < 12
        ? "Good morning"
        : today.getHours() < 17
          ? "Afternoon"
          : "Evening";

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            {greeting}, {profile?.display_name ?? "friend"}.
          </p>
          <h1 className="font-display text-5xl">
            {streak.current > 0 ? (
              <>
                Day{" "}
                <span className="text-[var(--color-primary)]">
                  {streak.current}
                </span>{" "}
                of your streak.
              </>
            ) : (
              "Quiet day. Want to start a streak?"
            )}
          </h1>
        </div>
        <div className="text-right text-xs text-[var(--color-foreground-muted)]">
          <p>{formatDate(today)}</p>
          <p className="tabular-nums">
            {totalSolved.toLocaleString()} problems · {totalMinutes.toLocaleString()} min · last 365 days
          </p>
        </div>
      </header>

      {!hasAnyAccount && (
        <Card className="bg-[var(--color-primary-soft)] border-transparent">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                Connect your first platform to bring this dashboard to life.
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                Pull stats from LeetCode, Codeforces, GitHub, CodeChef, or AtCoder.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/platforms">
                Connect <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Current streak"
          value={streak.current}
          unit={streak.current === 1 ? "day" : "days"}
          icon={Flame}
          accent={streak.current > 0}
          hint={streak.lastActiveDay ? `Last solve · ${formatDate(streak.lastActiveDay)}` : "No solves yet"}
        />
        <StatCard
          label="Longest streak"
          value={streak.longest}
          unit="days"
          icon={Trophy}
        />
        <StatCard
          label="Solved · 7d"
          value={last7.reduce((s, d) => s + d.problems, 0)}
          icon={Code2}
          trend={{
            delta:
              last7.reduce((s, d) => s + d.problems, 0) -
              (rows
                .filter((r) => {
                  const d = new Date(r.day);
                  const start = new Date();
                  start.setDate(start.getDate() - 14);
                  const end = new Date();
                  end.setDate(end.getDate() - 7);
                  return d >= start && d < end;
                })
                .reduce((s, r) => s + r.problems_solved, 0)),
            window: "vs prev 7d",
          }}
        />
        <StatCard
          label="Time · 7d"
          value={Math.round(last7.reduce((s, d) => s + d.minutes, 0))}
          unit="min"
          icon={Timer}
        />
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Card>
          <CardHeader className="flex-row items-end justify-between">
            <div>
              <CardTitle>Last 7 days</CardTitle>
              <CardDescription>Problems solved per day, all platforms.</CardDescription>
            </div>
            <Badge variant="outline">Daily</Badge>
          </CardHeader>
          <CardContent>
            <ActivityChart data={last7} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where time went</CardTitle>
            <CardDescription>Last 365 days · across platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {platformBreakdown.map((row) => (
              <PlatformRow key={row.platform} row={row} totalMinutes={totalMinutes} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-end justify-between">
          <div>
            <CardTitle>The year so far</CardTitle>
            <CardDescription>
              Each square is a day. Hover for the count.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-muted">
            <Link href="/activity">
              See full view <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Heatmap cells={cells} />
        </CardContent>
      </Card>
    </div>
  );
}
