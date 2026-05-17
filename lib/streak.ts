import type { DailyActivity } from "./supabase/types";

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDay: string | null;
}

/** Compute streak from daily activity rows (already filtered to a single user). */
export function computeStreak(rows: Pick<DailyActivity, "day" | "problems_solved">[]): StreakInfo {
  if (rows.length === 0) return { current: 0, longest: 0, lastActiveDay: null };

  const activeDays = Array.from(
    new Set(
      rows
        .filter((r) => r.problems_solved > 0)
        .map((r) => r.day),
    ),
  ).sort((a, b) => (a < b ? 1 : -1));

  if (activeDays.length === 0) return { current: 0, longest: 0, lastActiveDay: null };

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let current = 0;
  if (activeDays[0] === today || activeDays[0] === yesterday) {
    current = 1;
    for (let i = 1; i < activeDays.length; i++) {
      const prev = new Date(activeDays[i - 1]);
      const curr = new Date(activeDays[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
      if (diff === 1) current++;
      else break;
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < activeDays.length; i++) {
    const prev = new Date(activeDays[i - 1]);
    const curr = new Date(activeDays[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diff === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest, lastActiveDay: activeDays[0] };
}

/** Group days into a 53-column × 7-row matrix ending today. */
export function buildHeatmap(rows: Pick<DailyActivity, "day" | "problems_solved">[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.day, (map.get(r.day) ?? 0) + r.problems_solved);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 7 * 52 - today.getDay());

  const cells: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const date = cursor.toISOString().slice(0, 10);
    const count = map.get(date) ?? 0;
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    cells.push({ date, count, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}
