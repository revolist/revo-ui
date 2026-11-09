import { expect, test } from '@playwright/test';
for (const width of [390, 1280])
  test(`one tooltip presentation escapes clipping at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/tests/browser/fixtures/tooltip/index.html');
    const hints = page.locator('.rv-tooltip:visible');
    const style = async () =>
      hints.evaluate((el) => {
        const css = getComputedStyle(el);
        return [
          css.backgroundColor,
          css.color,
          css.padding,
          css.borderRadius,
          css.fontSize,
          css.boxShadow,
        ];
      });
    await page.getByRole('button', { name: 'Bold', exact: true }).hover();
    await expect(hints).toHaveCount(1);
    await expect(hints).toHaveText('Bold');
    const expected = await style();
    for (const [label, text] of [
      ['Clear formatting', 'Clear formatting'],
      ['Help', 'Formatting help'],
    ]) {
      await page.getByRole('button', { name: label, exact: true }).hover();
      await expect(hints).toHaveCount(1);
      await expect(hints).toHaveText(text);
      expect(await style()).toEqual(expected);
      expect(await hints.evaluate((el) => el.matches(':popover-open'))).toBe(
        true,
      );
      const box = await hints.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    await page.keyboard.press('Escape');
    await expect(hints).toHaveCount(0);
    await page.getByRole('listitem').focus();
    await expect(hints).toHaveCount(1);
    await expect(hints).toContainText('2 items');
    expect(await style()).toEqual(expected);
    await page.keyboard.press('Escape');
    await expect(hints).toHaveCount(0);
  });

test('selection lists reveal clipped names, including rich templates, and preserve selection', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html');
  const longName =
    'Workflow automation for the quarterly international planning review';
  const hints = page.locator('.rv-tooltip:visible');
  const option = page
    .getByRole('listbox', { name: 'Task choices' })
    .getByRole('option', { name: longName });
  await option.hover();
  await expect(hints).toHaveText(longName);
  await expect(option).toHaveAttribute(
    'aria-describedby',
    (await hints.getAttribute('id')) as string,
  );
  await page.keyboard.press('Escape');
  await expect(hints).toHaveCount(0);
  await expect(option).not.toHaveAttribute('aria-describedby');
  await option.focus();
  await expect(hints).toHaveText(longName);
  await page.getByRole('option', { name: 'Short', exact: true }).hover();
  await expect(hints).toHaveCount(0);
  await page.locator('.rich-label').hover();
  await expect(hints).toHaveText(longName);
  await page.locator('.filter-list-option input').check();
  await expect(page.locator('.filter-list-option input')).toBeChecked();
  await page.getByRole('combobox', { name: 'Department' }).click();
  await page.locator('.dropdown-option').filter({ hasText: longName }).hover();
  await expect(hints).toHaveText(longName);
  await page.keyboard.press('Escape');
  await expect(hints).toHaveCount(0);
  // The first Escape dismisses the tooltip; the next closes its dropdown.
  await page.keyboard.press('Escape');
  await expect(page.locator('.dropdown-option')).not.toBeVisible();
  await page.locator('.rv-resource-picker__details strong').hover();
  await expect(hints).toHaveText(longName);
});

test('resource dropdown reveals clipped active names while focus stays in search', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html');
  await page
    .getByRole('combobox', { name: 'Dropdown owners', exact: true })
    .click();
  const search = page.getByRole('searchbox', {
    name: 'Search dropdown owners',
    exact: true,
  });
  await expect(search).toBeFocused();
  const hints = page.locator('.rv-tooltip:visible');
  const longName =
    'Workflow automation for the quarterly international planning review';
  await search.press('ArrowDown');
  await expect(hints).toHaveText(`Second ${longName}`);
  await expect(search).toBeFocused();
  await search.press('ArrowUp');
  await expect(hints).toHaveText(longName);
  await search.press('Escape');
  await expect(hints).toHaveCount(0);
});
