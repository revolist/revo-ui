import { expect, test } from '@playwright/test';

test('segmented tabs slide between selections and honor reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/tabs-and-lists/');
  const tabs = page.getByRole('tablist', { name: 'Editor tabs' });
  const choices = tabs.getByRole('tab');
  const idleColor = await choices
    .nth(1)
    .evaluate((element) => getComputedStyle(element).color);
  await choices.nth(1).hover();
  await expect
    .poll(() =>
      choices.nth(1).evaluate((element) => getComputedStyle(element).color),
    )
    .not.toBe(idleColor);
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveAttribute('aria-selected', 'true');
  const indicator = tabs.locator('.rv-segmented-switch-indicator');
  await expect(indicator).toHaveCount(1);
  expect(
    await indicator.evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  const frames = await indicator.evaluate((element) => {
    const frames = (
      element.getAnimations()[0].effect as KeyframeEffect
    ).getKeyframes();
    return frames.map((frame) => {
      const matrix = new DOMMatrix(String(frame.transform));
      return { x: matrix.m41, scale: matrix.a };
    });
  });
  expect(frames[1].x).toBeCloseTo(frames[2].x);
  expect(frames[1].scale).toBeLessThan(frames[2].scale);
  await expect(indicator).toHaveCount(0);
  await choices.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  await expect(choices.first()).toHaveAttribute('aria-selected', 'true');
  await expect(indicator).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.waitForTimeout(50);
  await expect(indicator).toHaveCount(0);
});

test('API sidebar search focus ring fits inside the sidebar', async ({
  page,
}) => {
  await page.goto('/api/');
  const search = page.getByRole('searchbox', { name: 'Find an API component' });
  await search.focus();
  const inset = await search.evaluate((element) => {
    const sidebar = element.closest('.api-sidebar')!.getBoundingClientRect();
    const field = element.getBoundingClientRect();
    return Math.min(field.left - sidebar.left, sidebar.right - field.right);
  });
  expect(inset).toBeGreaterThanOrEqual(4);
});

test('selected segment compresses on press only when motion is enabled', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/tabs-and-lists/');
  const selected = page
    .getByRole('tablist', { name: 'Editor tabs' })
    .getByRole('tab')
    .first();
  const box = await selected.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect
    .poll(() =>
      selected.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe('none');
  await page.mouse.up();
  await page
    .locator('.catalog')
    .evaluate((element) => element.setAttribute('data-rv-ui-motion', 'off'));
  await page.mouse.down();
  await expect(selected).toHaveCSS('transform', 'none');
  await page.mouse.up();
});
