"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { usePeople } from "@/hooks/use-people";
import { addAttendee } from "@/lib/db/repositories/events";
import { cn } from "@/lib/utils";
import type { AppEvent, Person } from "@/lib/db/types";

type Props = {
  event: AppEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AttendeesPicker({ event, open, onOpenChange }: Props) {
  const people = usePeople();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) setSelected(new Set());
  }, [open]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const already = React.useMemo(
    () => new Set(event.attendees),
    [event.attendees],
  );

  const eligible = people?.filter((p) => !already.has(p.id)) ?? [];
  const count = selected.size;

  const handleDone = async () => {
    if (count === 0) return;
    setBusy(true);
    try {
      for (const id of selected) {
        await addAttendee(event.id, id);
      }
      toast.success(`Added ${count} attendee${count === 1 ? "" : "s"}`);
      onOpenChange(false);
    } catch (err) {
      console.error("addAttendee failed", err);
      toast.error("Couldn't add — try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add attendees</DialogTitle>
          <DialogDescription>
            Pick from your people. Already-attending people are hidden.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-md border">
          <CommandInput
            placeholder="Search by name, role, or tag"
            autoFocus
          />
          <CommandList className="max-h-64">
            <CommandEmpty>
              No matching people — try a shorter query
            </CommandEmpty>
            <CommandGroup>
              {eligible.map((person: Person) => {
                const checked = selected.has(person.id);
                return (
                  <CommandItem
                    key={person.id}
                    value={[person.name, person.role, person.company, ...person.tags]
                      .filter(Boolean)
                      .join(" ")}
                    onSelect={() => toggle(person.id)}
                  >
                    <span
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border",
                        checked
                          ? "bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">{person.name}</span>
                      {(person.role || person.company) && (
                        <span className="truncate text-[12px] text-muted-foreground">
                          {[person.role, person.company]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button onClick={handleDone} disabled={count === 0 || busy}>
            {busy ? "Adding…" : `Done${count > 0 ? ` (${count})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
