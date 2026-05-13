"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPerson } from "./add-person-context";

export function AddPersonFab() {
  const { open, isOpen } = useAddPerson();
  if (isOpen) return null;
  return (
    <Button
      type="button"
      size="icon"
      onClick={open}
      aria-label="Add a person"
      className="fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg transition-shadow hover:shadow-xl active:scale-95 md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Plus className="size-6" />
    </Button>
  );
}
