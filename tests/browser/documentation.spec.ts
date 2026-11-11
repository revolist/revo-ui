import { expect, test } from '@playwright/test';

test('SSR and bundle guides have sidebar pages, rendered Markdown and working local anchors', async ({
  page,
}) => {
  await page.goto('/frameworks/');
  const navigation = page.getByRole('navigation', {
    name: 'Documentation navigation',
  });
  await navigation.getByRole('link', { name: 'SSR', exact: true }).click();
  await expect(page).toHaveURL(/\/frameworks\/ssr\/$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Server rendering and hydration',
    }),
  ).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: 'SSR', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('article pre code').first()).toContainText(
    'import',
  );
  await expect(page.locator('article table').first()).toBeVisible();
  await expect(page).toHaveTitle('Server rendering and hydration · Revo UI');
  await page.screenshot({ path: test.info().outputPath('ssr-desktop.png') });
  await page.getByRole('link', { name: 'style families', exact: true }).click();
  await expect(page).toHaveURL(
    /\/frameworks\/bundle-size\/#stylesheet-families$/,
  );
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Stylesheet families',
      exact: true,
    }),
  ).toBeInViewport();
  await expect(
    navigation.getByRole('link', { name: 'Bundle size', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Bundle size and selective styles · Revo UI');
});

for (const route of ['ssr', 'bundle-size']) {
  test(`${route} guide keeps tables and code readable on mobile without page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/frameworks/${route}/`);
    await expect(page.locator('article h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`${route}-mobile.png`),
    });
    const table = page.locator('.documentation-table').first();
    expect(
      await table.evaluate((node) => node.scrollWidth > node.clientWidth),
    ).toBe(true);
    await table.evaluate((node) => (node.scrollLeft = node.scrollWidth));
    expect(await table.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  });
}
