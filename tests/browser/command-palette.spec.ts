import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark']) {
  test(`command palette searches and executes using keyboard in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/command-palette/');
    await page.getByRole('button', { name: 'Open commands' }).click();
    const dialog = page.getByRole('dialog', { name: 'Commands' });
    const search = dialog.getByRole('searchbox', { name: 'Search commands' });
    await expect(search).toBeFocused();
    await search.fill('project');
    await page.keyboard.press('ArrowDown');
    const item = dialog.getByRole('button', { name: /Open project/ });
    await expect(item).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByText('open', { exact: true })).toBeVisible();
  });
}
