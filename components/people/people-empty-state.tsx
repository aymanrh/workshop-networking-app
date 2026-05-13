"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPerson } from "./add-person-context";

export function PeopleEmptyState() {
  const { open } = useAddPerson();
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">No people yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add the first person you&apos;ve met.
      </p>
      <Button className="mt-4" onClick={open}>
        <Plus className="mr-1 size-4" />
        Add person
      </Button>
    </div>
  );
}
