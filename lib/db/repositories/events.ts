"use client";

import { db } from "../db";
import { newId } from "@/lib/id";
import type { AppEvent, EventStatus } from "../types";

export type NewEvent = {
  name: string;
  date: number;
  location?: string;
  tags?: string[];
  status?: EventStatus;
  attendees?: string[];
};

export async function createEvent(input: NewEvent): Promise<string> {
  const id = newId();
  await db.events.add({
    id,
    name: input.name,
    date: input.date,
    location: input.location,
    tags: (input.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    attendees: input.attendees ?? [],
    status: input.status ?? "interested",
    createdAt: Date.now(),
  });
  return id;
}

export async function updateEvent(
  id: string,
  patch: Partial<AppEvent>,
): Promise<void> {
  if (patch.tags) {
    patch.tags = patch.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  await db.events.update(id, patch);
}

export async function deleteEvent(id: string): Promise<void> {
  await db.transaction("rw", db.events, db.people, async () => {
    // Clear eventMetId on any person who pointed at this event.
    const linkedPeople = await db.people.where("eventMetId").equals(id).toArray();
    await Promise.all(
      linkedPeople.map((p) => db.people.update(p.id, { eventMetId: undefined })),
    );
    await db.events.delete(id);
  });
}
