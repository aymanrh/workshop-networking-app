import { test, expect } from "@playwright/test";
import { startFresh, dismissFirstRun, shot } from "./helpers/test-setup";

test.describe("Theme toggle & IndexedDB persistence", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await dismissFirstRun(page);
  });

  test("dark mode applies a class on <html> and persists across reload", async ({
    page,
  }) => {
    // next-themes is configured with attribute="class" in app/layout.tsx,
    // so picking "Dark" should add a "dark" class to the <html> element.
    await page.getByRole("button", { name: "Theme menu" }).click();
    await page.getByRole("menuitem", { name: /^Dark$/ }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    await shot(page, "06-dark-mode-applied");

    // Reload — theme should survive because next-themes writes to localStorage.
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await shot(page, "06-dark-mode-after-reload");
  });

  test("a person added to IndexedDB survives a full page reload", async ({
    page,
  }) => {
    await page.goto("/people");
    await page.getByRole("button", { name: "Add person" }).first().click();
    await page.getByLabel("Name").fill("Persistence Pat");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add person" })
      .click();

    const card = page.getByRole("link", { name: /Persistence Pat/i });
    await expect(card).toBeVisible();
    await shot(page, "06-person-added");

    await page.reload();

    await expect(
      page.getByRole("link", { name: /Persistence Pat/i }),
    ).toBeVisible();
    await shot(page, "06-person-after-reload");
  });
});
