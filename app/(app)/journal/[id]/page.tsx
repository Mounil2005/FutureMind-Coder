import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { JournalEditor } from "@/components/journal/editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Platform } from "@/lib/supabase/types";
import { updateEntry, deleteEntry } from "../actions";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  const updateAction = updateEntry.bind(null, entry.id);
  const deleteAction = deleteEntry.bind(null, entry.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
          <Link href="/journal" className="hover:text-[var(--color-foreground)]">
            Journal
          </Link>
          <span>/</span>
          <span>{formatDate(entry.created_at)}</span>
          {entry.solved_at && <Badge variant="success">solved</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {entry.problem_url && (
            <Button asChild variant="ghost" size="sm">
              <a href={entry.problem_url} target="_blank" rel="noopener">
                Problem <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          <form action={deleteAction}>
            <Button variant="ghost" size="sm" className="text-[var(--color-danger)]">
              Delete
            </Button>
          </form>
        </div>
      </header>

      <JournalEditor
        action={updateAction}
        submitLabel="Save changes"
        initial={{
          title: entry.title,
          problem_url: entry.problem_url,
          platform: entry.platform as Platform | null,
          difficulty: entry.difficulty,
          tags: entry.tags ?? [],
          body_md: entry.body_md ?? "",
        }}
      />
    </div>
  );
}
