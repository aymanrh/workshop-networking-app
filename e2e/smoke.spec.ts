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
  await page.getByRole("button", { name: "Add person" }).first().click();

  // Wait for the Sheet's Name input.
  const nameInput = page.getByLabel("Name");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Smoke Tester");

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add person" })
    .click();

  // The toast and the card both render the name — assert each via its own
  // role to avoid the strict-mode collision that the original assertion hit.
  await expect(page.getByText("Added Smoke Tester")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Smoke Tester/i }),
  ).toBeVisible();
});
