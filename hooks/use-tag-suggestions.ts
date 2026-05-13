"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { filterTagSuggestions } from "@/lib/tags";

export function useAllTags(): string[] | undefined {
  return useLiveQuery(async () => {
    const [peopleKeys, eventKeys] = await Promise.all([
      db.people.orderBy("tags").uniqueKeys(),
      db.events.orderBy("tags").uniqueKeys(),
    ]);
    const merged = new Set<string>([
      ...(peopleKeys as string[]),
      ...(eventKeys as string[]),
    ]);
    return Array.from(merged).sort();
  }, []);
}

export function useTagSuggestions(
  query: string,
  limit = 5,
  excluded: string[] = [],
): string[] | undefined {
  const all = useAllTags();
  if (all === undefined) return undefined;
  return filterTagSuggestions(all, query, limit, excluded);
}
