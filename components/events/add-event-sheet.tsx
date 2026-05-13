"use client";

import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EventForm } from "./event-form";
import { useAddEvent } from "./add-event-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createEvent } from "@/lib/db/repositories/events";
import type { EventFormValues } from "@/lib/validators/event";

export function AddEventSheet() {
  const { isOpen, setOpen, close } = useAddEvent();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const side: "right" | "bottom" = isDesktop ? "right" : "bottom";

  const handleSubmit = async (values: EventFormValues) => {
    try {
      await createEvent({
        name: values.name,
        date: new Date(values.date).getTime(),
        location: values.location || undefined,
        tags: values.tags,
        status: values.status,
      });
      toast.success(`Added ${values.name}`);
      close();
    } catch (err) {
      console.error("createEvent failed", err);
      toast.error("Couldn't add — try again");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side={side} className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add an event</SheetTitle>
          <SheetDescription>Where you meet matters.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <EventForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel="Add event"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
