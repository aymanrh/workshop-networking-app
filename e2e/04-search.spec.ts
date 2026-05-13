import { test, expect } from "@playwright/test";
import { startFresh, dismissFirstRun, shot } from "./helpers/test-setup";

async function addPerson(
  page: import("@playwright/test").Page,
  name: string,
  tag: string,
): Promise<void> {
  await page.getByRole("button", { name: "Add person" }).first().click();
  await page.getByLabel("Name").fill(name);
  const tags = page.getByLabel("Tags");
  await tags.fill(tag);
  await tags.press("Enter");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add person" })
    .click();
  await expect(page.getByText(`Added ${name}`)).toBeVisible();
}

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await dismissFirstRun(page);
  });

  test("typing a partial name surfaces a result; tag filter narrows it away", async ({
    page,
  }) => {
    await page.goto("/people");
    await addPerson(page, "Sara Kim", "design");
    await addPerson(page, "Kareem Tate", "pm");
    await addPerson(page, "Mason Lee", "founder");
    await shot(page, "04-three-people-seeded");

    // Two SearchInput components render (mobile + desktop). Default Chrome
    // viewport (~1280) shows the desktop one — pick the first match.
    const search = page.getByLabel("Search people").first();
    await search.click();
    await search.fill("Sa");

    // Scope all popover assertions to Radix's popper wrapper so we don't
    // collide with the person-card link on the /people list (which always
    // remains visible regardless of search state).
    const popover = page.locator("[data-radix-popper-content-wrapper]");
    await expect(
      popover.getByRole("link", { name: /Sara Kim/i }),
    ).toBeVisible();
    await shot(page, "04-search-by-name");

    // Popover is still open. Click the "founder" tag chip inside the popover
    // — Sara has no founder tag, so the popover row should drop out.
    await popover.getByRole("button", { name: "founder" }).click();
    await expect(
      popover.getByRole("link", { name: /Sara Kim/i }),
    ).toHaveCount(0);
    await expect(popover.getByText(/No matches/i)).toBeVisible();
    await shot(page, "04-search-filtered-out");

    // Deselect the founder tag — Sara's popover row reappears.
    await popover.getByRole("button", { name: "founder" }).click();
    await expect(
      popover.getByRole("link", { name: /Sara Kim/i }),
    ).toBeVisible();
    await shot(page, "04-search-tag-cleared");
  });
});
