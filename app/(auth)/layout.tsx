import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-surface-2)] p-10 lg:flex grain">
        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-mono text-[11px] font-bold">
            ct
          </div>
          <span className="text-sm font-medium tracking-tight">CodeTracker</span>
        </Link>

        <div className="relative z-10 max-w-md space-y-4">
          <p className="font-display text-4xl leading-tight">
            &ldquo;The graph went green.&rdquo;
          </p>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            A patient log of every problem you've cracked, every contest you've
            survived, and the slow climb of your rating curve.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-[var(--color-foreground-muted)]">
          <span>LeetCode</span>
          <span>·</span>
          <span>Codeforces</span>
          <span>·</span>
          <span>GitHub</span>
          <span>·</span>
          <span>CodeChef</span>
          <span>·</span>
          <span>AtCoder</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
