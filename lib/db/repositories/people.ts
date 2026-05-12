"use client";

import { db } from "../db";
import { newId } from "@/lib/id";
import { requestPersistentStorage } from "../persist";
import type { Closeness, Person } from "../types";

export type NewPerson = {
  name: string;
  role?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  closeness?: Closeness;
  followUpAt?: number;
  eventMetId?: string;
};

export async function createPerson(input: NewPerson): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.people.add({
    id,
    name: input.name,
    role: input.role,
    company: input.company,
    tags: (input.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    notes: input.notes,
    closeness: input.closeness ?? "warm",
    createdAt: now,
    lastContactAt: now,
    followUpAt: input.followUpAt,
    eventMetId: input.eventMetId,
  });
  // Fire-and-forget: ensures Safari/iOS doesn't evict the DB after first write.
  void requestPersistentStorage();
  return id;
}

export async function updatePerson(
  id: string,
  patch: Partial<Person>,
): Promise<void> {
  if (patch.tags) {
    patch.tags = patch.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  await db.people.update(id, patch);
}

export async function deletePerson(id: string): Promise<void> {
  await db.transaction("rw", db.people, db.touches, async () => {
    await db.touches.where("personId").equals(id).delete();
    await db.people.delete(id);
  });
}
