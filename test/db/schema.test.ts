import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("Dexie schema v1", () => {
  it("inserts and queries a person, including the *tags multi-entry index", async () => {
    await db.people.add({
      id: "p1",
      name: "Sara Kim",
      tags: ["design", "ai"],
      closeness: "warm",
      createdAt: Date.now(),
    });

    const allPeople = await db.people.toArray();
    expect(allPeople).toHaveLength(1);
    expect(allPeople[0]?.name).toBe("Sara Kim");

    const byTag = await db.people.where("tags").equals("design").toArray();
    expect(byTag).toHaveLength(1);
    expect(byTag[0]?.id).toBe("p1");
  });

  it("inserts and queries an event, including the *attendees multi-entry index", async () => {
    await db.events.add({
      id: "e1",
      name: "AI Tinkerers Cairo",
      date: Date.now(),
      tags: ["meetup"],
      attendees: ["p1", "p2"],
      status: "attended",
      createdAt: Date.now(),
    });

    const byAttendee = await db.events.where("attendees").equals("p1").toArray();
    expect(byAttendee).toHaveLength(1);
    expect(byAttendee[0]?.id).toBe("e1");
  });

  it("inserts and queries a touch by personId", async () => {
    await db.touches.add({
      id: "t1",
      personId: "p1",
      type: "note",
      timestamp: Date.now(),
      body: "Said hi at the meetup",
    });

    const byPerson = await db.touches.where("personId").equals("p1").toArray();
    expect(byPerson).toHaveLength(1);
    expect(byPerson[0]?.body).toBe("Said hi at the meetup");
  });

  it("stores and retrieves arbitrary meta entries", async () => {
    await db.meta.put({ key: "persistGranted", value: true });
    const row = await db.meta.get("persistGranted");
    expect(row?.value).toBe(true);
  });
});
