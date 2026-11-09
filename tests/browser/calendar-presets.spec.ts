import { test, expect } from './gallery-test';

test.use({ gallerySections: ['calendar-and-dates'] });
test('calendar presets obey the same validator as day cells', async ({
  page,
}) => {
  await page.goto('/#components');
  const card = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Calendar presets', exact: true }),
  });
  const day = (date: string) =>
    card.locator(
      `button[data-calendar-date="${date}"]:not([aria-hidden="true"])`,
    );
  await card.getByRole('button', { name: 'Tomorrow', exact: true }).click();
  await expect(card.getByRole('status')).toHaveText('Tomorrow is unavailable.');
  await expect(day('2026-10-24')).toHaveAttribute('aria-selected', 'true');
  await day('2026-10-25').click();
  await expect(day('2026-10-25')).not.toHaveAttribute('aria-selected', 'true');
  await expect(day('2026-10-24')).toHaveAttribute('aria-selected', 'true');
  await card.getByRole('button', { name: 'In a week', exact: true }).click();
  await expect(day('2026-10-31')).toHaveAttribute('aria-selected', 'true');
  await expect(card.getByRole('status')).toHaveCount(0);
});
