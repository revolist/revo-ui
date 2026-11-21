import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark'])
  test(`trace details open from keyboard in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/trace/');
    const region = page.getByRole('region', { name: 'Run' });
    await expect(region).toContainText('Complete');
    const summary = region.locator('summary').first();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(region.getByText('Found 12 records')).toBeVisible();
  });
