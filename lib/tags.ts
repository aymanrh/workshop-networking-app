export function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const n = normalizeTag(t);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function filterTagSuggestions(
  allTags: string[],
  query: string,
  limit = 5,
  excluded: string[] = [],
): string[] {
  const q = query.trim().toLowerCase();
  const skip = new Set(excluded.map(normalizeTag));
  const matches = allTags
    .filter((t) => !skip.has(t) && (q === "" || t.startsWith(q)))
    .slice(0, limit);
  return matches;
}
