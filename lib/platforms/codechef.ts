import type { PlatformStats } from "./index";

// CodeChef does not have a public REST API.
// We use the unofficial endpoint used by third-party sites.
export async function fetchCodeChefStats(username: string): Promise<PlatformStats> {
  const res = await fetch(`https://codechef-api.vercel.app/handle/${username}`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`CodeChef user not found (${res.status})`);
  }

  const data = (await res.json()) as {
    success?: boolean;
    name?: string;
    currentRating?: number;
    highestRating?: number;
    stars?: string;
    countryRank?: number;
    globalRank?: number;
    fullySolved?: { count?: number };
  };

  if (data.success === false) {
    throw new Error("CodeChef user not found");
  }

  return {
    username,
    totalSolved: data.fullySolved?.count ?? null,
    rating: data.currentRating ?? null,
    rank: data.stars ? `${data.stars} star` : null,
    contestsAttended: null,
    recentDaily: [],
    profileUrl: `https://www.codechef.com/users/${username}`,
    raw: { globalRank: data.globalRank, highestRating: data.highestRating },
  };
}
