import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['calendar-and-dates'] });

for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`date/time options are arranged clearly in ${theme} at ${width}px`, async ({
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
      const gap = await card.evaluate((element) => {
        const top = element.getBoundingClientRect().top;
        let previous = element.previousElementSibling;
        let closestBottom = -Infinity;
        while (previous) {
          closestBottom = Math.max(
            closestBottom,
            previous.getBoundingClientRect().bottom,
          );
          previous = previous.previousElementSibling;
        }
        return top - closestBottom;
      });
      expect(gap).toBeGreaterThanOrEqual(24);
      const settings = card.getByRole('group', { name: 'Configuration' });
      const preview = card.locator('.catalog-temporal-preview');
      const bounds = await settings.boundingBox();
      const previewBounds = await preview.boundingBox();
      if (width === 1280)
        expect(previewBounds!.x).toBeGreaterThan(bounds!.x + bounds!.width);
      else expect(previewBounds!.y).toBeGreaterThan(bounds!.y + bounds!.height);
      await chooseOption(
        settings.getByRole('combobox', { name: 'Value', exact: true }),
        'Date',
      );
      await chooseOption(
        settings.getByRole('combobox', { name: 'Selection', exact: true }),
        'Single',
      );
      await expect(
        card.getByRole('status', { name: 'Selected date/time value' }),
      ).toHaveText('No date selected');
      await expect(
        card.getByRole('checkbox', { name: 'Week numbers', exact: true }),
      ).toBeChecked();
      await card
        .getByRole('checkbox', { name: 'Week numbers', exact: true })
        .uncheck();
      await expect(card.locator('.revo-calendar__week-number')).toHaveCount(0);
      await card
        .getByRole('checkbox', { name: 'Week numbers', exact: true })
        .check();
      await card.screenshot({
        path: info.outputPath('date-time-card.png'),
        style: '.catalog-topbar { visibility: hidden; }',
      });
      for (const count of ['1', '2', '3']) {
        await chooseOption(
          settings.getByRole('combobox', { name: 'Months', exact: true }),
          count,
        );
        expect(
          await card.evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true);
      }
      await chooseOption(
        settings.getByRole('combobox', { name: 'Value', exact: true }),
        'Time',
      );
      await expect(card.locator('.revo-calendar')).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
