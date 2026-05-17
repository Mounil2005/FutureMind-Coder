import type { PlatformStats } from "./index";

const RATING_COLORS: Record<string, string> = {
  "3600+": "Red",
  "3200-3600": "Red",
  "2800-3200": "Orange",
  "2400-2800": "Yellow",
  "2000-2400": "Blue",
  "1600-2000": "Cyan",
  "1200-1600": "Green",
  "800-1200": "Brown",
  "400-800": "Gray",
  "0-400": "Gray",
};

function ratingToRank(rating: number): string {
  if (rating >= 2800) return "Red";
  if (rating >= 2400) return "Orange";
  if (rating >= 2000) return "Yellow";
  if (rating >= 1600) return "Blue";
  if (rating >= 1200) return "Cyan";
  if (rating >= 800) return "Green";
  if (rating >= 400) return "Brown";
  return "Gray";
}

interface AtCoderUser {
  UserName: string;
  Rating: number;
  HighestRating: number;
  CompetitionCount: number;
  Affiliation?: string;
}

interface AtCoderSubmission {
  id: number;
  epoch_second: number;
  problem_id: string;
  result: string;
}

export async function fetchAtCoderStats(username: string): Promise<PlatformStats> {
  const [userRes, submissionsRes] = await Promise.all([
    fetch(`https://atcoder.jp/users/${username}/history/json`, {
      next: { revalidate: 600 },
    }),
    fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/accepted_count?user=${username}`, {
      next: { revalidate: 600 },
    }),
  ]);

  const history = userRes.ok ? ((await userRes.json()) as { NewRating?: number; Place?: number; ContestScreenName?: string }[]) : [];

  const acData = submissionsRes.ok
    ? ((await submissionsRes.json()) as { count: number; user_id: string } | null)
    : null;

  const latestRating = history.length > 0 ? history[history.length - 1].NewRating ?? 0 : 0;
  const maxRating = history.reduce((m, h) => Math.max(m, h.NewRating ?? 0), 0);

  return {
    username,
    totalSolved: acData?.count ?? null,
    rating: latestRating || null,
    rank: latestRating ? ratingToRank(latestRating) : null,
    contestsAttended: history.length || null,
    recentDaily: [],
    profileUrl: `https://atcoder.jp/users/${username}`,
    raw: { maxRating },
  };
}
