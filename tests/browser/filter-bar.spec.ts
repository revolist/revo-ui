import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark'])
  test(`filter bar works from keyboard in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/filter-bar/');
    const group = page.getByRole('group', { name: 'Filters' });
    const search = group.getByRole('searchbox', { name: 'Search records' });
    await search.fill('report');
    await expect(search).toHaveValue('report');
    const remove = group.getByRole('button', { name: 'Remove Status' });
    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(group.getByText('Status: Open')).toHaveCount(0);
  });
