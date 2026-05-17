import type { PlatformStats } from "./index";

const GH_GRAPHQL = "https://api.github.com/graphql";

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      login
      contributionsCollection {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubStats(username: string): Promise<PlatformStats> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return await fetchUnauthenticated(username);
  }

  const res = await fetch(GH_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const json = (await res.json()) as {
    data: {
      user: {
        login: string;
        contributionsCollection: {
          totalCommitContributions: number;
          contributionCalendar: {
            weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
          };
        };
      } | null;
    };
    errors?: { message: string }[];
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data.user) throw new Error("GitHub user not found");

  const days = json.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (w) => w.contributionDays,
  );

  const recentDaily = days.slice(-30).map((d) => ({
    day: d.date,
    solved: d.contributionCount,
  }));

  return {
    username,
    totalSolved: json.data.user.contributionsCollection.totalCommitContributions,
    rating: null,
    rank: null,
    contestsAttended: null,
    recentDaily,
    profileUrl: `https://github.com/${username}`,
  };
}

async function fetchUnauthenticated(username: string): Promise<PlatformStats> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error("GitHub user not found");
  const u = (await res.json()) as { login: string; public_repos: number; followers: number };

  return {
    username,
    totalSolved: u.public_repos,
    rating: null,
    rank: null,
    contestsAttended: null,
    recentDaily: [],
    profileUrl: `https://github.com/${u.login}`,
    raw: { followers: u.followers, note: "Set GITHUB_TOKEN for full stats" },
  };
}
