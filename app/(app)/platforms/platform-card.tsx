"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Unlink, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, relativeTime } from "@/lib/utils";
import type { Platform } from "@/lib/supabase/types";
import { connectPlatform, disconnectPlatform, syncPlatform } from "./actions";

interface Props {
  platform: Platform;
  label: string;
  color: string;
  connected: boolean;
  username?: string | null;
  lastSynced?: string | null;
  metadata?: Record<string, unknown>;
}

export function PlatformCard({
  platform,
  label,
  color,
  connected,
  username,
  lastSynced,
  metadata,
}: Props) {
  const [connecting, startConnect] = React.useTransition();
  const [syncing, startSync] = React.useTransition();
  const [disconnecting, startDisconnect] = React.useTransition();
  const [showForm, setShowForm] = React.useState(!connected);

  const profileUrl = (metadata?.profileUrl as string) ?? null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium">{label}</span>
          {connected ? (
            <Badge variant="success">connected</Badge>
          ) : (
            <Badge variant="outline">not connected</Badge>
          )}
        </div>

        {connected && (
          <div className="flex items-center gap-1">
            {profileUrl && (
              <Button asChild variant="ghost" size="icon">
                <a href={profileUrl} target="_blank" rel="noopener">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              disabled={syncing}
              onClick={() =>
                startSync(async () => {
                  try {
                    await syncPlatform(platform);
                    toast.success(`${label} synced.`);
                  } catch (e: any) {
                    toast.error(e?.message ?? "Sync failed.");
                  }
                })
              }
            >
              <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={disconnecting}
              className="text-[var(--color-danger)]"
              onClick={() =>
                startDisconnect(async () => {
                  try {
                    await disconnectPlatform(platform);
                    toast.success(`${label} disconnected.`);
                    setShowForm(true);
                  } catch (e: any) {
                    toast.error(e?.message ?? "Failed.");
                  }
                })
              }
            >
              {disconnecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unlink className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {connected && !showForm && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {metadata?.totalSolved != null && (
            <Metric label="Solved" value={String(metadata.totalSolved)} />
          )}
          {metadata?.rating != null && (
            <Metric label="Rating" value={String(metadata.rating)} />
          )}
          {metadata?.rank && (
            <Metric label="Rank" value={String(metadata.rank)} />
          )}
          {metadata?.contestsAttended != null && (
            <Metric label="Contests" value={String(metadata.contestsAttended)} />
          )}
          <Metric
            label="Username"
            value={`@${username}`}
          />
          {lastSynced && (
            <Metric label="Last synced" value={relativeTime(lastSynced)} />
          )}
        </div>
      )}

      {(!connected || showForm) && (
        <form
          action={(fd) => {
            fd.append("platform", platform);
            startConnect(async () => {
              try {
                await connectPlatform(fd);
                toast.success(`${label} connected.`);
                setShowForm(false);
              } catch (e: any) {
                toast.error(e?.message ?? "Could not connect.");
              }
            });
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`u-${platform}`}>Username</Label>
            <Input
              id={`u-${platform}`}
              name="username"
              defaultValue={username ?? ""}
              placeholder={`Your ${label} username`}
            />
          </div>
          <Button type="submit" size="sm" disabled={connecting}>
            {connecting && <Loader2 className="size-3.5 animate-spin" />}
            {connected ? "Update" : "Connect"}
          </Button>
          {connected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          )}
        </form>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-foreground-muted)]">
        {label}
      </p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
