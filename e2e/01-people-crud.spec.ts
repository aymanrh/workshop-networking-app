import { test, expect } from "@playwright/test";
import { startFresh, dismissFirstRun, shot } from "./helpers/test-setup";

test.describe("People CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await dismissFirstRun(page);
  });

  test("add, edit, and delete a person; tags normalize to lowercase", async ({
    page,
  }) => {
    await page.goto("/people");
    await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
    await shot(page, "01-people-list-empty");

    // The TopBar "Add person" button is desktop-only and shares its name with
    // the Sheet's submit button — scope by role and pick the first match.
    await page.getByRole("button", { name: "Add person" }).first().click();

    await page.getByLabel("Name").fill("Ayla Rahman");
    await page.getByLabel("Role").fill("Staff engineer");
    await page.getByLabel("Company").fill("Anthropic");

    // Tags input commits on Enter; type uppercase + whitespace to prove
    // normalization (trim + lowercase) is applied on save.
    const tagInput = page.getByLabel("Tags");
    await tagInput.fill("  ENGINEERING  ");
    await tagInput.press("Enter");
    await tagInput.fill("AI");
    await tagInput.press("Enter");

    await shot(page, "01-add-person-sheet-filled");

    // Submit button inside the sheet — scope to the dialog to avoid the
    // TopBar trigger button which also reads "Add person".
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add person" })
      .click();

    // Toast confirms creation (Sonner shows "Added Ayla Rahman").
    await expect(page.getByText("Added Ayla Rahman")).toBeVisible();

    // Card is rendered as a link to /people/[id].
    const card = page.getByRole("link", { name: /Ayla Rahman/i });
    await expect(card).toBeVisible();
    await shot(page, "01-people-list-with-card");

    // Open detail.
    await card.click();
    await expect(
      page.getByRole("heading", { name: "Ayla Rahman" }),
    ).toBeVisible();

    // Tags display lowercase + trimmed.
    await expect(page.getByText("engineering", { exact: true })).toBeVisible();
    await expect(page.getByText("ai", { exact: true })).toBeVisible();
    await shot(page, "01-person-detail");

    // Edit — change role.
    await page.getByRole("button", { name: "Edit" }).click();
    const roleInput = page.getByLabel("Role");
    await roleInput.fill("Principal engineer");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Principal engineer")).toBeVisible();
    await shot(page, "01-person-edited");

    // Delete via "Person actions" → "Delete person" → confirm dialog.
    await page.getByRole("button", { name: "Person actions" }).click();
    await page.getByRole("menuitem", { name: /Delete person/i }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await shot(page, "01-delete-confirm");

    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: /Delete/i })
      .click();

    // Back on /people, empty state restored.
    await expect(page).toHaveURL(/\/people\/?$/);
    await expect(
      page.getByRole("link", { name: /Ayla Rahman/i }),
    ).toHaveCount(0);
    await shot(page, "01-people-list-after-delete");
  });
});
