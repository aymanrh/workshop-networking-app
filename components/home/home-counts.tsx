"use client";

import { usePeopleCount } from "@/hooks/use-people";
import { useEventsCount } from "@/hooks/use-events";

export function HomeCounts() {
  const people = usePeopleCount();
  const events = useEventsCount();
  if (people === undefined || events === undefined) return null;
  return (
    <p className="text-sm text-muted-foreground">
      {people} {people === 1 ? "person" : "people"} · {events}{" "}
      {events === 1 ? "event" : "events"}
    </p>
  );
}
