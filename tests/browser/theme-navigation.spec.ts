import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';

for (const width of [1280, 390]) {
  test(`gallery keeps the chosen theme across navigation and reloads at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const theme = page.locator('button[aria-label="Theme"]');
    await chooseOption(theme, 'Dark');
    const expectTheme = async (dark: boolean) => {
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        dark ? 'dark' : 'light',
      );
      await expect
        .poll(() =>
          page
            .locator('.catalog')
            .evaluate((element) =>
              getComputedStyle(element)
                .getPropertyValue('--rv-ui-color-scheme')
                .trim(),
            ),
        )
        .toBe(dark ? 'dark' : 'light');
      await expect(theme).toHaveAttribute('aria-pressed', String(dark));
    };
    await expectTheme(true);
    for (const name of ['Components', 'Colors', 'Docs', 'API', 'Overview']) {
      await page
        .getByRole('navigation', { name: 'Library pages' })
        .getByRole('link', { name, exact: true })
        .click();
      await expectTheme(true);
    }
    await page.reload();
    await expectTheme(true);
    await page.goto('/accessibility/');
    await expectTheme(true);
    await chooseOption(theme, 'Light');
    await page.goto('/colors/');
    await expectTheme(false);
    await page.reload();
    await expectTheme(false);
  });
}

test('unavailable storage leaves the theme toggle usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  const theme = page.locator('button[aria-label="Theme"]');
  await chooseOption(theme, 'Dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await chooseOption(theme, 'Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('stored dark theme applies before the gallery application starts', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-theme', 'dark'));
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'script'
      ? route.abort()
      : route.continue(),
  );
  await page.goto('/colors/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Production pages already contain static gallery markup before JS starts.
  if (await page.locator('.catalog').count()) {
    await expect
      .poll(() =>
        page
          .locator('.catalog')
          .evaluate((element) =>
            getComputedStyle(element)
              .getPropertyValue('--rv-ui-color-scheme')
              .trim(),
          ),
      )
      .toBe('dark');
  }
});

test('invalid stored themes fall back to light', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('revo-ui-theme', 'invalid'),
  );
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.catalog')).toBeVisible();
});
