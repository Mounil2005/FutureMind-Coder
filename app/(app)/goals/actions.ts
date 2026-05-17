"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalKind } from "@/lib/supabase/types";

export async function saveGoal(
  kind: GoalKind,
  target: number,
  active: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("goals").upsert(
    { user_id: user.id, kind, target, active },
    { onConflict: "user_id,kind" },
  );

  if (error) throw error;
  revalidatePath("/goals");
}
