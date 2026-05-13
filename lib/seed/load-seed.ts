"use client";

import { db } from "@/lib/db/db";
import { SEED_PEOPLE, SEED_EVENTS } from "./data";

export async function loadSeed(): Promise<{ people: number; events: number }> {
  await db.transaction("rw", db.people, db.events, db.meta, async () => {
    for (const person of SEED_PEOPLE) {
      await db.people.put(person);
    }
    for (const event of SEED_EVENTS) {
      await db.events.put(event);
    }
    await db.meta.put({ key: "seedLoaded", value: true });
  });
  return { people: SEED_PEOPLE.length, events: SEED_EVENTS.length };
}

export async function dismissSeed(): Promise<void> {
  await db.meta.put({ key: "seedDismissed", value: true });
}
