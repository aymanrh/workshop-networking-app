import type { Page } from "@playwright/test";

const DB_NAME = "NetworkingApp";

/**
 * Land on the home page from a clean slate. Each Playwright test already
 * gets its own browser context (and therefore its own IndexedDB), so a
 * simple navigation is enough at the start of a test.
 */
export async function startFresh(page: Page): Promise<void> {
  await page.goto("/");
}

/**
 * Wipe IndexedDB mid-test. Used by the export/import spec which needs
 * to clear state after exporting and before importing. Closes the live
 * Dexie connection first (otherwise deleteDatabase fires `onblocked`),
 * then deletes the database and reloads.
 */
export async function resetDb(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    const g = globalThis as { __networkingDb?: { close: () => void } };
    g.__networkingDb?.close();
  });
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      }),
    DB_NAME,
  );
  await page.goto("/");
}

export async function dismissFirstRun(page: Page): Promise<void> {
  const startEmpty = page.getByRole("button", { name: "Start empty" });
  if (await startEmpty.isVisible().catch(() => false)) {
    await startEmpty.click();
  }
}

export async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}
