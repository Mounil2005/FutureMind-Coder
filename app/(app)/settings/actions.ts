"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const display_name = String(formData.get("display_name") ?? "").trim();
  if (!display_name) throw new Error("Name cannot be empty");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw error;
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (next.length < 8) throw new Error("Password must be at least 8 characters");
  if (next !== confirm) throw new Error("Passwords do not match");

  // Re-auth with current password before updating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current,
  });
  if (signInError) throw new Error("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) throw error;
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Cascade deletes handle profiles, activity, etc. via FK
  await supabase.auth.admin.deleteUser(user.id);
}
