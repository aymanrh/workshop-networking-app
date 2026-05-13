"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteEvent } from "@/lib/db/repositories/events";
import type { AppEvent } from "@/lib/db/types";

type Props = {
  event: AppEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  onDeleted,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteEvent(event.id);
      toast.success(`Deleted ${event.name}`);
      onDeleted?.();
    } catch (err) {
      console.error("deleteEvent failed", err);
      toast.error("Couldn't delete — try again");
    } finally {
      setBusy(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {event.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Any person whose &ldquo;where you met&rdquo; was this event will
            lose that link. Attendees themselves are kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={busy}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
