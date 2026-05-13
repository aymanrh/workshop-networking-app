"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { filterTagSuggestions } from "@/lib/tags";

export function useAllTags(): string[] | undefined {
  return useLiveQuery(async () => {
    const keys = await db.people.orderBy("tags").uniqueKeys();
    return (keys as string[]).sort();
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
