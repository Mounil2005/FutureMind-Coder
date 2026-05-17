"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "./actions";

export function ProfileForm({
  defaultDisplayName,
  email,
}: {
  defaultDisplayName: string;
  email: string;
}) {
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          try {
            await updateProfile(fd);
            toast.success("Profile updated.");
          } catch (e: any) {
            toast.error(e?.message ?? "Could not save.");
          }
        })
      }
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={defaultDisplayName}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email_ro">Email</Label>
        <Input id="email_ro" value={email} disabled readOnly />
        <p className="text-xs text-[var(--color-foreground-muted)]">
          Email changes are handled through Supabase Auth — contact support.
        </p>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
