"use client";

import Link from "next/link";
import { ClosenessBadge } from "@/components/people/closeness-chip";
import type { Person } from "@/lib/db/types";

type Props = {
  person: Person;
  onSelect?: () => void;
};

export function SearchResultRow({ person, onSelect }: Props) {
  return (
    <Link
      href={`/people/${person.id}`}
      onClick={onSelect}
      className="flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0">
        <p className="truncate text-sm">{person.name}</p>
        {(person.role || person.company) && (
          <p className="truncate text-[12px] text-muted-foreground">
            {[person.role, person.company].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <ClosenessBadge value={person.closeness} />
    </Link>
  );
}
