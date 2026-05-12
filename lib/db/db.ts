"use client";

import Dexie, { type EntityTable } from "dexie";
import type { AppEvent, Meta, Person, Touch } from "./types";

// HMR-safe singleton. Without this, every edit creates a second Dexie instance
// pointing at the same database name and throws InvalidStateError mid-demo.
const g = globalThis as unknown as { __networkingDb?: NetworkingDB };

type NetworkingDB = Dexie & {
  people: EntityTable<Person, "id">;
  events: EntityTable<AppEvent, "id">;
  touches: EntityTable<Touch, "id">;
  meta: EntityTable<Meta, "key">;
};

function createDb(): NetworkingDB {
  const instance = new Dexie("NetworkingApp") as NetworkingDB;

  // Schema v1 — locked. Every eventual field is pre-declared so later phases
  // need zero migrations. NEVER edit this block after the first user opens
  // the app; append `version(2)` with an upgrade callback instead.
  instance.version(1).stores({
    people: "id, name, closeness, lastContactAt, followUpAt, *tags",
    events: "id, date, status, *tags, *attendees",
    touches: "id, personId, eventId, timestamp, type",
    meta: "key",
  });

  return instance;
}

export const db: NetworkingDB = g.__networkingDb ?? (g.__networkingDb = createDb());
