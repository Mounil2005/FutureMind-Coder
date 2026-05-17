import type { PlatformStats } from "./index";

const ENDPOINT = "https://leetcode.com/graphql";

const QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking }
      submitStats { acSubmissionNum { difficulty count } }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
    }
  }
`;

const CALENDAR_QUERY = `
  query userCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) { submissionCalendar }
    }
  }
`;

export async function fetchLeetCodeStats(username: string): Promise<PlatformStats> {
  const profile = await gql<{
    matchedUser: {
      username: string;
      profile: { ranking: number };
      submitStats: { acSubmissionNum: { difficulty: string; count: number }[] };
    } | null;
    userContestRanking: { attendedContestsCount: number; rating: number } | null;
  }>(QUERY, { username });

  if (!profile.matchedUser) {
    throw new Error("LeetCode user not found");
  }

  const totalSolved =
    profile.matchedUser.submitStats.acSubmissionNum.find((s) => s.difficulty === "All")?.count ?? null;

  const calendar = await gql<{
    matchedUser: { userCalendar: { submissionCalendar: string } } | null;
  }>(CALENDAR_QUERY, { username, year: new Date().getFullYear() });

  const submissions = calendar.matchedUser
    ? (JSON.parse(calendar.matchedUser.userCalendar.submissionCalendar) as Record<string, number>)
    : {};

  const recentDaily = toRecentDaily(submissions);

  return {
    username,
    totalSolved,
    rating: profile.userContestRanking?.rating
      ? Math.round(profile.userContestRanking.rating)
      : null,
    rank: profile.matchedUser.profile.ranking
      ? `#${profile.matchedUser.profile.ranking.toLocaleString()}`
      : null,
    contestsAttended: profile.userContestRanking?.attendedContestsCount ?? null,
    recentDaily,
    profileUrl: `https://leetcode.com/${username}`,
  };
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`LeetCode request failed: ${res.status}`);
  }

  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

function toRecentDaily(submissions: Record<string, number>) {
  const out: { day: string; solved: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ts = Math.floor(d.getTime() / 1000);
    out.push({
      day: d.toISOString().slice(0, 10),
      solved: submissions[String(ts)] ?? 0,
    });
  }
  return out;
}
