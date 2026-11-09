import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['status-and-feedback'] });

test('shared alerts stay compact and consistent across themes and narrow layouts', async ({
  page,
}, info) => {
  await page.goto('/#status-and-feedback');
  const example = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Alerts', exact: true }),
  });
  const status = example.getByRole('status');
  const danger = example.getByRole('alert');
  await expect(status).toHaveText('Changes saved');
  await expect(danger.locator('.rv-alert__title')).toHaveText(
    'A value needs attention',
  );
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      for (const alert of [status, danger]) {
        await expect(alert).toHaveCSS('border-top-width', '0px');
        await expect(alert).toHaveCSS('font-size', '14px');
        await expect(alert).toHaveCSS('line-height', '20px');
        await expect(alert).toHaveCSS('padding-top', '12px');
        await expect(alert).toHaveCSS('padding-inline-start', '16px');
        await expect(alert.locator('.rv-alert__icon svg')).toHaveCSS(
          'width',
          '16px',
        );
        expect(
          await alert.evaluate(
            (element) => element.scrollWidth - element.clientWidth,
          ),
        ).toBeLessThanOrEqual(1);
      }
      expect((await status.boundingBox())!.height).toBeLessThanOrEqual(46);
      const statusBackground = await status.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      await expect(danger).not.toHaveCSS('background-color', statusBackground);
      await example.screenshot({
        path: info.outputPath(`alerts-${width}-${theme}.png`),
      });
    }
  }
  await danger.locator('.rv-alert__description').evaluate((element) => {
    element.textContent = 'A_long_unbroken_validation_message_'.repeat(20);
  });
  expect(
    await danger.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
