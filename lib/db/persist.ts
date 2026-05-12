"use client";

import { db } from "./db";

// Defends against Safari ITP eviction and Chrome "clear browsing data" loss.
// Call after the first successful write — not on app boot. Result is recorded
// in the meta store so future writes don't re-prompt.
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return false;
  }

  const existing = await db.meta.get("persistGranted");
  if (existing && existing.value === true) {
    return true;
  }

  const granted = await navigator.storage.persist();
  await db.meta.put({ key: "persistGranted", value: granted });
  return granted;
}
