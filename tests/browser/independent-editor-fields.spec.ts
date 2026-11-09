import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';
test.use({ gallerySections: ['assignee-field'] });
for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`standalone assignee fields stage changes without a grid in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/components/assignee-field/');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await page
        .getByRole('button', { name: 'Assign people', exact: true })
        .click();
      const picker = page.getByRole('dialog', {
        name: 'Assign people',
        exact: true,
      });
      await expect(picker).toBeVisible();
      expect(await picker.locator('revo-grid').count()).toBe(0);
      const dialog = (await picker.boundingBox())!;
      const search = (await picker.getByRole('searchbox').boundingBox())!;
      expect(search.x - dialog.x).toBeGreaterThanOrEqual(12);
      expect(search.y - dialog.y).toBeGreaterThanOrEqual(12);
      const rows = await picker.locator('.rv-resource-picker__option').all();
      const a = (await rows[0].boundingBox())!,
        b = (await rows[1].boundingBox())!;
      expect(b.y - a.y - a.height).toBeGreaterThanOrEqual(4);
      expect(a.x - dialog.x).toBeGreaterThanOrEqual(12);
      expect(
        await picker.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      expect(dialog.x).toBeGreaterThanOrEqual(0);
      expect(dialog.x + dialog.width).toBeLessThanOrEqual(width);
      await picker.screenshot({
        path: info.outputPath('assignee-popup.png'),
        animations: 'disabled',
      });
      await picker.getByRole('checkbox').nth(1).check();
      await picker
        .getByRole('spinbutton', { name: 'Units for Bea' })
        .fill('75');
      await expect(
        picker.getByRole('button', { name: 'Save', exact: true }),
      ).toHaveCount(0);
      // Dismiss on inert chrome; the example heading now links to documentation.
      await page.locator('.catalog-topbar').click({ position: { x: 4, y: 4 } });
      await expect(picker).toHaveCount(0);
      await expect(
        page.locator('output').filter({ hasText: '"units":75' }),
      ).toHaveCount(1);
    });
  }
