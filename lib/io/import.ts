"use client";

import { db } from "@/lib/db/db";

export async function currentCounts(): Promise<{
  people: number;
  events: number;
}> {
  const [people, events] = await Promise.all([
    db.people.count(),
    db.events.count(),
  ]);
  return { people, events };
}

export async function replaceWithImport(
  blob: Blob,
): Promise<{ people: number; events: number }> {
  const { importInto } = await import("dexie-export-import");
  await db.delete();
  await db.open();
  await importInto(db, blob);
  return currentCounts();
}
