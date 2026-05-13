import { test, expect } from "@playwright/test";
import { resetDb, startFresh, shot } from "./helpers/test-setup";

test.describe("Export / import / seed", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    // Note: NOT dismissing first run — this spec uses the seed prompt card.
  });

  test("load seed, export, then import the same file to restore state", async ({
    page,
  }) => {
    // 1. Load 8 sample people and 4 sample events from the first-run prompt.
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await page.getByRole("button", { name: /Load sample data/i }).click();
    await expect(page.getByText(/Loaded sample data/i)).toBeVisible();
    // The home counts paragraph renders the bare string; the toast wraps it
    // in "Loaded sample data (...)". exact:true picks the counts paragraph.
    await expect(
      page.getByText("8 people · 4 events", { exact: true }),
    ).toBeVisible();
    await shot(page, "05-home-after-seed");

    // 2. Export — Sonner intercepts the download via the HeaderMenu.
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "App menu" }).click();
    await page.getByRole("menuitem", { name: /Export data/i }).click();
    const download = await downloadPromise;

    // Persist the downloaded JSON next to the screenshots so reviewers can
    // sanity-check it. Filename comes from the app (exportFilename()).
    const exportPath = `test-results/screenshots/05-export-${download.suggestedFilename()}`;
    await download.saveAs(exportPath);
    await expect(page.getByText(/Exported 8 people · 4 events/)).toBeVisible();
    await shot(page, "05-after-export");

    // 3. Wipe everything so the import has something to replace, then import.
    await resetDb(page);
    await page.getByRole("button", { name: "Start empty" }).click();
    await expect(page.getByText(/Nothing here yet/i)).toBeVisible();

    await page.getByRole("button", { name: "App menu" }).click();

    // The Import action triggers a hidden <input type="file"> via ref. The
    // canonical Playwright pattern is to wait for the filechooser event the
    // input emits — this routes the upload regardless of which HeaderMenu
    // instance (mobile or desktop) is wired up.
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("menuitem", { name: /Import data/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(exportPath);

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await shot(page, "05-import-confirm");

    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: /Replace/i })
      .click();

    await expect(page.getByText(/Imported 8 people · 4 events/)).toBeVisible();
    await expect(
      page.getByText("8 people · 4 events", { exact: true }),
    ).toBeVisible();
    await shot(page, "05-home-after-import");
  });
});
