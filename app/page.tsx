import Link from "next/link";
import { ArrowRight, CalendarRange, Target, NotebookPen, Boxes, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-mono text-[11px] font-bold">
            ct
          </div>
          <span className="text-sm font-medium tracking-tight">CodeTracker</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-foreground-muted)]">
            <span className="size-1.5 rounded-full bg-[var(--color-success)]" />
            Free · No tracking · No upsell
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
            Practice,<br />
            <span className="text-[var(--color-primary)]">measured.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[var(--color-foreground-muted)] leading-relaxed">
            A quiet companion for your competitive programming routine.
            Pull stats from five platforms, build streaks, and keep notes —
            all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Start tracking <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3"
              >
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)]">
                  <f.icon className="size-4 text-[var(--color-primary)]" strokeWidth={1.75} />
                </div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-sm text-[var(--color-foreground-muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Platforms */}
        <section className="border-t border-[var(--color-border)] py-12">
          <p className="text-center text-xs uppercase tracking-[0.15em] text-[var(--color-foreground-muted)]">
            pulls from
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[var(--color-foreground-muted)]">
            {["LeetCode", "Codeforces", "GitHub", "CodeChef", "AtCoder"].map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-2xl px-6 py-24 text-center space-y-5">
          <h2 className="font-display text-5xl">The graph won&rsquo;t fill itself.</h2>
          <p className="text-[var(--color-foreground-muted)]">
            Set up takes about two minutes. No credit card.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              Create your account <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] px-6 py-6 text-center text-xs text-[var(--color-foreground-muted)]">
        Built by Team FutureMind-Coder · 2026
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: CalendarRange,
    title: "Activity heatmap",
    desc: "A full year of daily solves, visualised across every connected platform in one calendar.",
  },
  {
    icon: Flame,
    title: "Streaks & goals",
    desc: "Daily and weekly targets you set yourself. One missed day breaks the chain — that's the point.",
  },
  {
    icon: NotebookPen,
    title: "Problem journal",
    desc: "Markdown notes per problem. Tag by topic, mark as solved, revisit when patterns come up again.",
  },
  {
    icon: Boxes,
    title: "Five platforms",
    desc: "LeetCode, Codeforces, GitHub, CodeChef, and AtCoder — connect once, sync any time.",
  },
  {
    icon: Target,
    title: "Extension timer",
    desc: "A Chrome extension that tracks time spent on coding sites and syncs sessions back to your dashboard.",
  },
  {
    icon: CalendarRange,
    title: "Your data, simply stored",
    desc: "Backed by Supabase. Nothing is sold, shared, or used to send you newsletters.",
  },
];
