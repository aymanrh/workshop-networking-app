"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ClosenessBadge } from "./closeness-chip";
import type { Person } from "@/lib/db/types";

function lastSeenLabel(ms: number | undefined): string {
  if (!ms) return "—";
  const distance = formatDistanceToNow(new Date(ms), { addSuffix: false });
  return `Last seen ${distance}`;
}

function subtitle(person: Person): string {
  const parts = [person.role, person.company].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

const MAX_TAGS = 3;

export function PersonCard({ person }: { person: Person }) {
  const visibleTags = person.tags.slice(0, MAX_TAGS);
  const overflow = person.tags.length - visibleTags.length;
  return (
    <Link
      href={`/people/${person.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{person.name}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {subtitle(person)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ClosenessBadge value={person.closeness} />
          <span className="text-[13px] text-muted-foreground">
            {lastSeenLabel(person.lastContactAt)}
          </span>
        </div>
      </div>
      {person.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleTags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
          {overflow > 0 && (
            <Badge
              variant="secondary"
              className="font-normal text-muted-foreground"
            >
              +{overflow}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );
}
