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
import { deletePerson } from "@/lib/db/repositories/people";
import type { Person } from "@/lib/db/types";

type Props = {
  person: Person;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeletePersonDialog({
  person,
  open,
  onOpenChange,
  onDeleted,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deletePerson(person.id);
      toast.success(`Deleted ${person.name}`);
      onDeleted?.();
    } catch (err) {
      console.error("deletePerson failed", err);
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
          <AlertDialogTitle>Delete {person.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes them and any touchpoints linked to them. This
            can&apos;t be undone.
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
