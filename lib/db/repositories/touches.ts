"use client";

import { db } from "../db";
import { newId } from "@/lib/id";
import type { Touch, TouchType } from "../types";

export type NewTouch = {
  personId: string;
  eventId?: string;
  type: TouchType;
  body: string;
};

export async function createTouch(input: NewTouch): Promise<string> {
  const id = newId();
  const now = Date.now();
  await db.transaction("rw", db.touches, db.people, async () => {
    await db.touches.add({
      id,
      personId: input.personId,
      eventId: input.eventId,
      type: input.type,
      timestamp: now,
      body: input.body,
    });
    await db.people.update(input.personId, { lastContactAt: now });
  });
  return id;
}

export async function updateTouch(
  id: string,
  patch: Partial<Touch>,
): Promise<void> {
  await db.touches.update(id, patch);
}

export async function deleteTouch(id: string): Promise<void> {
  await db.touches.delete(id);
}
