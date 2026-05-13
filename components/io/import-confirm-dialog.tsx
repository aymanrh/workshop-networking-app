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
import { replaceWithImport } from "@/lib/io/import";

type Props = {
  blob: Blob | null;
  currentCounts: { people: number; events: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
};

export function ImportConfirmDialog({
  blob,
  currentCounts,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  const handleReplace = async () => {
    if (!blob) return;
    setBusy(true);
    try {
      const next = await replaceWithImport(blob);
      toast.success(
        `Imported ${next.people} ${next.people === 1 ? "person" : "people"} · ${next.events} event${next.events === 1 ? "" : "s"}`,
      );
      onDone?.();
    } catch (err) {
      console.error("import failed", err);
      toast.error("Couldn't read that file.");
    } finally {
      setBusy(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace your data?</AlertDialogTitle>
          <AlertDialogDescription>
            This replaces your current data ({currentCounts.people} people ·{" "}
            {currentCounts.events} events) with the imported file. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReplace}
            disabled={busy || !blob}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {busy ? "Replacing…" : "Replace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
