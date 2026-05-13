"use client";

import Link from "next/link";
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-chip";
import type { AppEvent } from "@/lib/db/types";

const MAX_TAGS = 3;

function dateLabel(date: number): string {
  if (isBefore(date, startOfDay(new Date()))) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  return format(new Date(date), "EEE, MMM d");
}

function attendeesLabel(count: number): string {
  if (count === 0) return "No attendees";
  return `${count} attendee${count === 1 ? "" : "s"}`;
}

function subtitle(event: AppEvent): string {
  return [event.location, attendeesLabel(event.attendees.length)]
    .filter(Boolean)
    .join(" · ");
}

export function EventCard({ event }: { event: AppEvent }) {
  const visibleTags = event.tags.slice(0, MAX_TAGS);
  const overflow = event.tags.length - visibleTags.length;
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{event.name}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {subtitle(event)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge value={event.status} />
          <span className="text-[13px] text-muted-foreground">
            {dateLabel(event.date)}
          </span>
        </div>
      </div>
      {event.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleTags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
          {overflow > 0 && (
            <Badge
              variant="secondary"
              className="font-normal text-muted-foreground"
            >
              +{overflow}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );
}
