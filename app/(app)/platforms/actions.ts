"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchStats } from "@/lib/platforms/index";
import type { Platform } from "@/lib/supabase/types";

const VALID_PLATFORMS = new Set<string>([
  "leetcode", "codeforces", "github", "codechef", "atcoder",
]);

export async function connectPlatform(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const platform = String(formData.get("platform") ?? "") as Platform;
  const username = String(formData.get("username") ?? "").trim();

  if (!VALID_PLATFORMS.has(platform)) throw new Error("Unknown platform");
  if (!username) throw new Error("Username is required");

  // Verify account exists before saving
  await fetchStats(platform, username);

  const { error } = await supabase.from("platform_accounts").upsert(
    { user_id: user.id, platform, username },
    { onConflict: "user_id,platform" },
  );
  if (error) throw error;

  revalidatePath("/platforms");
  revalidatePath("/dashboard");
}

export async function disconnectPlatform(platform: Platform) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await supabase
    .from("platform_accounts")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", platform);

  revalidatePath("/platforms");
  revalidatePath("/dashboard");
}

export async function syncPlatform(platform: Platform) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: account } = await supabase
    .from("platform_accounts")
    .select("username")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .single();

  if (!account) throw new Error("Platform not connected");

  const stats = await fetchStats(platform, account.username);

  // Upsert today's activity
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("daily_activity").upsert(
    {
      user_id: user.id,
      day: today,
      platform,
      problems_solved: stats.recentDaily.find((d) => d.day === today)?.solved ?? 0,
      submissions: 0,
      seconds_spent: 0,
      rating_change: 0,
    },
    { onConflict: "user_id,day,platform" },
  );

  // Upsert historical data from recentDaily
  for (const d of stats.recentDaily) {
    if (d.solved === 0) continue;
    await supabase.from("daily_activity").upsert(
      {
        user_id: user.id,
        day: d.day,
        platform,
        problems_solved: d.solved,
        submissions: 0,
        seconds_spent: 0,
        rating_change: 0,
      },
      { onConflict: "user_id,day,platform" },
    );
  }

  // Update metadata + last_synced_at
  await supabase.from("platform_accounts").update({
    last_synced_at: new Date().toISOString(),
    metadata: {
      totalSolved: stats.totalSolved,
      rating: stats.rating,
      rank: stats.rank,
      contestsAttended: stats.contestsAttended,
      profileUrl: stats.profileUrl,
    },
  })
  .eq("user_id", user.id)
  .eq("platform", platform);

  revalidatePath("/platforms");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
}
