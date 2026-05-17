"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Loader2, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/supabase/types";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "leetcode", label: "LeetCode" },
  { value: "codeforces", label: "Codeforces" },
  { value: "github", label: "GitHub" },
  { value: "codechef", label: "CodeChef" },
  { value: "atcoder", label: "AtCoder" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

interface Initial {
  title?: string;
  problem_url?: string | null;
  platform?: Platform | null;
  difficulty?: string | null;
  tags?: string[];
  body_md?: string;
}

interface Props {
  action: (formData: FormData) => Promise<unknown> | unknown;
  initial?: Initial;
  submitLabel: string;
}

export function JournalEditor({ action, initial, submitLabel }: Props) {
  const [body, setBody] = React.useState(initial?.body_md ?? "");
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          try {
            await action(fd);
          } catch (e: any) {
            toast.error(e?.message ?? "Could not save.");
          }
        });
      }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title}
          placeholder="e.g. Two Sum, but I overcomplicated it"
          required
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            name="platform"
            defaultValue={initial?.platform ?? ""}
            className="flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
          >
            <option value="">—</option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={initial?.difficulty ?? ""}
            className="flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
          >
            <option value="">—</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={initial?.tags?.join(", ")}
            placeholder="dp, trees, two-pointers"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem_url">Problem URL</Label>
        <Input
          id="problem_url"
          name="problem_url"
          type="url"
          defaultValue={initial?.problem_url ?? ""}
          placeholder="https://leetcode.com/problems/..."
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Notes (markdown)</Label>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1",
                tab === "write"
                  ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
                  : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              <FileText className="size-3" /> Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1",
                tab === "preview"
                  ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
                  : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              <Eye className="size-3" /> Preview
            </button>
          </div>
        </div>

        {tab === "write" ? (
          <textarea
            name="body_md"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder="What was the trick? Where did you get stuck? How would you explain it tomorrow?"
            className="flex min-h-[20rem] w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
          />
        ) : (
          <Card className="min-h-[20rem] p-4 prose prose-sm max-w-none">
            <input type="hidden" name="body_md" value={body} />
            {body.trim() ? (
              <Markdown body={body} />
            ) : (
              <p className="text-sm text-[var(--color-foreground-muted)] italic">
                Nothing to preview yet.
              </p>
            )}
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]">
          <input
            type="checkbox"
            name="mark_solved"
            value="1"
            className="size-4 rounded border-[var(--color-border-strong)] accent-[var(--color-primary)]"
          />
          Mark this as solved today
        </label>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Markdown({ body }: { body: string }) {
  return (
    <div className="text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-display [&_h1]:mb-3 [&_h2]:font-medium [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-1 [&_p]:my-2 [&_code]:bg-[var(--color-surface-2)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_pre]:bg-[var(--color-surface-2)] [&_pre]:p-3 [&_pre]:rounded-[var(--radius-md)] [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--color-primary)] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-border-strong)] [&_blockquote]:pl-3 [&_blockquote]:italic">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
