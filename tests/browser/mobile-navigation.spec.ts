import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';

for (const width of [320, 390, 760]) {
  for (const theme of ['Light', 'Dark']) {
    test(`mobile navigation is a full-height plain list at ${width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/components/buttons/');
      await chooseOption(page.locator('button[aria-label="Theme"]'), theme);
      await page.keyboard.press('Escape');
      await page
        .getByRole('button', { name: 'Browse components', exact: true })
        .click();
      const sidebar = page.locator('#component-navigation');
      await expect(sidebar).toBeVisible();
      const links = sidebar.locator('.catalog-nav-group > a');
      const buttonLike = await links.evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = getComputedStyle(element);
            return (
              style.borderTopWidth !== '0px' || style.borderRadius !== '0px'
            );
          })
          .map((element) => element.textContent),
      );
      expect(buttonLike).toEqual([]);
      await expect
        .poll(async () => {
          const bounds = (await sidebar.boundingBox())!;
          return Math.abs(bounds.y + bounds.height - 844);
        })
        .toBeLessThanOrEqual(1);
      await expect(page.locator('.catalog-content')).toBeHidden();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBeLessThanOrEqual(845);
      if (width === 390)
        await page.screenshot({
          path: info.outputPath(`mobile-navigation-${theme.toLowerCase()}.png`),
        });
      const search = sidebar.getByRole('searchbox', {
        name: 'Find a component',
      });
      const searchBounds = (await search.boundingBox())!;
      const close = page.getByRole('button', {
        name: 'Close navigation',
        exact: true,
      });
      const closeBounds = (await close.boundingBox())!;
      expect(
        Math.abs(
          searchBounds.y +
            searchBounds.height / 2 -
            closeBounds.y -
            closeBounds.height / 2,
        ),
      ).toBeLessThanOrEqual(1);
      await expect(close).toHaveText('');
      expect(closeBounds.width).toBeGreaterThanOrEqual(40);
      expect(Math.abs(searchBounds.width - (width - 96))).toBeLessThanOrEqual(
        1,
      );
      const searchTop = searchBounds.y;
      const navigation = sidebar.getByRole('navigation', {
        name: 'Component sections',
      });
      await navigation.hover();
      await page.mouse.wheel(0, 900);
      await expect
        .poll(() => navigation.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
      expect(
        Math.abs((await search.boundingBox())!.y - searchTop),
      ).toBeLessThanOrEqual(1);
      const header = sidebar.locator('.catalog-navigation-tools');
      const headerBounds = (await header.boundingBox())!;
      expect((await navigation.boundingBox())!.y).toBeGreaterThanOrEqual(
        headerBounds.y + headerBounds.height,
      );
      expect(
        await header.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return !!document
            .elementFromPoint(bounds.x + 2, bounds.y + 2)
            ?.closest('nav');
        }),
      ).toBe(false);
      if (width === 390)
        await page.screenshot({
          path: info.outputPath(
            `mobile-navigation-scrolled-${theme.toLowerCase()}.png`,
          ),
        });
      await search.fill('tabs');
      await expect(links).toHaveCount(1);
      await sidebar
        .getByRole('link', { name: 'Tabs and lists', exact: true })
        .click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Tabs and lists',
      );
      await expect(sidebar).toBeHidden();
    });
  }
}

test('closing mobile navigation and resizing to desktop restores the article', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/buttons/');
  await page
    .getByRole('button', { name: 'Browse components', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Close navigation', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Browse components', exact: true }),
  ).toBeFocused();
  await expect(page.locator('#component-navigation')).toBeHidden();
  await expect(page.locator('.catalog-content')).toBeVisible();
  await page
    .getByRole('button', { name: 'Browse components', exact: true })
    .click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator('.catalog-content')).toBeVisible();
  await expect(page.locator('#component-navigation')).toBeVisible();
  await expect(page.locator('.catalog-mobile-nav')).toBeHidden();
});
