"use client";

import { useFirstRunState } from "@/hooks/use-first-run-state";
import { SeedPromptCard } from "@/components/home/seed-prompt-card";
import { HomeCounts } from "@/components/home/home-counts";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const state = useFirstRunState();
  return (
    <section className="space-y-4 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      {state === "loading" && <Skeleton className="h-32 w-full rounded-lg" />}
      {state === "prompt" && <SeedPromptCard />}
      {state === "empty-after-dismiss" && (
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing here yet. Add someone from the People tab or tap the +
            below.
          </p>
        </div>
      )}
      {state === "data" && <HomeCounts />}
    </section>
  );
}
