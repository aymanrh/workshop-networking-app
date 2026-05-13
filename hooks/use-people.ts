"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import type { Person } from "@/lib/db/types";

export function usePeople(): Person[] | undefined {
  return useLiveQuery(
    () => db.people.orderBy("lastContactAt").reverse().toArray(),
    [],
  );
}

export function usePerson(id: string | undefined): Person | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.people.get(id)) ?? null;
  }, [id]);
}

export function usePeopleCount(): number | undefined {
  return useLiveQuery(() => db.people.count(), []);
}

export function usePeopleByIds(ids: string[]): Person[] | undefined {
  return useLiveQuery(async () => {
    if (ids.length === 0) return [];
    const rows = await db.people.where("id").anyOf(ids).toArray();
    const order = new Map(ids.map((id, idx) => [id, idx]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return rows;
  }, [ids.join("|")]);
}
