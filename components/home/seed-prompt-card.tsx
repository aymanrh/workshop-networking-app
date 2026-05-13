"use client";

import * as React from "react";
import { toast } from "sonner";
import { Database, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSeed, dismissSeed } from "@/lib/seed/load-seed";

export function SeedPromptCard() {
  const [busy, setBusy] = React.useState(false);

  const handleLoad = async () => {
    setBusy(true);
    try {
      const { people, events } = await loadSeed();
      toast.success(
        `Loaded sample data (${people} people · ${events} events)`,
      );
    } catch (err) {
      console.error("loadSeed failed", err);
      toast.error("Couldn't load sample data — try again");
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissSeed();
    } catch (err) {
      console.error("dismissSeed failed", err);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 size-5 text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-semibold">Try with sample data</h2>
          <p className="text-sm text-muted-foreground">
            Load 8 sample people and 4 events so you can explore. You can
            clear it anytime.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleLoad} disabled={busy}>
              {busy ? "Loading…" : "Load sample data"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              disabled={busy}
            >
              <X className="mr-1 size-4" />
              Start empty
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
