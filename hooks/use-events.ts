"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { startOfDay } from "date-fns";
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

export function useUpcomingEvents(): AppEvent[] | undefined {
  return useLiveQuery(async () => {
    const today = startOfDay(new Date()).getTime();
    return db.events.where("date").aboveOrEqual(today).sortBy("date");
  }, []);
}

export function usePastEvents(): AppEvent[] | undefined {
  return useLiveQuery(async () => {
    const today = startOfDay(new Date()).getTime();
    const rows = await db.events.where("date").below(today).sortBy("date");
    return rows.reverse();
  }, []);
}

export function useMostRecentEvent(): AppEvent | null | undefined {
  return useLiveQuery(async () => {
    const rows = await db.events
      .orderBy("date")
      .reverse()
      .limit(1)
      .toArray();
    return rows[0] ?? null;
  }, []);
}
