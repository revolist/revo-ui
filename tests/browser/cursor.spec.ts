import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);

for (const theme of ['light', 'dark']) {
  test(`collaborator cursors remain readable in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto('/components/cursor/');
    const colors = page.locator(
      '#example-collaborator-colors .catalog-specimen',
    );
    const parts = page.locator(
      '#example-composable-cursor-parts .catalog-specimen',
    );
    await expect(colors.locator('.rv-cursor')).toHaveCount(5);
    await expect(
      parts.getByText('Reviewing the totals', { exact: true }),
    ).toBeVisible();
    await expect(parts.locator('.rv-cursor').first()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(parts.locator('[data-part="pointer"]').last()).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await colors.evaluate(async (element: HTMLElement) => {
      const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
      const result = await axe.run(element, { runOnly: ['color-contrast'] });
      return result.violations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map((node) => node.target),
      }));
    });
    expect(violations).toEqual([]);
  });
}

test('updates physical coordinates and leaves underlying controls clickable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/components/cursor/');
  const example = page.locator('#example-live-collaborator-positions');
  const cursor = example.locator('.rv-cursor');
  await expect(cursor).toHaveCSS('translate', '18px 24px');
  await expect(cursor).toHaveCSS('pointer-events', 'none');
  await example.getByRole('button', { name: 'Mark reviewed' }).click();
  await expect(example.getByRole('status')).toHaveText('Reviews marked: 1');
  const move = example.getByRole('button', { name: 'Move collaborator' });
  await move.focus();
  await page.keyboard.press('Enter');
  await expect(cursor).toHaveCSS('translate', '108px 64px');
  await expect(move).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(cursor).toHaveCSS('transition-duration', '0s');
  await move.click();
  await expect(cursor).toHaveCSS('translate', '52px 103px');
});
