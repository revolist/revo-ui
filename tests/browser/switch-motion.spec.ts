import { expect, test } from '@playwright/test';

test('switch thumb gives bounded press feedback in both directions and states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/selection-controls/');
  const control = page.getByRole('switch', { name: 'Enable notifications' });
  const thumb = control.locator('.rv-switch-thumb');
  for (const direction of ['ltr', 'rtl']) {
    await control.evaluate(
      (element, dir) => element.setAttribute('dir', dir),
      direction,
    );
    for (const checked of [false, true]) {
      await control.setChecked(checked);
      await page.waitForTimeout(200);
      const box = await control.boundingBox();
      await page.mouse.move(box!.x + box!.width - 5, box!.y + box!.height / 2);
      await page.mouse.down();
      await expect
        .poll(() =>
          thumb.evaluate((element) => getComputedStyle(element).transform),
        )
        .not.toBe('none');
      await page.waitForTimeout(150);
      const bounds = await control
        .locator('.rv-switch-track')
        .evaluate((track) => {
          const t = track.getBoundingClientRect();
          const k = track
            .querySelector('.rv-switch-thumb')!
            .getBoundingClientRect();
          return [k.left - t.left, t.right - k.right];
        });
      expect(Math.min(...bounds)).toBeGreaterThanOrEqual(-0.1);
      await page.mouse.up();
    }
  }
});

test('switch press is still when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/selection-controls/');
  const control = page.getByRole('switch', { name: 'Enable notifications' });
  const box = await control.boundingBox();
  await page.mouse.move(box!.x + box!.width - 5, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect(control.locator('.rv-switch-thumb')).toHaveCSS(
    'transform',
    'none',
  );
  await page.mouse.up();
});

test('toggle hover highlight has space and the thumb settles after changing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/selection-controls/');
  const control = page.getByRole('switch', { name: 'Enable notifications' });
  await control.hover();
  await expect
    .poll(() =>
      control.evaluate(
        (element) => getComputedStyle(element, '::before').opacity,
      ),
    )
    .toBe('1');
  const insets = await control.evaluate((element) => {
    const style = getComputedStyle(element, '::before');
    return [style.left, style.right];
  });
  expect(insets).toEqual(['-8px', '-8px']);
  const thumb = control.locator('.rv-switch-thumb');
  await control.click();
  const frames = await thumb.evaluate((element) => {
    const animation = element
      .getAnimations()
      .find((item) => item.effect?.getTiming().duration === 280)!;
    return (animation.effect as KeyframeEffect)
      .getKeyframes()
      .map((frame) => new DOMMatrix(String(frame.transform)).a);
  });
  expect(frames[1]).toBeLessThan(frames[2]);
  await expect(control).toHaveAttribute('aria-checked', 'false');
});

test('toggle does not add settle animation when motion is off', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/selection-controls/');
  await page
    .locator('.catalog')
    .evaluate((element) => element.setAttribute('data-rv-ui-motion', 'off'));
  const control = page.getByRole('switch', { name: 'Enable notifications' });
  await control.click();
  expect(
    await control
      .locator('.rv-switch-thumb')
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});

test('compact toggles settle in both writing directions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/selection-controls/');
  const control = page.getByRole('switch', { name: 'Enable notifications' });
  await control.evaluate((element) => element.classList.add('rv-switch-sm'));
  for (const direction of ['ltr', 'rtl']) {
    await control.evaluate(
      (element, value) => element.setAttribute('dir', value),
      direction,
    );
    for (const checked of [false, true]) {
      await control.setChecked(checked);
      const settling = await control
        .locator('.rv-switch-thumb')
        .evaluate((element) =>
          element
            .getAnimations()
            .some(
              (animation) => animation.effect?.getTiming().duration === 280,
            ),
        );
      expect(settling).toBe(true);
      await page.waitForTimeout(300);
    }
  }
});
