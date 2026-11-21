import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);

for (const theme of ['light', 'dark']) {
  test(`File Tree supports change status and keyboard disclosure in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto('/components/file-tree/');
    const list = page.getByRole('list', { name: 'Project changes' });
    const src = list.locator('summary').filter({ hasText: /^src$/ });
    const main = list.getByRole('button', { name: 'main.ts M' });
    const format = list.getByRole('button', { name: 'format.ts A' });
    const docs = list.locator('summary').filter({ hasText: /^docs$/ });
    const notes = list.getByRole('button', { name: 'notes.md' });
    const legacy = list.getByRole('button', { name: 'legacy.md D' });
    await expect(main).toHaveAttribute('aria-current', 'true');
    await expect(main).toHaveAccessibleDescription('Modified');
    await expect(format).toHaveAccessibleDescription('Added');
    await expect(legacy).toHaveAccessibleDescription('Deleted');
    await expect(main.locator('[data-part=status]')).toHaveText('M');
    await expect(format.locator('[data-part=status]')).toHaveText('A');
    await expect(legacy.locator('[data-part=status]')).toHaveText('D');
    await expect(notes).toBeHidden();
    await src.focus();
    await page.keyboard.press('Tab');
    await expect(main).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(format).toBeFocused();
    await page.keyboard.press('Space');
    await expect(format).toHaveAttribute('aria-current', 'true');
    await expect(main).not.toHaveAttribute('aria-current', 'true');
    await page.keyboard.press('Tab');
    await expect(docs).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(legacy).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(docs).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(notes).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(notes).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(notes).toHaveAttribute('aria-current', 'true');
    await page.getByRole('button', { name: 'Collapse all' }).click();
    await expect(notes).toBeHidden();
    await expect(main).toBeHidden();
    await page.getByRole('button', { name: 'Expand all' }).click();
    await expect(notes).toBeVisible();
    await expect(main).toBeVisible();
    await expect(
      page
        .getByRole('list', { name: 'Generated files' })
        .getByRole('button', { name: 'main.ts', exact: true }),
    ).toHaveCount(1);

    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await list.evaluate(async (element: HTMLElement) => {
      const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
      return (
        await axe.run(element, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
        })
      ).violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      }));
    });
    expect(violations).toEqual([]);
  });
}
