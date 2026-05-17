"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "@/lib/nav";

export function MobileNav({ displayName }: { displayName: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  React.useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger — only visible on mobile */}
      <button
        className="md:hidden flex items-center justify-center size-8 rounded-md text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Slide-in drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-200 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-modal="true"
        role="dialog"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-mono text-[11px] font-bold">
              ct
            </div>
            <span className="text-sm font-medium tracking-tight">CodeTracker</span>
          </div>
          <button
            className="flex items-center justify-center size-7 rounded-md text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-2 py-2 flex-1 overflow-y-auto">
          <p className="px-3 pt-3 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-foreground-muted)]">
            Practice
          </p>
          {primaryNav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
                    : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-foreground)]",
                )}
              >
                <item.icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: secondary nav + user */}
        <div className="flex flex-col gap-0.5 border-t border-[var(--color-border)] px-2 py-2">
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
                  : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-foreground)]",
              )}
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 px-3 py-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-foreground-muted)]">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm">{displayName}</p>
              <p className="truncate text-xs text-[var(--color-foreground-muted)]">Signed in</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
