import { expect, test } from './gallery-test';
import { chooseOption } from './choose-option';

test.use({ hasTouch: true });
for (const width of [320, 1280]) {
  test(`timeline movement and resizing work with taps at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/timeline-track/');
    await page.getByText('Edit timeline events', { exact: true }).tap();
    const build = page
      .getByRole('group', { name: 'Build', exact: true })
      .filter({ has: page.locator('legend') });
    await expect(build.locator('output')).toHaveText('08:00 – 12:00');
    await build.getByRole('button', { name: 'Move later', exact: true }).tap();
    await expect(build.locator('output')).toHaveText('09:00 – 13:00');
    await build
      .getByRole('button', { name: 'Start earlier', exact: true })
      .tap();
    await expect(build.locator('output')).toHaveText('08:00 – 13:00');
    await build.getByRole('button', { name: 'End later', exact: true }).tap();
    await expect(build.locator('output')).toHaveText('08:00 – 14:00');
    await build
      .getByRole('button', { name: 'Move earlier', exact: true })
      .tap();
    await build.getByRole('button', { name: 'Start later', exact: true }).tap();
    await build.getByRole('button', { name: 'End earlier', exact: true }).tap();
    await expect(build.locator('output')).toHaveText('08:00 – 12:00');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test(`field ordering works with taps at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/field-configurators/');
    const fields = page.getByRole('region', {
      name: 'Pivot selected fields',
      exact: true,
    });
    const names = fields.locator('.rv-configurator-field-content');
    const before = await names.allTextContents();
    expect(before).toHaveLength(4);
    const down = fields.getByRole('button', {
      name: 'Move down: Country',
      exact: true,
    });
    await down.tap();
    await expect(names).toHaveText([before[1], before[0], ...before.slice(2)]);
    await fields
      .getByRole('button', { name: 'Move up: Country', exact: true })
      .tap();
    await expect(names).toHaveText(before);
    await expect(
      fields.getByRole('button', { name: 'Move up: Country', exact: true }),
    ).toBeDisabled();
    await chooseOption(
      fields.getByRole('combobox', { name: 'Field to move' }),
      'Category',
    );
    await fields
      .getByRole('button', { name: 'Move up: Category', exact: true })
      .tap();
    await expect(names).toHaveText([
      before[0],
      before[1],
      before[3],
      before[2],
    ]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('panel width has tap controls without dragging', async ({ page }) => {
  await page.goto('/components/layout/');
  const value = page.getByLabel('Panel width value');
  await expect(value).toHaveText('180px');
  await page.getByRole('button', { name: 'Widen panel', exact: true }).tap();
  await expect(value).toHaveText('190px');
  await page.getByRole('button', { name: 'Narrow panel', exact: true }).tap();
  await expect(value).toHaveText('180px');
});
