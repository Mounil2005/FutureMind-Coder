"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "@/lib/nav";

export function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-mono text-[11px] font-bold">
          ct
        </div>
        <span className="text-sm font-medium tracking-tight">CodeTracker</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-2">
        <SidebarSection label="Practice">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </SidebarSection>
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-[var(--color-border)] px-2 py-2">
        {secondaryNav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname.startsWith(item.href)}
          />
        ))}
        <div className="mt-2 flex items-center gap-2 px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-foreground-muted)]">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">{displayName}</p>
            <p className="truncate text-xs text-[var(--color-foreground-muted)]">
              Signed in
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-3 pt-3 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-foreground-muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  hint,
  active,
}: {
  href: string;
  label: string;
  icon: typeof primaryNav[number]["icon"];
  hint?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href as any}
      className={cn(
        "group flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
          : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-2)]/60 hover:text-[var(--color-foreground)]",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {hint && (
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {hint}
        </span>
      )}
    </Link>
  );
}
