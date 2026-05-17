import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-1 text-sm",
        "border-[var(--color-border-strong)] text-[var(--color-foreground)]",
        "placeholder:text-[var(--color-foreground-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:border-[var(--color-primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
