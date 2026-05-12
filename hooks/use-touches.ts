"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import type { Touch } from "@/lib/db/types";

export function useTouchesForPerson(
  personId: string | undefined,
): Touch[] | undefined {
  return useLiveQuery(async () => {
    if (!personId) return [];
    return db.touches
      .where("personId")
      .equals(personId)
      .reverse()
      .sortBy("timestamp");
  }, [personId]);
}
