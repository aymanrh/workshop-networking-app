"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusChip } from "./status-chip";
import { EventForm } from "./event-form";
import { AttendeesSection } from "./attendees-section";
import { DeleteEventDialog } from "./delete-event-dialog";
import { updateEvent } from "@/lib/db/repositories/events";
import type { AppEvent, EventStatus } from "@/lib/db/types";
import type { EventFormValues } from "@/lib/validators/event";

function dateLabel(date: number): string {
  if (isBefore(date, startOfDay(new Date()))) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  return format(new Date(date), "EEE, MMM d");
}

function toDateInputValue(ms: number): string {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function EventDetail({ event }: { event: AppEvent }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleStatus = async (next: EventStatus) => {
    try {
      await updateEvent(event.id, { status: next });
      toast.success("Saved");
    } catch (err) {
      console.error("updateEvent failed", err);
      toast.error("Couldn't save — try again");
    }
  };

  const handleSave = async (values: EventFormValues) => {
    try {
      await updateEvent(event.id, {
        name: values.name,
        date: new Date(values.date).getTime(),
        location: values.location || undefined,
        tags: values.tags,
      });
      toast.success("Saved");
      setEditing(false);
    } catch (err) {
      console.error("updateEvent failed", err);
      toast.error("Couldn't save — try again");
    }
  };

  const defaultFormValues: Partial<EventFormValues> = {
    name: event.name,
    date: toDateInputValue(event.date),
    location: event.location ?? "",
    tags: event.tags,
    status: event.status,
  };

  return (
    <section className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Events
        </Link>
        <div className="flex items-center gap-1">
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-1 size-4" />
              Edit
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Event actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{event.name}</h1>
        {event.location && (
          <p className="text-[13px] text-muted-foreground">{event.location}</p>
        )}
      </div>

      <StatusChip value={event.status} onChange={handleStatus} />

      <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
        <span>{dateLabel(event.date)}</span>
      </div>

      {editing ? (
        <EventForm
          mode="edit"
          defaultValues={defaultFormValues}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        event.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-muted-foreground">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )
      )}

      <AttendeesSection event={event} />

      <DeleteEventDialog
        event={event}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/events")}
      />
    </section>
  );
}
