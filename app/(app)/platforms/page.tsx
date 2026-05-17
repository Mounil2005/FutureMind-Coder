import { PlatformCard } from "./platform-card";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/supabase/types";

export const metadata = { title: "Platforms" };

const PLATFORM_META: {
  platform: Platform;
  label: string;
  color: string;
}[] = [
  { platform: "leetcode",   label: "LeetCode",   color: "oklch(0.72 0.140 75)" },
  { platform: "codeforces", label: "Codeforces", color: "oklch(0.62 0.140 240)" },
  { platform: "github",     label: "GitHub",     color: "oklch(0.50 0.020 280)" },
  { platform: "codechef",   label: "CodeChef",   color: "oklch(0.55 0.110 30)" },
  { platform: "atcoder",    label: "AtCoder",    color: "oklch(0.46 0.060 240)" },
];

export default async function PlatformsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: accounts } = await supabase
    .from("platform_accounts")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Connect once, pull forever.
        </p>
        <h1 className="font-display text-5xl">Platforms</h1>
      </header>

      <p className="text-sm text-[var(--color-foreground-muted)]">
        Each sync pulls your latest stats and writes them into the activity
        calendar. Hit the refresh icon on a connected platform to sync now.
      </p>

      <div className="space-y-3">
        {PLATFORM_META.map(({ platform, label, color }) => {
          const account = accounts?.find((a) => a.platform === platform);
          return (
            <PlatformCard
              key={platform}
              platform={platform}
              label={label}
              color={color}
              connected={!!account}
              username={account?.username}
              lastSynced={account?.last_synced_at}
              metadata={(account?.metadata as Record<string, unknown>) ?? {}}
            />
          );
        })}
      </div>
    </div>
  );
}
