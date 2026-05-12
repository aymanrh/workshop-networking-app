"use client";

import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  return (
    <section className="space-y-2 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Event <span className="font-mono text-base text-muted-foreground">{id}</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Detail view coming in Phase 3.
      </p>
    </section>
  );
}
