import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';
for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`single time selection sits beside the calendar and stacks on mobile in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/#calendar-and-dates');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const example = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', {
          name: 'Date field with calendar and time popup',
          exact: true,
        }),
      });
      await example
        .getByRole('button', { name: 'Choose date', exact: true })
        .click();
      const popup = page.locator('.rv-editor-popup');
      const time = popup.getByLabel('Time', { exact: true });
      await expect(time).toBeVisible();
      await expect(time.locator('..').locator('span')).toHaveText('Time');
      const panel = await popup.locator('.rv-time-selection').boundingBox();
      const calendar = await popup.locator('.revo-calendar').boundingBox();
      if (width === 1280)
        expect(panel!.x).toBeGreaterThan(calendar!.x + calendar!.width);
      else expect(panel!.y).toBeGreaterThan(calendar!.y + calendar!.height);
      expect(
        await popup.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await time.focus();
      await expect(time).toBeFocused();
      await time.fill('10:30');
      await expect(
        popup.getByRole('button', { name: 'Apply', exact: true }),
      ).toHaveCount(0);
      await time.press('Enter');
      await expect(popup).toHaveCount(0);
      await expect(example.locator('input').first()).toHaveValue(
        '2026-10-12T10:30',
      );
      await example
        .getByRole('button', { name: 'Choose date', exact: true })
        .click();
      await expect(popup).toHaveCSS('opacity', '1');
      await popup.screenshot({
        path: info.outputPath('single-time-popup.png'),
        animations: 'disabled',
      });
    });
  }

test.use({ gallerySections: ['calendar-and-dates'] });

for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`range dates and times stay paired in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/#calendar-and-dates');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const card = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', {
          name: 'Shared date/time editor options',
          exact: true,
        }),
      });
      await card.scrollIntoViewIfNeeded();
      const picker = card.locator('.rv-temporal-picker');
      const header = picker.locator('.rv-temporal-picker__header');
      for (const end of ['Start', 'End']) {
        const date = header.getByRole('textbox', {
          name: `${end} date`,
          exact: true,
        });
        const time = header.getByRole('textbox', {
          name: `${end} time`,
          exact: true,
        });
        await expect(date).toHaveCSS('font-size', '14px');
        await expect(time).toHaveCSS('font-size', '14px');
        const d = (await date.boundingBox())!,
          t = (await time.boundingBox())!;
        expect(Math.abs(d.y - t.y)).toBeLessThan(1);
        expect(t.x - d.x - d.width).toBeGreaterThanOrEqual(5.5);
        expect(d.height).toBe(32);
        expect(t.height).toBe(32);
      }
      const first = header.getByRole('textbox', {
        name: 'Start date',
        exact: true,
      });
      await first.focus();
      await page.keyboard.press('Tab');
      await expect(
        header.getByRole('textbox', { name: 'Start time', exact: true }),
      ).toBeFocused();
      await header
        .getByRole('textbox', { name: 'Start time', exact: true })
        .fill('11:30:00');
      await expect(
        card.getByRole('status', { name: 'Selected date/time value' }),
      ).toContainText('11:30:00');
      await header
        .getByRole('textbox', { name: 'End time', exact: true })
        .fill('18:45:00');
      await expect(
        card.getByRole('status', { name: 'Selected date/time value' }),
      ).toContainText('18:45:00');
      const h = (await header.boundingBox())!,
        c = (await picker.locator('.revo-calendar').boundingBox())!;
      expect(h.y + h.height).toBeLessThanOrEqual(c.y);
      expect(
        await card.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await card.screenshot({
        path: info.outputPath('range-time.png'),
        animations: 'disabled',
        style: '.catalog-topbar { visibility: hidden; }',
      });
    });
  }
