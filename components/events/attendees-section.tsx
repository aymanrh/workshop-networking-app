"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClosenessBadge } from "@/components/people/closeness-chip";
import { AttendeesPicker } from "./attendees-picker";
import { usePeopleByIds } from "@/hooks/use-people";
import { useAddPerson } from "@/components/people/add-person-context";
import { removeAttendee } from "@/lib/db/repositories/events";
import type { AppEvent, Person } from "@/lib/db/types";

function AttendeeRow({
  event,
  person,
}: {
  event: AppEvent;
  person: Person;
}) {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeAttendee(event.id, person.id);
      toast.success(`Removed ${person.name}`);
    } catch (err) {
      console.error("removeAttendee failed", err);
      toast.error("Couldn't remove — try again");
    }
  };

  return (
    <li className="relative">
      <Link
        href={`/people/${person.id}`}
        className="block rounded-lg border bg-card p-4 pr-12 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{person.name}</p>
            {(person.role || person.company) && (
              <p className="truncate text-[13px] text-muted-foreground">
                {[person.role, person.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <ClosenessBadge value={person.closeness} />
        </div>
        {person.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {person.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </Link>
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`Remove ${person.name} from this event`}
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

export function AttendeesSection({ event }: { event: AppEvent }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const attendees = usePeopleByIds(event.attendees);
  const { openWithEventId } = useAddPerson();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Attendees
        </h2>
        <Badge variant="outline" className="font-normal">
          {event.attendees.length}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="mr-1 size-4" />
          Existing person
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openWithEventId(event.id)}
        >
          <Plus className="mr-1 size-4" />
          New person
        </Button>
      </div>
      {attendees === undefined ? (
        <p className="text-sm text-muted-foreground italic">Loading…</p>
      ) : attendees.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No attendees yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {attendees.map((p) => (
            <AttendeeRow key={p.id} event={event} person={p} />
          ))}
        </ul>
      )}
      <AttendeesPicker
        event={event}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </div>
  );
}
