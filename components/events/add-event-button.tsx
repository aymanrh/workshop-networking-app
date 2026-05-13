"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddEvent } from "./add-event-context";

export function AddEventButton() {
  const { open } = useAddEvent();
  return (
    <Button
      type="button"
      size="sm"
      onClick={open}
      className="hidden md:inline-flex"
    >
      <Plus className="mr-1 size-4" />
      Add event
    </Button>
  );
}
