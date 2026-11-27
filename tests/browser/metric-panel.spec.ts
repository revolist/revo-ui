import { expect, test } from '@playwright/test';

test('metric panel composes tiles and reflows without overflow', async ({
  page,
}, info) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/metric-panel/index.html');
  const panel = page.getByRole('group', { name: 'Campaign performance' });
  await expect(panel.locator('.rv-metric-tile')).toHaveCount(6);
  await expect(
    panel.locator('.rv-metric-tile__detail.is-negative'),
  ).toHaveCount(2);
  await expect(
    page.getByRole('group', { name: 'Composed' }).locator('dt'),
  ).toHaveText('Revenue');
  await expect(
    page
      .getByRole('group', { name: 'Composed' })
      .locator('.rv-metric-tile__detail'),
  ).toHaveCSS('color', 'rgb(21, 128, 61)');
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await panel.evaluate((element) => {
      const tiles = [...element.querySelectorAll('.rv-metric-tile')].map(
        (tile) => tile.getBoundingClientRect(),
      );
      return {
        overflow: element.scrollWidth - element.clientWidth,
        firstRow: tiles.filter((tile) => tile.top === tiles[0].top).length,
        firstHeight: tiles[0].height,
      };
    });
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    expect(geometry.firstRow).toBe(width === 1280 ? 6 : 2);
    expect(geometry.firstHeight).toBeGreaterThanOrEqual(92);
    await panel.screenshot({
      path: info.outputPath(`metric-panel-${width}.png`),
    });
  }
  await page
    .locator('html')
    .evaluate((element) => element.setAttribute('data-theme', 'dark'));
  await expect(panel.locator('.rv-metric-tile').first()).toHaveCSS(
    'background-color',
    'rgb(31, 31, 31)',
  );
});

test('variant content remains consistent', async ({ page }) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/metric-panel/index.html');
  const variants = page.getByRole('group', { name: 'Variants' });
  await expect(variants.locator('.rv-metric-tile__extra')).toHaveText([
    'Visual extra',
    'Summary extra',
  ]);
  await expect(variants.locator('.summary-preset')).toHaveCount(1);
});
