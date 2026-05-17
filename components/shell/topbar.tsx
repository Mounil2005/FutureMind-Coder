import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { Button } from "@/components/ui/button";

export function Topbar({
  subtitle,
  mobileSlot,
}: {
  subtitle?: string;
  mobileSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {mobileSlot}
        {subtitle && (
          <p className="text-sm text-[var(--color-foreground-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="text-muted">
          <Link href={"/journal/new" as any}>New entry</Link>
        </Button>
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
