import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const gallery = '/components/calendar-and-dates/';

test.beforeEach(async ({ page }) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
});

test('pages a controlled date strip and selects via a roving keyboard target', async ({
  page,
}) => {
  await page.goto(gallery);
  const calendar = page.getByRole('group', { name: 'Delivery date' });
  const stripBounds = (await calendar.boundingBox())!;
  const footerBounds = (await page
    .locator('#example-mini-calendar .catalog-row')
    .boundingBox())!;
  expect(
    Math.abs(
      stripBounds.x +
        stripBounds.width / 2 -
        footerBounds.x -
        footerBounds.width / 2,
    ),
  ).toBeLessThan(1);
  const day = (date: string) => calendar.locator(`[data-date="${date}"]`);
  await expect(day('2026-11-21')).toHaveAttribute('aria-current', 'date');
  await expect(day('2026-11-21')).toHaveAttribute('aria-pressed', 'true');
  await day('2026-11-21').focus();
  await page.keyboard.press('End');
  await expect(day('2026-11-25')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(day('2026-11-26')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(day('2026-12-01')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(day('2026-12-01')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#example-mini-calendar output')).toHaveText(
    '2026-12-01',
  );
  await expect(calendar.locator('[data-date][tabindex="0"]')).toHaveCount(1);
  await page
    .locator('#example-mini-calendar')
    .getByRole('button', { name: 'Today' })
    .click();
  await expect(day('2026-11-21')).toHaveAttribute('aria-pressed', 'true');
});

test('skips unavailable days, stops at bounds and moves visually in RTL', async ({
  page,
}) => {
  await page.goto(gallery);
  const calendar = page.getByRole('group', { name: 'Shift date' });
  await expect(
    calendar.getByRole('button', { name: 'Previous 7 days' }),
  ).toBeDisabled();
  await expect(calendar.locator('[data-date="2026-11-18"]')).toBeDisabled();
  await calendar.locator('[data-date="2026-11-17"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(calendar.locator('[data-date="2026-11-19"]')).toBeFocused();
  const next = calendar.getByRole('button', { name: 'Next 7 days' });
  await next.click();
  await next.click();
  await expect(next).toBeDisabled();
  await expect(calendar.locator('[data-date="2026-12-06"]')).toBeEnabled();
  const rtl = page.getByRole('group', { name: 'تاریخ تحویل' });
  await expect(rtl.getByRole('button', { name: '۳ روز بعد' })).toBeVisible();
  await rtl.locator('[data-date="2026-11-22"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(rtl.locator('[data-date="2026-11-23"]')).toBeFocused();
});

for (const theme of ['light', 'dark']) {
  test(`keeps the strip usable at 320px and passes scoped accessibility checks in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto(gallery);
    const calendar = page.getByRole('group', { name: 'Shift date' });
    const bounds = await calendar.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await calendar.locator('[data-date="2026-11-19"]').focus();
    await page.keyboard.press('End');
    const day = calendar.locator('[data-date="2026-11-22"]');
    await expect(day).toBeFocused();
    const visible = await day.boundingBox();
    const strip = await calendar.locator('[data-part="days"]').boundingBox();
    expect(visible!.x + visible!.width).toBeLessThanOrEqual(
      strip!.x + strip!.width,
    );
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    expect(
      await calendar.evaluate(async (element) => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe;
        return (
          await axe.run(element, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
          })
        ).violations.map(({ id }) => id);
      }),
    ).toEqual([]);
  });
}
