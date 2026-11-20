import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`dropdown and calendar branding at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    if (width <= 1200) await page.getByRole('button', { name: 'More gallery options' }).click();
    const logo = page.locator('.catalog-logo');
    for (const theme of ['light', 'dark']) {
      await expect(logo).toHaveAttribute('src', '/logo-mark.svg');
      await expect(page.locator('.catalog-wordmark')).toHaveText('RevoUI');
      expect(await page.locator('.catalog-wordmark').evaluate(element => getComputedStyle(element).fontFamily === getComputedStyle(document.body).fontFamily)).toBe(true);
      expect(await logo.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width <= 1200) await page.getByRole('button', { name: 'More gallery options' }).click();
      await page.screenshot({ path: `test-results/branding-${theme}-${width}.png` });
      if (width <= 1200) await page.getByRole('button', { name: 'More gallery options' }).click();
      await page.getByRole('button', { name: 'Theme', exact: true }).click();
    }
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    for (const name of ['logo.svg', 'logo-dark.svg', 'logo-mark.svg', 'favicon.svg']) {
      const response = await page.request.get(`/${name}`);
      expect(response.ok()).toBe(true);
      const svg = await response.text();
      expect(svg).toContain('<svg');
      expect(svg).not.toMatch(/<image|data:image/);
      if (name.startsWith('logo.') || name === 'logo-dark.svg') expect(svg).toContain('<text');
    }
  });
}
