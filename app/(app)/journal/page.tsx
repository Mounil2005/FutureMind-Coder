import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, title, platform, difficulty, tags, created_at, updated_at, solved_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  const list = entries ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Notes that future-you will thank present-you for.
          </p>
          <h1 className="font-display text-5xl">Journal</h1>
        </div>
        <Button asChild>
          <Link href="/journal/new">
            <Plus className="size-4" />
            New entry
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-[var(--color-border-strong)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
            <Search className="size-5 text-[var(--color-foreground-muted)]" />
          </div>
          <p className="mt-4 font-medium">Nothing here yet.</p>
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            The first entry is the hardest. Try jotting down a problem you
            solved today — even one line counts.
          </p>
          <Button asChild variant="soft" size="sm" className="mt-4">
            <Link href="/journal/new">Write your first entry</Link>
          </Button>
        </Card>
      ) : (
        <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)]">
          {list.map((e) => (
            <Link
              key={e.id}
              href={`/journal/${e.id}` as any}
              className="block px-5 py-4 hover:bg-[var(--color-surface-2)]/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <h3 className="font-medium truncate">{e.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
                    {e.platform && <span className="capitalize">{e.platform}</span>}
                    {e.difficulty && (
                      <>
                        <span>·</span>
                        <span>{e.difficulty}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{relativeTime(e.updated_at)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[40%]">
                  {e.solved_at && <Badge variant="success">solved</Badge>}
                  {e.tags?.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
