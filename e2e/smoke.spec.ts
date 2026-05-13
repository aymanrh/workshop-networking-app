import { test, expect } from "@playwright/test";

test("Add Person flow ships a new card on the list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  // Dismiss seed prompt if it's the first run state.
  const startEmpty = page.getByRole("button", { name: "Start empty" });
  if (await startEmpty.isVisible().catch(() => false)) {
    await startEmpty.click();
  }

  await page.goto("/people");
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();

  // Open Add Person Sheet — desktop button visible at ≥md viewport (Chrome default).
  await page.getByRole("button", { name: /Add person/i }).first().click();

  // Wait for the Sheet's Name input.
  const nameInput = page.getByLabel("Name");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Smoke Tester");

  await page.getByRole("button", { name: "Add person" }).last().click();

  // Card should appear on the list.
  await expect(page.getByText("Smoke Tester")).toBeVisible();
});
