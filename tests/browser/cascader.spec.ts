import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark']) {
  test(`cascader selects a leaf by keyboard in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/cascader/');
    const trigger = page.getByRole('button', { name: /^Location:/ });
    await trigger.click();
    const tree = page.getByRole('tree', { name: 'Location' });
    const parent = tree.getByRole('treeitem', { name: /Europe/ });
    await expect(parent).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const child = tree.getByRole('treeitem', { name: 'Portugal' });
    await expect(child).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Portugal');
    await expect(trigger).toBeFocused();
  });
}
