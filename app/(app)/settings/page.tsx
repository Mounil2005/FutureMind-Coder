import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, handle, bio, timezone")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-10">
      <header className="space-y-2">
        <p className="text-sm text-[var(--color-foreground-muted)]">
          The small stuff that matters.
        </p>
        <h1 className="font-display text-5xl">Settings</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Profile</h2>
        <Separator />
        <ProfileForm
          defaultDisplayName={profile?.display_name ?? ""}
          email={user.email ?? ""}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Password</h2>
        <Separator />
        <PasswordForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-[var(--color-danger)]">
          Danger zone
        </h2>
        <Separator />
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Deleting your account removes all data permanently — activity, journal
          entries, goals, the lot. There is no undo.
        </p>
        <form action="/api/account/delete" method="POST">
          <button
            type="submit"
            className="text-sm text-[var(--color-danger)] underline underline-offset-4"
            onClick={(e) => {
              if (!confirm("Delete your account? This cannot be undone.")) {
                e.preventDefault();
              }
            }}
          >
            Delete my account
          </button>
        </form>
      </section>
    </div>
  );
}
