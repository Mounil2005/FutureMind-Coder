import type { PlatformStats } from "./index";

interface CFUser {
  handle: string;
  rating?: number;
  rank?: string;
  maxRating?: number;
}

interface CFSubmission {
  id: number;
  creationTimeSeconds: number;
  verdict: string;
  problem: { contestId?: number; index: string; name: string };
}

export async function fetchCodeforcesStats(username: string): Promise<PlatformStats> {
  const [userRes, statusRes, ratingRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${username}`, {
      next: { revalidate: 600 },
    }),
    fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`, {
      next: { revalidate: 600 },
    }),
    fetch(`https://codeforces.com/api/user.rating?handle=${username}`, {
      next: { revalidate: 600 },
    }),
  ]);

  const userJson = (await userRes.json()) as { status: string; result?: CFUser[]; comment?: string };
  if (userJson.status !== "OK" || !userJson.result?.[0]) {
    throw new Error(userJson.comment ?? "Codeforces user not found");
  }

  const user = userJson.result[0];
  const statusJson = (await statusRes.json()) as { status: string; result?: CFSubmission[] };
  const ratingJson = (await ratingRes.json()) as { status: string; result?: unknown[] };

  const accepted = (statusJson.result ?? []).filter((s) => s.verdict === "OK");
  const uniqueProblems = new Set(
    accepted.map((s) => `${s.problem.contestId ?? 0}-${s.problem.index}`),
  );

  const recentDaily = toRecentDaily(accepted);

  return {
    username,
    totalSolved: uniqueProblems.size,
    rating: user.rating ?? null,
    rank: user.rank ?? null,
    contestsAttended: ratingJson.result?.length ?? null,
    recentDaily,
    profileUrl: `https://codeforces.com/profile/${username}`,
  };
}

function toRecentDaily(accepted: CFSubmission[]) {
  const map = new Map<string, Set<string>>();
  for (const s of accepted) {
    const day = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    const key = `${s.problem.contestId ?? 0}-${s.problem.index}`;
    if (!map.has(day)) map.set(day, new Set());
    map.get(day)!.add(key);
  }

  const out: { day: string; solved: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    out.push({ day, solved: map.get(day)?.size ?? 0 });
  }
  return out;
}
