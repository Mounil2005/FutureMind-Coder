import type { Platform } from "@/lib/supabase/types";
import { fetchLeetCodeStats } from "./leetcode";
import { fetchCodeforcesStats } from "./codeforces";
import { fetchGitHubStats } from "./github";
import { fetchCodeChefStats } from "./codechef";
import { fetchAtCoderStats } from "./atcoder";

export interface PlatformStats {
  username: string;
  totalSolved: number | null;
  rating: number | null;
  rank: string | null;
  contestsAttended: number | null;
  /** problems-per-day for the last ~30 days where available */
  recentDaily: { day: string; solved: number }[];
  profileUrl: string;
  raw?: Record<string, unknown>;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  github: "GitHub",
  codechef: "CodeChef",
  atcoder: "AtCoder",
};

export const PLATFORM_HINTS: Record<Platform, string> = {
  leetcode: "Your LeetCode handle (e.g. neetcode)",
  codeforces: "Your Codeforces handle (e.g. tourist)",
  github: "Your GitHub username",
  codechef: "Your CodeChef username",
  atcoder: "Your AtCoder username",
};

export async function fetchStats(
  platform: Platform,
  username: string,
): Promise<PlatformStats> {
  switch (platform) {
    case "leetcode":
      return fetchLeetCodeStats(username);
    case "codeforces":
      return fetchCodeforcesStats(username);
    case "github":
      return fetchGitHubStats(username);
    case "codechef":
      return fetchCodeChefStats(username);
    case "atcoder":
      return fetchAtCoderStats(username);
  }
}
