import { test, expect } from "@playwright/test";
import { startFresh, dismissFirstRun, shot } from "./helpers/test-setup";

function isoDateOffsetDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

test.describe("Events CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await dismissFirstRun(page);
  });

  test("add a future event, edit it, then delete it", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await shot(page, "02-events-list-empty");

    // The desktop AddButton sits in the TopBar and is route-aware.
    await page.getByRole("button", { name: "Add event" }).first().click();

    await page.getByLabel("Name").fill("React NYC Meetup");
    await page.getByLabel("Date").fill(isoDateOffsetDays(14));
    await page.getByLabel("Location").fill("Brooklyn, NY");

    const tagInput = page.getByLabel("Tags");
    await tagInput.fill("meetup");
    await tagInput.press("Enter");
    await tagInput.fill("react");
    await tagInput.press("Enter");

    await shot(page, "02-add-event-sheet-filled");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add event" })
      .click();

    await expect(page.getByText("Added React NYC Meetup")).toBeVisible();

    // Card lives under the "Upcoming" section because the date is in the future.
    const card = page.getByRole("link", { name: /React NYC Meetup/i });
    await expect(card).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
    await shot(page, "02-events-list-with-card");

    await card.click();
    await expect(
      page.getByRole("heading", { name: "React NYC Meetup" }),
    ).toBeVisible();
    await shot(page, "02-event-detail");

    // Edit — change location.
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Location").fill("Manhattan, NY");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Manhattan, NY")).toBeVisible();
    await shot(page, "02-event-edited");

    // Delete via "Event actions" menu.
    await page.getByRole("button", { name: "Event actions" }).click();
    await page.getByRole("menuitem", { name: /Delete event/i }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: /Delete/i })
      .click();

    await expect(page).toHaveURL(/\/events\/?$/);
    await expect(
      page.getByRole("link", { name: /React NYC Meetup/i }),
    ).toHaveCount(0);
    await shot(page, "02-events-list-after-delete");
  });
});
