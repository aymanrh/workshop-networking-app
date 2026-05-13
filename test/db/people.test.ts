import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";
import {
  createPerson,
  updatePerson,
  deletePerson,
} from "@/lib/db/repositories/people";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("people repository", () => {
  it("createPerson normalizes tags (trim + lowercase + dedupe)", async () => {
    const id = await createPerson({
      name: "Sara Kim",
      tags: ["Design", " NYC ", "design", "react", ""],
    });
    const row = await db.people.get(id);
    expect(row?.tags).toEqual(["design", "nyc", "react"]);
  });

  it("createPerson returns a ULID-shaped id and sets timestamps", async () => {
    const before = Date.now();
    const id = await createPerson({ name: "Kareem Tate" });
    const after = Date.now();
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    const row = await db.people.get(id);
    expect(row).toBeDefined();
    expect(row?.createdAt).toBeGreaterThanOrEqual(before);
    expect(row?.createdAt).toBeLessThanOrEqual(after);
    expect(row?.lastContactAt).toBe(row?.createdAt);
    expect(row?.closeness).toBe("warm");
  });

  it("deletePerson cascades touches that reference the person", async () => {
    const id = await createPerson({ name: "Mason Lee" });
    await db.touches.add({
      id: "t-1",
      personId: id,
      type: "note",
      timestamp: Date.now(),
      body: "Met at React NYC",
    });
    await db.touches.add({
      id: "t-2",
      personId: id,
      type: "message",
      timestamp: Date.now(),
      body: "Followed up via email",
    });
    expect(await db.touches.count()).toBe(2);

    await deletePerson(id);

    expect(await db.people.get(id)).toBeUndefined();
    expect(await db.touches.count()).toBe(0);
  });

  it("updatePerson re-normalizes tags on patch", async () => {
    const id = await createPerson({ name: "Layla", tags: ["design"] });
    await updatePerson(id, { tags: ["NYC", "design", "design", " React "] });
    const row = await db.people.get(id);
    expect(row?.tags).toEqual(["nyc", "design", "react"]);
  });
});
