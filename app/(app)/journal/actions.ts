"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/supabase/types";

const PLATFORMS = ["leetcode", "codeforces", "github", "codechef", "atcoder"] as const;

function parsePlatform(v: FormDataEntryValue | null): Platform | null {
  if (typeof v !== "string") return null;
  return (PLATFORMS as readonly string[]).includes(v) ? (v as Platform) : null;
}

export async function createEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      title,
      problem_url: (String(formData.get("problem_url") ?? "").trim() || null) as string | null,
      platform: parsePlatform(formData.get("platform")),
      difficulty: (String(formData.get("difficulty") ?? "").trim() || null) as string | null,
      tags,
      body_md: String(formData.get("body_md") ?? ""),
      solved_at: formData.get("mark_solved") ? new Date().toISOString() : null,
      time_spent_seconds: 0,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/journal");
  redirect(`/journal/${data!.id}`);
}

export async function updateEntry(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const title = String(formData.get("title") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { error } = await supabase
    .from("journal_entries")
    .update({
      title,
      problem_url: (String(formData.get("problem_url") ?? "").trim() || null) as string | null,
      platform: parsePlatform(formData.get("platform")),
      difficulty: (String(formData.get("difficulty") ?? "").trim() || null) as string | null,
      tags,
      body_md: String(formData.get("body_md") ?? ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath(`/journal/${id}`);
  revalidatePath("/journal");
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/journal");
  redirect("/journal");
}
