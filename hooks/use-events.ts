"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import type { AppEvent } from "@/lib/db/types";

export function useEvents(): AppEvent[] | undefined {
  return useLiveQuery(() => db.events.orderBy("date").reverse().toArray(), []);
}

export function useEvent(id: string | undefined): AppEvent | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.events.get(id)) ?? null;
  }, [id]);
}

export function useEventsCount(): number | undefined {
  return useLiveQuery(() => db.events.count(), []);
}

export function useMostRecentEvent(): AppEvent | null | undefined {
  return useLiveQuery(async () => {
    const rows = await db.events
      .orderBy("createdAt")
      .reverse()
      .limit(1)
      .toArray();
    return rows[0] ?? null;
  }, []);
}
