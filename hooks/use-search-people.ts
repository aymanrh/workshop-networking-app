"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { searchPeople, type ClosenessFilter } from "@/lib/search";
import type { Person } from "@/lib/db/types";

export function useSearchPeople(
  query: string,
  closeness: ClosenessFilter = "all",
  tags: string[] = [],
): Person[] | undefined {
  const all = useLiveQuery(() => db.people.toArray(), []);
  if (all === undefined) return undefined;
  return searchPeople(all, query, closeness, tags);
}
