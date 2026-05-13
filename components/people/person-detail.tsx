"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClosenessChip } from "./closeness-chip";
import { PersonForm } from "./person-form";
import { DeletePersonDialog } from "./delete-person-dialog";
import { useEvent } from "@/hooks/use-events";
import { updatePerson } from "@/lib/db/repositories/people";
import type { Closeness, Person } from "@/lib/db/types";
import type { PersonFormValues } from "@/lib/validators/person";

function subtitle(person: Person): string {
  return [person.role, person.company].filter(Boolean).join(" · ");
}

function EventMetChip({ eventId }: { eventId: string }) {
  const event = useEvent(eventId);
  if (!event) return null;
  return (
    <Link href={`/events/${event.id}`}>
      <Badge variant="outline" className="font-normal">
        Met at {event.name}
      </Badge>
    </Link>
  );
}

export function PersonDetail({ person }: { person: Person }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleCloseness = async (next: Closeness) => {
    try {
      await updatePerson(person.id, { closeness: next });
      toast.success("Saved");
    } catch (err) {
      console.error("updatePerson failed", err);
      toast.error("Couldn't save — try again");
    }
  };

  const handleSave = async (values: PersonFormValues) => {
    try {
      await updatePerson(person.id, {
        name: values.name,
        role: values.role || undefined,
        company: values.company || undefined,
        notes: values.note || undefined,
        tags: values.tags,
        eventMetId: values.eventMetId,
      });
      toast.success("Saved");
      setEditing(false);
    } catch (err) {
      console.error("updatePerson failed", err);
      toast.error("Couldn't save — try again");
    }
  };

  const defaultFormValues: Partial<PersonFormValues> = {
    name: person.name,
    role: person.role ?? "",
    company: person.company ?? "",
    note: person.notes ?? "",
    tags: person.tags,
    eventMetId: person.eventMetId,
    closeness: person.closeness,
  };

  return (
    <section className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <Link
          href="/people"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          People
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
                aria-label="Person actions"
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
                Delete person
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{person.name}</h1>
        {subtitle(person) && (
          <p className="text-[13px] text-muted-foreground">
            {subtitle(person)}
          </p>
        )}
      </div>

      <ClosenessChip
        value={person.closeness}
        onChange={handleCloseness}
      />

      <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
        {person.lastContactAt && (
          <span>
            Last seen{" "}
            {formatDistanceToNow(new Date(person.lastContactAt), {
              addSuffix: true,
            })}
          </span>
        )}
        {person.eventMetId && <EventMetChip eventId={person.eventMetId} />}
      </div>

      {editing ? (
        <PersonForm
          mode="edit"
          defaultValues={defaultFormValues}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-muted-foreground">
              Tags
            </p>
            {person.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tags.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {person.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-muted-foreground">
              Notes
            </p>
            {person.notes ? (
              <p className="whitespace-pre-wrap text-sm">{person.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No notes yet.
              </p>
            )}
          </div>
        </div>
      )}

      <DeletePersonDialog
        person={person}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/people")}
      />
    </section>
  );
}
