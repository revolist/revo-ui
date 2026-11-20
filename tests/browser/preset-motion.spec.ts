import { test, expect } from "@playwright/test";
import { chooseOption } from "./choose-option";

test("animation JSON previews and exports a custom switch animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/customize/");
  const editor = page.locator(".theme-editor").first();
  await chooseOption(editor.getByLabel("Component"), "Switch");
  await editor.getByText("Animation (JSON)", { exact: true }).click();
  const config = {
    settle: {
      duration: 900,
      keyframes: [{ transform: "scaleX(1)" }, { transform: "scaleX(0.5)" }],
    },
  };
  await editor.getByLabel("Animation settings").fill(JSON.stringify(config));
  await editor.getByRole("button", { name: "Apply animation" }).click();
  const custom = page
    .locator(".theme-samples > div")
    .last()
    .getByRole("switch", { name: "Enabled" });
  await custom.click();
  const timing = await custom
    .locator(".rv-switch-thumb")
    .evaluate((element) =>
      element
        .getAnimations()
        .map((animation) => animation.effect?.getTiming().duration),
    );
  expect(timing).toContain(900);
  const download = page.waitForEvent("download");
  await editor.getByRole("button", { name: "JSON", exact: true }).click();
  const stream = await (await download).createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString();
  expect(JSON.parse(text).components.Switch.custom.motion).toEqual(config);
  await page
    .locator(".catalog")
    .evaluate((element) => element.setAttribute("data-rv-ui-motion", "off"));
  await custom.click();
  expect(
    await custom
      .locator(".rv-switch-thumb")
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});

test("slider animation JSON exports usable scoped CSS", async ({ page }) => {
  await page.goto("/customize/");
  const editor = page.locator(".theme-editor").first();
  await chooseOption(editor.getByLabel("Component"), "SliderField");
  await editor.getByText("Animation (JSON)", { exact: true }).click();
  await editor.getByLabel("Animation settings").fill(
    JSON.stringify({
      hover: {
        duration: 500,
        keyframes: [{ transform: "scale(1)" }, { transform: "scale(1.25)" }],
      },
    }),
  );
  await editor.getByRole("button", { name: "Apply animation" }).click();
  const slider = page
    .locator(".theme-samples > div")
    .last()
    .getByRole("slider", { name: "Value" });
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  const value = Number(await slider.inputValue());
  await page.mouse.move(
    box!.x + 10 + ((box!.width - 20) * value) / 10,
    box!.y + box!.height / 2,
  );
  await page.waitForTimeout(600);
  const customized = await slider.screenshot();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await slider.screenshot();
  expect(customized.equals(reduced)).toBe(false);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(600);
  await page
    .locator(".catalog")
    .evaluate((element) => element.setAttribute("data-rv-ui-motion", "off"));
  const motionOff = await slider.screenshot();
  expect(customized.equals(motionOff)).toBe(false);
  await page
    .locator(".catalog")
    .evaluate((element) => element.removeAttribute("data-rv-ui-motion"));
  await page.waitForTimeout(600);
  await page.addStyleTag({
    content:
      ".rv-theme-slider-field-custom input::-webkit-slider-thumb:hover { animation: none !important; transform: scale(1) !important; }",
  });
  const baseline = await slider.screenshot();
  expect(customized.equals(baseline)).toBe(false);
  const download = page.waitForEvent("download");
  await editor
    .getByRole("button", { name: "CSS", exact: true })
    .click();
  const stream = await (await download).createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString();
  expect(text).toContain(
    "@keyframes rv-motion-rv-theme-slider-field-custom-hover",
  );
  expect(text).toContain("scale(1.25)");
  expect(text).toContain("prefers-reduced-motion: reduce");
});

test("custom selection, calendar and digit animations run in the preview", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/customize/");
  const editor = page.locator(".theme-editor").first();
  const configure = async (component: string, motion: object) => {
    await chooseOption(editor.getByLabel("Component"), component);
    const section = editor.getByText("Animation (JSON)", { exact: true });
    if (!(await editor.getByLabel("Animation settings").isVisible()))
      await section.click();
    await editor.getByLabel("Animation settings").fill(JSON.stringify(motion));
    await editor.getByRole("button", { name: "Apply animation" }).click();
  };
  await configure("SegmentedSwitch", {
    selection: {
      duration: 800,
      keyframes: [
        { transform: "translateX(0px)" },
        { transform: "translateX({{distance}}px)" },
      ],
    },
  });
  const custom = page.locator(".theme-samples > div").last();
  await custom.getByRole("tab", { name: "Second" }).click();
  const selection = custom.locator(".rv-segmented-switch-indicator");
  await expect(selection).toBeAttached();
  expect(
    await selection.evaluate(
      (element) => element.getAnimations()[0].effect?.getTiming().duration,
    ),
  ).toBe(800);
  await configure("Calendar", {
    period: { duration: 750, stagger: 8 },
    caption: { enabled: false },
  });
  const calendar = custom.locator(".revo-calendar");
  await calendar.getByRole("button", { name: "Next month" }).click();
  const grid = calendar.locator(".revo-calendar__month-grid");
  await expect
    .poll(() =>
      grid.evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .some((animation) => animation.effect?.getTiming().duration === 750),
      ),
    )
    .toBe(true);
  await configure("NumberStepper", { digits: { duration: 700 } });
  await custom.getByRole("button", { name: "Increase" }).click();
  const digit = custom.locator(".rv-number-stepper__digit span").first();
  await expect(digit).toBeAttached();
  expect(
    await digit.evaluate(
      (element) => element.getAnimations()[0].effect?.getTiming().duration,
    ),
  ).toBe(700);
});
