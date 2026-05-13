"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

export type FirstRunState =
  | "loading"
  | "prompt"
  | "data"
  | "empty-after-dismiss";

export function useFirstRunState(): FirstRunState {
  const result = useLiveQuery(async () => {
    const [people, events, dismissed, loaded] = await Promise.all([
      db.people.count(),
      db.events.count(),
      db.meta.get("seedDismissed"),
      db.meta.get("seedLoaded"),
    ]);
    return { people, events, dismissed: !!dismissed?.value, loaded: !!loaded?.value };
  }, []);

  if (result === undefined) return "loading";
  if (result.people > 0 || result.events > 0) return "data";
  if (result.dismissed || result.loaded) return "empty-after-dismiss";
  return "prompt";
}
