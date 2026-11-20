import { setGalleryPreference } from './gallery-preferences';
import { test, expect } from './gallery-test';

test.use({ gallerySections: ['calendar-and-dates'] });

test('keeps keyboard focus while paging and switching calendar views', async ({
  page,
}) => {
  await page.goto('/#components');
  const calendar = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Multiple dates', exact: true }),
  });
  const next = calendar.getByRole('button', { name: 'Next month' });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  await expect(
    calendar.getByRole('grid', { name: 'November 2026 Calendar' }),
  ).toBeVisible();

  const chooseMonth = calendar.getByRole('button', {
    name: 'Choose month: November 2026',
  });
  await chooseMonth.focus();
  await page.keyboard.press('Enter');
  await expect(calendar.getByRole('button', { name: 'November' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(chooseMonth).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(
    calendar.locator('[data-calendar-date="2026-11-01"]:not([aria-hidden])'),
  ).toBeFocused();
});

test('moves across two visible months and keeps one grid tab stop in RTL', async ({
  page,
}) => {
  await page.goto('/#components');
  await setGalleryPreference(page, 'Right to left', true);
  const calendar = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Range calendar', exact: true }),
  });
  const day = (date: string) =>
    calendar.locator(`[data-calendar-date="${date}"]:not([aria-hidden])`);
  await day('2026-10-31').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(day('2026-11-01')).toBeFocused();
  await expect(
    calendar.locator('[data-calendar-date][tabindex="0"]'),
  ).toHaveCount(1);
  await page.keyboard.press('ArrowRight');
  await expect(day('2026-10-31')).toBeFocused();
});
