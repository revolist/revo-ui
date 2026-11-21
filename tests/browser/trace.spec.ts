import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark'])
  test(`trace details open from keyboard in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/trace/');
    await expect(page).toHaveURL('/components/accordion/#example-trace');
    await expect(
      page.getByRole('heading', { name: 'Accordion', level: 1, exact: true }),
    ).toBeVisible();
    await expect(page.locator('#example-accordion-sections')).toBeVisible();
    const region = page.getByRole('region', { name: 'Run' });
    await expect(region).toContainText('Complete');
    const summary = region.locator('summary').first();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(region.getByText('Found 12 records')).toBeVisible();
  });
