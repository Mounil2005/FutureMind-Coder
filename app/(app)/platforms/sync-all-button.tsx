"use client";

import * as React from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { syncAllPlatforms } from "./actions";

export function SyncAllButton({ connectedCount }: { connectedCount: number }) {
  const [pending, startSync] = React.useTransition();

  if (connectedCount === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startSync(async () => {
          try {
            const { synced, failed } = await syncAllPlatforms();
            if (synced.length) toast.success(`Synced ${synced.length} platform${synced.length > 1 ? "s" : ""}.`);
            if (failed.length) toast.error(`${failed.length} platform${failed.length > 1 ? "s" : ""} failed.`);
          } catch (e: any) {
            toast.error(e?.message ?? "Sync failed.");
          }
        })
      }
    >
      <RefreshCw className={cn("size-3.5", pending && "animate-spin")} />
      {pending ? "Syncing…" : "Sync all"}
    </Button>
  );
}
