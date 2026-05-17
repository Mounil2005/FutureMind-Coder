import { JournalEditor } from "@/components/journal/editor";
import { createEntry } from "../actions";

export const metadata = { title: "New entry" };

export default function NewJournalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-[var(--color-foreground-muted)]">
          A new note
        </p>
        <h1 className="font-display text-4xl">Capture it while it&rsquo;s fresh.</h1>
      </header>

      <JournalEditor action={createEntry} submitLabel="Save entry" />
    </div>
  );
}
