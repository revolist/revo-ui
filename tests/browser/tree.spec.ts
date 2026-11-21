import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark']) {
  test(`tree supports keyboard selection in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/tree/');
    const tree = page.getByRole('tree', { name: 'Files' });
    const folder = tree.getByRole('treeitem', { name: /Projects/ });
    await expect(folder.locator('.rv-tree-disclosure svg')).toBeVisible();
    await folder.focus();
    await page.keyboard.press('ArrowRight');
    const file = tree.getByRole('treeitem', { name: 'Product brief' });
    await expect(file).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(file).toHaveAttribute('aria-selected', 'true');
    await expect(file).toHaveCSS('background-color', /.+/);
    await page.keyboard.press('ArrowLeft');
    await expect(folder).toBeFocused();
  });
}
