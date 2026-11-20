import { expect, test } from "@playwright/test";

test("stepper rolls changed digits in the direction of a button step", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/inputs-and-forms/");
  const group = page.getByRole("group", { name: "Priority" });
  const value = group.getByRole("spinbutton", { name: "Priority" });
  const increase = group.getByRole("button", { name: "Increase priority" });
  await increase.click();
  await expect(value).toHaveValue("3");
  const overlay = group.locator(".rv-number-stepper__rolling-value");
  await expect(overlay).toHaveAttribute("aria-hidden", "true");
  const transforms = await overlay
    .locator(".rv-number-stepper__digit span")
    .first()
    .evaluate((element) =>
      (element.getAnimations()[0].effect as KeyframeEffect)
        .getKeyframes()
        .map((frame) => frame.transform),
    );
  expect(transforms[1]).toContain("-100%");
  await expect(overlay).toHaveCount(0);
  await group.getByRole("button", { name: "Decrease priority" }).click();
  await expect(value).toHaveValue("2");
  await expect(overlay).toBeAttached();
  const reverse = await overlay
    .locator(".rv-number-stepper__digit span")
    .first()
    .evaluate((element) =>
      (element.getAnimations()[0].effect as KeyframeEffect)
        .getKeyframes()
        .map((frame) => frame.transform),
    );
  expect(reverse[1]).toContain("100%");
  await value.fill("8");
  await expect(value).toHaveValue("8");
  await expect(overlay).toHaveCount(0);
});

test("stepper updates immediately when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/inputs-and-forms/");
  const group = page.getByRole("group", { name: "Priority" });
  await group.getByRole("button", { name: "Increase priority" }).click();
  await expect(group.getByRole("spinbutton", { name: "Priority" })).toHaveValue(
    "3",
  );
  await expect(group.locator(".rv-number-stepper__rolling-value")).toHaveCount(
    0,
  );
});

test("rapid steps settle on the accessible value and respect bounds and motion off", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/components/inputs-and-forms/");
  const group = page.getByRole("group", { name: "Priority" });
  const input = group.getByRole("spinbutton", { name: "Priority" });
  const add = group.getByRole("button", { name: "Increase priority" });
  await add.click({ clickCount: 3, delay: 30 });
  await expect(input).toHaveValue("5");
  await expect(group.locator(".rv-number-stepper__rolling-value")).toHaveCount(
    0,
  );
  await expect(input).not.toHaveClass(/rv-number-stepper__animating/);
  await input.fill("100");
  await expect(add).toBeDisabled();
  await input.fill("2");
  await page
    .locator(".catalog")
    .evaluate((element) => element.setAttribute("data-rv-ui-motion", "off"));
  await add.click();
  await expect(input).toHaveValue("3");
  await expect(group.locator(".rv-number-stepper__rolling-value")).toHaveCount(
    0,
  );
});
