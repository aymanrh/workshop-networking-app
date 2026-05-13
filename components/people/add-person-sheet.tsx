"use client";

import * as React from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PersonForm } from "./person-form";
import { useAddPerson } from "./add-person-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createPerson } from "@/lib/db/repositories/people";
import { useMostRecentEvent } from "@/hooks/use-events";
import type { PersonFormValues } from "@/lib/validators/person";

export function AddPersonSheet() {
  const {
    isOpen,
    setOpen,
    close,
    presetEventMetId,
    afterSubmit,
    keepOpenAfterSave,
    setKeepOpenAfterSave,
  } = useAddPerson();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const side: "right" | "bottom" = isDesktop ? "right" : "bottom";

  const mostRecent = useMostRecentEvent();
  const defaultEventMetId =
    presetEventMetId ?? (mostRecent ? mostRecent.id : undefined);

  // Remount form on each open so default values + autofocus reapply on the EVT-05 loop.
  const [formKey, setFormKey] = React.useState(0);
  const [lastAdded, setLastAdded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setLastAdded(null);
    }
  }, [isOpen]);

  const handleSubmit = async (values: PersonFormValues) => {
    try {
      const newId = await createPerson({
        name: values.name,
        role: values.role || undefined,
        company: values.company || undefined,
        tags: values.tags,
        notes: values.note || undefined,
        eventMetId: values.eventMetId,
        closeness: values.closeness,
      });
      if (afterSubmit) {
        await afterSubmit(newId);
      }
      toast.success(`Added ${values.name}`);
      if (keepOpenAfterSave) {
        setLastAdded(values.name);
        setFormKey((k) => k + 1);
        // Auto-dismiss the inline confirm after 2s.
        window.setTimeout(() => setLastAdded(null), 2000);
      } else {
        close();
      }
    } catch (err) {
      console.error("createPerson failed", err);
      toast.error("Couldn't add — try again");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side={side} className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add a person</SheetTitle>
          <SheetDescription>
            Capture them while it&apos;s fresh.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 pb-6">
          {presetEventMetId && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-[13px]">
              <Checkbox
                id="keep-open"
                checked={keepOpenAfterSave}
                onCheckedChange={(v) => setKeepOpenAfterSave(v === true)}
              />
              <Label htmlFor="keep-open" className="cursor-pointer">
                Keep adding more people
              </Label>
            </div>
          )}
          {lastAdded && (
            <p className="rounded-md bg-accent px-3 py-2 text-[13px] text-accent-foreground">
              Added {lastAdded} ✓
            </p>
          )}
          <PersonForm
            key={formKey}
            mode="create"
            defaultValues={{ eventMetId: defaultEventMetId }}
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add person"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
