import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl">Start a streak.</h1>
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Free to use. We&rsquo;ll never email you about &ldquo;exciting features.&rdquo;
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-[var(--color-foreground-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-foreground)] underline underline-offset-4 decoration-[var(--color-border-strong)] hover:decoration-[var(--color-primary)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
