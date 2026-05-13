"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddEvent } from "./add-event-context";

export function EventsEmptyState() {
  const { open } = useAddEvent();
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">No events yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add the first event you&apos;ll attend — or one you just left.
      </p>
      <Button className="mt-4" onClick={open}>
        <Plus className="mr-1 size-4" />
        Add event
      </Button>
    </div>
  );
}
