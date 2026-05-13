"use client";

import { usePeople } from "@/hooks/use-people";
import { PersonCard } from "@/components/people/person-card";
import { PeopleEmptyState } from "@/components/people/people-empty-state";
import { PeopleListSkeleton } from "@/components/people/people-list-skeleton";

export default function PeoplePage() {
  const people = usePeople();
  return (
    <section className="space-y-4 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">People</h1>
      {people === undefined && <PeopleListSkeleton />}
      {people !== undefined && people.length === 0 && <PeopleEmptyState />}
      {people !== undefined && people.length > 0 && (
        <ul className="space-y-2">
          {people.map((p) => (
            <li key={p.id}>
              <PersonCard person={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
