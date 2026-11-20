import { expect, test } from "@playwright/test";

test("single date selection moves its highlight and month navigation stays still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/calendar-and-dates/");
  const calendar = page.locator("#example-calendar .revo-calendar").first();
  const day = calendar.locator(
    '[data-calendar-date="2026-10-23"]:not([aria-hidden])',
  );
  await day.click();
  await expect(day).toHaveAttribute("aria-selected", "true");
  const indicator = calendar.locator(".revo-calendar__selection-indicator");
  await expect(indicator).toHaveCount(1);
  expect(
    await indicator.evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  await expect(indicator).toHaveCount(0);
  const next = calendar.getByRole("button", { name: "Next month" });
  await next.click();
  const grid = calendar.getByRole("grid", { name: "November 2026 Calendar" });
  await expect(grid).toBeVisible();
  expect(
    await grid.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
  await expect(next).toBeFocused();
});

test("calendar selection and navigation remain immediate with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/calendar-and-dates/");
  const calendar = page.locator("#example-calendar .revo-calendar").first();
  const day = calendar.locator(
    '[data-calendar-date="2026-10-23"]:not([aria-hidden])',
  );
  await day.click();
  await expect(day).toHaveAttribute("aria-selected", "true");
  await expect(
    calendar.locator(".revo-calendar__selection-indicator"),
  ).toHaveCount(0);
  await calendar.getByRole("button", { name: "Next month" }).click();
  await expect(
    calendar.getByRole("grid", { name: "November 2026 Calendar" }),
  ).toBeVisible();
  expect(
    await calendar
      .locator(".revo-calendar__calendar")
      .evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test("range selection does not use the single-date moving highlight", async ({
  page,
}) => {
  await page.goto("/components/calendar-and-dates/");
  const example = page.locator("#example-range-calendar");
  const target = example
    .locator('[data-calendar-date="2026-10-20"]:not([aria-hidden])')
    .first();
  await target.click();
  await expect(
    example.locator(".revo-calendar__selection-indicator"),
  ).toHaveCount(0);
});

test("calendar changes month and year without revealing animation by default", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/calendar-and-dates/");
  const calendar = page.locator("#example-calendar .revo-calendar").first();
  await calendar.getByRole("button", { name: "Choose month: October 2026" }).click();
  const yearGrid = calendar.locator(".revo-calendar__year-grid");
  await expect(yearGrid).toBeVisible();
  expect(await yearGrid.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await calendar.getByRole("button", { name: "Next year" }).click();
  await expect(calendar.getByRole("group", { name: "Choose month 2027" })).toBeVisible();
  expect(await yearGrid.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});
