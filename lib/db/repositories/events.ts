"use client";

import { db } from "../db";
import { newId } from "@/lib/id";
import { normalizeTags } from "@/lib/tags";
import { requestPersistentStorage } from "../persist";
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
    tags: normalizeTags(input.tags ?? []),
    attendees: input.attendees ?? [],
    status: input.status ?? "interested",
    createdAt: Date.now(),
  });
  void requestPersistentStorage();
  return id;
}

export async function updateEvent(
  id: string,
  patch: Partial<AppEvent>,
): Promise<void> {
  if (patch.tags) {
    patch.tags = normalizeTags(patch.tags);
  }
  await db.events.update(id, patch);
}

export async function deleteEvent(id: string): Promise<void> {
  await db.transaction("rw", db.events, db.people, async () => {
    const linkedPeople = await db.people
      .toCollection()
      .filter((p) => p.eventMetId === id)
      .toArray();
    await Promise.all(
      linkedPeople.map((p) =>
        db.people.update(p.id, { eventMetId: undefined }),
      ),
    );
    await db.events.delete(id);
  });
}

export async function addAttendee(
  eventId: string,
  personId: string,
): Promise<void> {
  await db.transaction("rw", db.events, db.people, async () => {
    const event = await db.events.get(eventId);
    if (!event) return;
    const person = await db.people.get(personId);
    if (!person) return;

    if (!event.attendees.includes(personId)) {
      await db.events.update(eventId, {
        attendees: [...event.attendees, personId],
      });
    }
    const updates: Partial<typeof person> = { lastContactAt: Date.now() };
    if (!person.eventMetId) {
      updates.eventMetId = eventId;
    }
    await db.people.update(personId, updates);
  });
}

export async function removeAttendee(
  eventId: string,
  personId: string,
): Promise<void> {
  await db.transaction("rw", db.events, db.people, async () => {
    const event = await db.events.get(eventId);
    if (!event) return;
    if (event.attendees.includes(personId)) {
      await db.events.update(eventId, {
        attendees: event.attendees.filter((id) => id !== personId),
      });
    }
    const person = await db.people.get(personId);
    if (person && person.eventMetId === eventId) {
      await db.people.update(personId, { eventMetId: undefined });
    }
  });
}
