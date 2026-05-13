import { describe, expect, it } from "vitest";
import { scorePerson, searchPeople, topTags } from "@/lib/search";
import type { Person } from "@/lib/db/types";

function p(over: Partial<Person>): Person {
  return {
    id: "x",
    name: "X",
    tags: [],
    closeness: "warm",
    createdAt: 0,
    ...over,
  };
}

describe("scorePerson", () => {
  it("prefix match scores higher than infix", () => {
    const prefix = p({ name: "Sara Kim" });
    const infix = p({ name: "Andrea Sara" });
    expect(scorePerson(prefix, "sa")).toBeGreaterThan(scorePerson(infix, "sa"));
  });

  it("tag exact match boosts score", () => {
    const a = p({ name: "A", tags: ["design"] });
    const b = p({ name: "A", tags: ["other"] });
    expect(scorePerson(a, "design")).toBeGreaterThan(scorePerson(b, "design"));
  });
});

describe("searchPeople", () => {
  const people: Person[] = [
    p({ id: "1", name: "Sara Kim", role: "Designer", tags: ["design", "nyc"], closeness: "warm" }),
    p({ id: "2", name: "Sara Park", role: "Engineer", tags: ["nyc"], closeness: "close" }),
    p({ id: "3", name: "Diego Ortiz", role: "Product designer", tags: ["sf"], closeness: "warm" }),
    p({ id: "4", name: "Layla Hassan", role: "Engineer", tags: ["cairo"], closeness: "cooling" }),
  ];

  it("returns prefix matches before infix matches", () => {
    const result = searchPeople(people, "sa");
    expect(result[0]?.id).toBe("1");
    expect(result[1]?.id).toBe("2");
    // Layla "Hassan" includes "sa" infix → lower score, still included
    expect(result.map((p) => p.id)).toContain("4");
  });

  it("AND-filters by tags", () => {
    const result = searchPeople(people, "", "all", ["nyc"]);
    expect(result.map((p) => p.id).sort()).toEqual(["1", "2"]);
  });

  it("AND-filters by closeness", () => {
    const result = searchPeople(people, "", "close");
    expect(result.map((p) => p.id)).toEqual(["2"]);
  });

  it("empty query + closeness + tag returns intersection sorted by recent activity", () => {
    const withTimes: Person[] = people.map((p, i) => ({
      ...p,
      lastContactAt: i * 100,
    }));
    const result = searchPeople(withTimes, "", "warm", ["nyc"]);
    expect(result.map((p) => p.id)).toEqual(["1"]);
  });

  it("query plus filters intersects", () => {
    const result = searchPeople(people, "designer", "warm");
    // Sara Kim "Designer" role contains "designer" AND warm; Diego "Product designer" role contains AND warm
    expect(result.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });
});

describe("topTags", () => {
  it("ranks by frequency then alphabetical", () => {
    const people: Person[] = [
      p({ tags: ["design", "nyc"] }),
      p({ tags: ["design", "react"] }),
      p({ tags: ["nyc"] }),
      p({ tags: ["ai"] }),
    ];
    expect(topTags(people, 8)).toEqual(["design", "nyc", "ai", "react"]);
  });
});
