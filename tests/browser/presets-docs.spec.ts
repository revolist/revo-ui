import { expect, test } from '@playwright/test';

test('themes guide displays diagrams, instructions and navigation on desktop and mobile', async ({
  page,
}) => {
  await page.goto('/frameworks/presets/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Themes and presets' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation navigation' })
      .getByRole('link', { name: 'Themes and presets' }),
  ).toHaveAttribute('aria-current', 'page');
  const diagrams = page.locator('.markdown-guide img');
  await expect(diagrams).toHaveCount(2);
  for (const diagram of await diagrams.all()) {
    await diagram.scrollIntoViewIfNeeded();
    await expect(diagram).toBeVisible();
    expect(
      await diagram.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    ).toBe(true);
  }
  await expect(
    page.getByRole('heading', { name: 'Configure other behavior with JSON' }),
  ).toBeVisible();
  await diagrams.nth(1).screenshot({ path: '/tmp/revo-ui-preset-anatomy.png' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/revo-ui-themes-guide.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.markdown-guide')).toBeVisible();
  await expect(
    page.getByText('Scroll to explore the diagram').first(),
  ).toBeVisible();
  expect(
    await page
      .locator('.documentation-figure-scroll')
      .first()
      .evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  await page.screenshot({ path: '/tmp/revo-ui-themes-guide-mobile.png' });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor').first();
  await expect(
    editor.getByRole('link', { name: 'Read the themes and presets guide' }),
  ).toHaveAttribute('href', '/frameworks/presets/');
});

test('documentation navigation opens the customization workspace', async ({
  page,
}) => {
  await page.goto('/frameworks/presets/');
  const link = page
    .getByRole('navigation', { name: 'Documentation navigation' })
    .getByRole('link', { name: 'Customize components', exact: true });
  await expect(link).toHaveAttribute('href', '/customize/');
  await link.click();
  await expect(page).toHaveURL(/\/customize\/$/);
  await expect(
    page.getByRole('heading', { name: 'Make it yours.' }),
  ).toBeVisible();
});
