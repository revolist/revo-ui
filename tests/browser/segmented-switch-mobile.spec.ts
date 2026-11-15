import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';
for (const theme of ['light', 'dark']) {
  test(`mobile selected segment and focus stay inside the track (${theme})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      baseURL: String(test.info().project.use.baseURL),
    });
    try {
      const page = await context.newPage();
      await page.goto('/components/tabs-and-lists/');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const settings = page.getByRole('button', {
        name: 'More gallery options',
        exact: true,
      });
      if ((await settings.getAttribute('aria-expanded')) === 'true')
        await settings.click();
      const group = page.getByRole('tablist', { name: 'Editor tabs' });
      const first = group.getByRole('tab').nth(0);
      const second = group.getByRole('tab').nth(1);
      await first.tap();
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await first.press('ArrowRight');
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await second.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(second).toBeFocused();
      const paint = await second.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          height: el.getBoundingClientRect().height,
          outline: style.outlineStyle,
          offset: parseFloat(style.outlineOffset),
          shadow: style.boxShadow,
        };
      });
      expect(paint.height).toBe(31);
      expect(paint.outline).toBe('solid');
      expect(paint.offset).toBeLessThanOrEqual(-2);
      expect(paint.shadow === 'none' || paint.shadow.includes('inset')).toBe(
        true,
      );
      await expect(group).toHaveCSS('height', '37px');
      await expect(first).toHaveCSS('height', '31px');
      await page.screenshot({
        path: test.info().outputPath(`segmented-${theme}.png`),
      });
    } finally {
      await context.close();
    }
  });
}
