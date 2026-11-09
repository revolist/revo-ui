import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['activity-messages'] });

test('activity messages use a light flat surface and compact content-aligned actions', async ({
  page,
}, info) => {
  await page.goto('/#activity-messages');
  const message = page.locator('#activity-messages .rv-activity-message');
  const card = message.locator('.rv-activity-message-card');
  await expect(message).toBeVisible();
  await expect(message.locator('.rv-activity-message-header')).toContainText(
    'Priya Shah',
  );
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await expect(card).toHaveCSS('box-shadow', 'none');
      expect(
        await card.evaluate(
          (element) =>
            getComputedStyle(element).backgroundColor ===
            getComputedStyle(element.closest('.catalog-example')!)
              .backgroundColor,
        ),
      ).toBe(false);
      await expect(
        message.getByRole('button', { name: 'View change ↗' }),
      ).toHaveClass(/rv-btn-link/);
      const geometry = await message.evaluate((element) => {
        const card = element.querySelector('.rv-activity-message-card')!;
        const body = element
          .querySelector('.rv-activity-message-content')!
          .getBoundingClientRect();
        const actions = element
          .querySelector('.rv-activity-message-actions')!
          .getBoundingClientRect();
        return {
          height: card.getBoundingClientRect().height,
          overflow: element.scrollWidth - element.clientWidth,
          alignment: Math.abs(body.left - actions.left),
          gap: actions.top - body.bottom,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.alignment).toBeLessThanOrEqual(1);
      expect(geometry.gap).toBeLessThanOrEqual(8);
      expect(geometry.height).toBeLessThan(180);
      await message.screenshot({
        path: info.outputPath(`activity-message-${width}-${theme}.png`),
      });
    }
  }
});
