import { test, expect } from "@playwright/test";
import { startFresh, dismissFirstRun, shot } from "./helpers/test-setup";

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

test.describe("Linking & event-met smart default", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await dismissFirstRun(page);
  });

  test("most-recent event pre-fills 'Where you met'; attendees picker links existing people", async ({
    page,
  }) => {
    // 1. Create the event first. It becomes the most-recent event.
    await page.goto("/events");
    await page.getByRole("button", { name: "Add event" }).first().click();
    await page.getByLabel("Name").fill("AI Tinkerers Cairo");
    await page.getByLabel("Date").fill(todayIso());
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add event" })
      .click();
    await expect(page.getByText("Added AI Tinkerers Cairo")).toBeVisible();

    // 2. Add a person via the global button. The TopBar button is route-aware
    //    (shows "Add event" on /events) — navigate to /people so the
    //    "Add person" trigger is the one rendered.
    await page.goto("/people");
    await page.getByRole("button", { name: "Add person" }).first().click();

    // The Select trigger is a Radix combobox labelled by "Where you met".
    // Confirm its visible value is the event we just created.
    const whereYouMet = page.getByRole("combobox", {
      name: /Where you met/i,
    });
    await expect(whereYouMet).toBeVisible();
    await expect(whereYouMet).toContainText(/AI Tinkerers Cairo/);
    await shot(page, "03-event-met-prefilled");

    await page.getByLabel("Name").fill("Layla Hassan");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add person" })
      .click();
    await expect(page.getByText("Added Layla Hassan")).toBeVisible();

    // 3. Open the person's detail and confirm "Met at <event>" chip shows.
    await page.goto("/people");
    await page.getByRole("link", { name: /Layla Hassan/i }).click();
    await expect(
      page.getByRole("heading", { name: "Layla Hassan" }),
    ).toBeVisible();
    await expect(page.getByText(/Met at AI Tinkerers Cairo/i)).toBeVisible();
    await shot(page, "03-person-detail-met-chip");

    // 4. Add a second person (no event preset this time — we'll link via the
    //    event's attendees picker instead).
    await page.goto("/people");
    await page.getByRole("button", { name: "Add person" }).first().click();
    await page.getByLabel("Name").fill("Priya Patel");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add person" })
      .click();
    await expect(page.getByText("Added Priya Patel")).toBeVisible();

    // 5. Navigate to the event and link Priya via "Existing person".
    await page.goto("/events");
    await page.getByRole("link", { name: /AI Tinkerers Cairo/i }).click();
    await page.getByRole("button", { name: /Existing person/i }).click();

    const picker = page.getByRole("dialog");
    await expect(picker.getByText("Add attendees")).toBeVisible();
    await picker.getByRole("option", { name: /Priya Patel/i }).click();
    await shot(page, "03-attendees-picker-selected");
    await picker.getByRole("button", { name: /^Done/ }).click();

    await expect(page.getByText(/Added 1 attendee/i)).toBeVisible();

    // Attendee row shows on the event detail.
    await expect(
      page.getByRole("link", { name: /Priya Patel/i }),
    ).toBeVisible();
    await shot(page, "03-event-with-attendee");

    // 6. Remove Priya from this event via the per-row remove button.
    await page
      .getByRole("button", { name: "Remove Priya Patel from this event" })
      .click();
    await expect(page.getByText(/Removed Priya Patel/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Priya Patel/i }),
    ).toHaveCount(0);
    await shot(page, "03-event-attendee-removed");
  });
});
