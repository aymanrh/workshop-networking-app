"use client";

import * as React from "react";
import { toast } from "sonner";
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
import type { PersonFormValues } from "@/lib/validators/person";

export function AddPersonSheet() {
  const { isOpen, setOpen, close } = useAddPerson();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const side: "right" | "bottom" = isDesktop ? "right" : "bottom";

  const handleSubmit = async (values: PersonFormValues) => {
    try {
      await createPerson({
        name: values.name,
        role: values.role || undefined,
        company: values.company || undefined,
        tags: values.tags,
        notes: values.note || undefined,
        eventMetId: values.eventMetId,
        closeness: values.closeness,
      });
      toast.success(`Added ${values.name}`);
      close();
    } catch (err) {
      console.error("createPerson failed", err);
      toast.error("Couldn't add — try again");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side={side}
        className="overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Add a person</SheetTitle>
          <SheetDescription>
            Capture them while it&apos;s fresh.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <PersonForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add person"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
