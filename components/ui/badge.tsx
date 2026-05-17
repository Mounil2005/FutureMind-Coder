import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-surface-2)] text-[var(--color-foreground)]",
        primary:
          "border-transparent bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
        outline:
          "border-[var(--color-border-strong)] text-[var(--color-foreground)]",
        success:
          "border-transparent text-[var(--color-success)] bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)]",
        warning:
          "border-transparent text-[var(--color-warning)] bg-[oklch(from_var(--color-warning)_l_c_h_/_0.12)]",
        danger:
          "border-transparent text-[var(--color-danger)] bg-[oklch(from_var(--color-danger)_l_c_h_/_0.12)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
