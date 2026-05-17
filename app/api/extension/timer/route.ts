import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/supabase/types";

const VALID_PLATFORMS = new Set<string>([
  "leetcode", "codeforces", "github", "codechef", "atcoder",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { platform, seconds, session_id, action } = body as {
    platform?: string;
    seconds?: number;
    session_id?: string;
    action?: "start" | "stop" | "ping";
  };

  if (!platform || !VALID_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  if (action === "start") {
    const { data } = await supabase.from("focus_sessions").insert({
      user_id: user.id,
      platform: platform as Platform,
      started_at: new Date().toISOString(),
      source: "extension",
    }).select("id").single();

    return NextResponse.json({ session_id: data?.id });
  }

  if (action === "stop" && session_id) {
    await supabase.from("focus_sessions").update({
      ended_at: new Date().toISOString(),
    }).eq("id", session_id).eq("user_id", user.id);
  }

  // Upsert seconds_spent in daily_activity
  if (typeof seconds === "number" && seconds > 0) {
    const { data: existing } = await supabase
      .from("daily_activity")
      .select("id, seconds_spent")
      .eq("user_id", user.id)
      .eq("day", today)
      .eq("platform", platform)
      .single();

    if (existing) {
      await supabase
        .from("daily_activity")
        .update({ seconds_spent: existing.seconds_spent + seconds })
        .eq("id", existing.id);
    } else {
      await supabase.from("daily_activity").insert({
        user_id: user.id,
        day: today,
        platform: platform as Platform,
        problems_solved: 0,
        seconds_spent: seconds,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

// Allow Chrome extension to pre-flight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
