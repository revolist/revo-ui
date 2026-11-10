import { test, expect } from './gallery-test';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../package.json', import.meta.url));
const axeScript = require.resolve('axe-core/axe.min.js');

for (const width of [320, 1280]) {
  test(`tooltip gallery documents expanded APIs and usable examples at ${width}px`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/tooltip/');
    await expect(
      page.getByRole('heading', { name: 'Tooltip', exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Tooltip API and accessibility guidance',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Read the complete tooltip guide' }),
    ).toHaveAttribute('href', /docs\/tooltip\.md$/);
    const rich = page.getByRole('button', {
      name: 'Rich export hint',
      exact: true,
    });
    await rich.focus();
    const popup = page.getByRole('tooltip');
    await expect(popup.locator('strong')).toHaveText('CSV export');
    await rich.press('Escape');
    const asyncTrigger = page.getByRole('button', {
      name: 'Load report details',
      exact: true,
    });
    await asyncTrigger.focus();
    await expect(popup).toHaveText('Quarterly budget: ready for review.');
    await expect(
      page.getByRole('status').filter({ hasText: 'Report details loaded.' }),
    ).toBeVisible();
    await asyncTrigger.press('Escape');
    const click = page.getByRole('button', {
      name: 'Click-triggered hint',
      exact: true,
    });
    await click.focus();
    await click.press('Enter');
    await expect(popup).toHaveText(
      'Click again, press Escape, or click outside to dismiss.',
    );
    await click.press('Escape');
    await expect(popup).toHaveCount(0);
    await page
      .getByRole('button', {
        name: 'Disabled hint, working button',
        exact: true,
      })
      .click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Working button clicks: 1.' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`tooltip-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await page.addScriptTag({ path: axeScript });
    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
      const result = await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
      return result.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      }));
    });
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('tooltip generated API exposes positioning, async loading and state callbacks', async ({
  page,
}) => {
  await page.goto('/api/tooltip/');
  await expect(
    page.getByRole('heading', { name: 'Tooltip API', exact: true }).first(),
  ).toBeVisible();
  for (const name of [
    'collisionBoundary',
    'sideOffset',
    'loadContent',
    'onBeforeOpenChange',
    'onOpenChangeComplete',
  ]) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  }
});
