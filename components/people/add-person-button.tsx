"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPerson } from "./add-person-context";

export function AddPersonButton() {
  const { open } = useAddPerson();
  return (
    <Button
      type="button"
      size="sm"
      onClick={open}
      className="hidden md:inline-flex"
    >
      <Plus className="mr-1 size-4" />
      Add person
    </Button>
  );
}
