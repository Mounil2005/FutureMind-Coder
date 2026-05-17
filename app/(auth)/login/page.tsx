import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl">Welcome back.</h1>
        <p className="text-sm text-[var(--color-foreground-muted)]">
          Pick up where you left off — your streak is waiting.
        </p>
      </div>

      <LoginForm />

      <p className="text-sm text-[var(--color-foreground-muted)]">
        New around here?{" "}
        <Link
          href="/signup"
          className="text-[var(--color-foreground)] underline underline-offset-4 decoration-[var(--color-border-strong)] hover:decoration-[var(--color-primary)]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
