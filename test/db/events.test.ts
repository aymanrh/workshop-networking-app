import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";
import { createPerson } from "@/lib/db/repositories/people";
import {
  createEvent,
  deleteEvent,
  addAttendee,
  removeAttendee,
  updateEvent,
} from "@/lib/db/repositories/events";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("events repository", () => {
  it("createEvent assigns a ULID, defaults attendees [] and status interested", async () => {
    const id = await createEvent({
      name: "React NYC",
      date: Date.now(),
      tags: ["MEETUP", "react"],
    });
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    const row = await db.events.get(id);
    expect(row?.attendees).toEqual([]);
    expect(row?.status).toBe("interested");
    expect(row?.tags).toEqual(["meetup", "react"]);
  });

  it("updateEvent re-normalizes tags on patch", async () => {
    const id = await createEvent({ name: "AI", date: Date.now() });
    await updateEvent(id, { tags: ["AI", "ai", " Cairo "] });
    const row = await db.events.get(id);
    expect(row?.tags).toEqual(["ai", "cairo"]);
  });

  it("deleteEvent cascades: clears eventMetId on linked people, keeps people", async () => {
    const eventId = await createEvent({ name: "React NYC", date: Date.now() });
    const personId = await createPerson({ name: "Sara Kim" });
    await db.people.update(personId, { eventMetId: eventId });

    await deleteEvent(eventId);

    expect(await db.events.get(eventId)).toBeUndefined();
    const person = await db.people.get(personId);
    expect(person).toBeDefined();
    expect(person?.eventMetId).toBeUndefined();
  });

  it("addAttendee is idempotent and dual-writes eventMetId only when unset", async () => {
    const eventId = await createEvent({ name: "AI Tinkerers", date: Date.now() });
    const personA = await createPerson({ name: "Person A" });
    const personB = await createPerson({ name: "Person B" });
    await db.people.update(personB, { eventMetId: "some-other-event" });

    await addAttendee(eventId, personA);
    await addAttendee(eventId, personA); // duplicate
    await addAttendee(eventId, personB);

    const event = await db.events.get(eventId);
    expect(event?.attendees).toEqual([personA, personB]);

    const a = await db.people.get(personA);
    const b = await db.people.get(personB);
    expect(a?.eventMetId).toBe(eventId);
    expect(b?.eventMetId).toBe("some-other-event"); // preserved
  });

  it("addAttendee touches lastContactAt on the attendee", async () => {
    const eventId = await createEvent({ name: "Past Event", date: Date.now() });
    const personId = await createPerson({ name: "Mason Lee" });
    const before = (await db.people.get(personId))?.lastContactAt ?? 0;
    await new Promise((r) => setTimeout(r, 5));
    await addAttendee(eventId, personId);
    const after = (await db.people.get(personId))?.lastContactAt ?? 0;
    expect(after).toBeGreaterThan(before);
  });

  it("removeAttendee splices and clears eventMetId only on match", async () => {
    const eventId = await createEvent({ name: "Event 1", date: Date.now() });
    const personA = await createPerson({ name: "A" });
    const personB = await createPerson({ name: "B" });
    await addAttendee(eventId, personA);
    await db.people.update(personB, { eventMetId: "other-event" });
    await addAttendee(eventId, personB); // event.attendees gets B, but eventMetId NOT changed

    await removeAttendee(eventId, personA);
    await removeAttendee(eventId, personB);

    const event = await db.events.get(eventId);
    expect(event?.attendees).toEqual([]);

    const a = await db.people.get(personA);
    const b = await db.people.get(personB);
    expect(a?.eventMetId).toBeUndefined(); // was set by addAttendee, cleared by remove
    expect(b?.eventMetId).toBe("other-event"); // preserved
  });
});
