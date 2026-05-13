"use client";

import { Badge } from "@/components/ui/badge";
import { useUpcomingEvents, usePastEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/events/event-card";
import { EventsEmptyState } from "@/components/events/events-empty-state";
import { EventsListSkeleton } from "@/components/events/events-list-skeleton";
import type { AppEvent } from "@/lib/db/types";

function EventsSection({
  heading,
  events,
}: {
  heading: string;
  events: AppEvent[];
}) {
  if (events.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {heading}
        </h2>
        <Badge variant="outline" className="font-normal">
          {events.length}
        </Badge>
      </div>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id}>
            <EventCard event={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EventsPage() {
  const upcoming = useUpcomingEvents();
  const past = usePastEvents();
  const loading = upcoming === undefined || past === undefined;
  const totalEmpty =
    !loading && upcoming!.length === 0 && past!.length === 0;
  return (
    <section className="space-y-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
      {loading && <EventsListSkeleton />}
      {!loading && totalEmpty && <EventsEmptyState />}
      {!loading && !totalEmpty && (
        <>
          <EventsSection heading="Upcoming" events={upcoming!} />
          <EventsSection heading="Past" events={past!} />
        </>
      )}
    </section>
  );
}
