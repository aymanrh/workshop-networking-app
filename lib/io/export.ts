"use client";

import { db } from "@/lib/db/db";

export async function exportData(): Promise<{
  blob: Blob;
  counts: { people: number; events: number };
}> {
  const { exportDB } = await import("dexie-export-import");
  const [people, events] = await Promise.all([
    db.people.count(),
    db.events.count(),
  ]);
  const blob = await exportDB(db);
  return { blob, counts: { people, events } };
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFilename(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `networking-app-${yyyy}-${mm}-${dd}.json`;
}
