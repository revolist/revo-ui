import { expect, test } from '@playwright/test';

test('slider retains keyboard and pointer interaction with hover and press feedback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/sliders/');
  const slider = page.getByRole('slider', { name: 'Volume', exact: true });
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('8');
  await slider.blur();
  await page.mouse.move(0, 0);
  const idle = await slider.screenshot();
  const box = await slider.boundingBox();
  const thumbX = box!.x + 10 + (box!.width - 20) * 0.8;
  await page.mouse.move(thumbX, box!.y + box!.height / 2);
  await page.waitForTimeout(180);
  const hovered = await slider.screenshot();
  expect(hovered.equals(idle)).toBe(false);
  await page.mouse.down();
  await page.waitForTimeout(180);
  const pressed = await slider.screenshot();
  expect(pressed.equals(hovered)).toBe(false);
  await page.mouse.move(box!.x + box!.width * 0.4, box!.y + box!.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  expect(Number(await slider.inputValue())).toBeLessThan(8);
  await expect(
    page.getByRole('slider', { name: 'Legacy code' }),
  ).toBeDisabled();
});

test('slider press remains visually still with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/sliders/');
  const slider = page.getByRole('slider', { name: 'Volume', exact: true });
  const box = await slider.boundingBox();
  await page.mouse.move(
    box!.x + 10 + (box!.width - 20) * 0.7,
    box!.y + box!.height / 2,
  );
  const before = await slider.screenshot();
  await page.mouse.down();
  const after = await slider.screenshot();
  expect(after.equals(before)).toBe(true);
  await page.mouse.up();
});

test('range slider preserves native keyboard interaction and the motion-off setting', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/sliders/');
  const slider = page.getByRole('slider', { name: 'Minimum amount' });
  const before = Number(await slider.inputValue());
  await slider.focus();
  await slider.press('ArrowRight');
  expect(Number(await slider.inputValue())).toBeGreaterThan(before);
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await page
    .locator('.catalog')
    .evaluate((element) => element.setAttribute('data-rv-ui-motion', 'off'));
  const box = await volume.boundingBox();
  await page.mouse.move(
    box!.x + 10 + (box!.width - 20) * 0.7,
    box!.y + box!.height / 2,
  );
  const hovered = await volume.screenshot();
  await page.mouse.down();
  const pressed = await volume.screenshot();
  expect(pressed.equals(hovered)).toBe(true);
  await page.mouse.up();
});
