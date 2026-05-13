import type { Closeness, Person } from "@/lib/db/types";

export type ClosenessFilter = "all" | Closeness;

export function scorePerson(person: Person, query: string): number {
  const q = query.trim().toLowerCase();
  if (q === "") return 0;
  let score = 0;
  const name = person.name.toLowerCase();
  if (name.startsWith(q)) score += 1000;
  else if (name.includes(q)) score += 100;
  if (person.tags.some((t) => t === q)) score += 80;
  const role = (person.role ?? "").toLowerCase();
  const company = (person.company ?? "").toLowerCase();
  if (role.includes(q) || company.includes(q)) score += 40;
  const notes = (person.notes ?? "").toLowerCase();
  if (notes.includes(q)) score += 10;
  return score;
}

export function searchPeople(
  people: Person[],
  query: string,
  closeness: ClosenessFilter = "all",
  tags: string[] = [],
): Person[] {
  const q = query.trim().toLowerCase();
  const requireTags = tags.map((t) => t.toLowerCase());

  const matchClose = (p: Person) =>
    closeness === "all" ? true : p.closeness === closeness;
  const matchTags = (p: Person) =>
    requireTags.every((t) => p.tags.includes(t));

  const filtered = people.filter((p) => matchClose(p) && matchTags(p));

  if (q === "") {
    return [...filtered].sort(
      (a, b) => (b.lastContactAt ?? 0) - (a.lastContactAt ?? 0),
    );
  }

  const scored = filtered
    .map((p) => ({ person: p, score: scorePerson(p, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.person);
}

export function topTags(people: Person[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const p of people) {
    for (const t of p.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const entries = Array.from(counts.entries());
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
  return entries.slice(0, limit).map(([t]) => t);
}
