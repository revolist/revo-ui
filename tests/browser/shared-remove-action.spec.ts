import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test.use({
  gallerySections: ['field-configurators', 'selects-chips-and-resources'],
});

for (const theme of ['light', 'dark'])
  test(`remove actions share neutral styling and motion in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.goto(process.env.UI_REMOVE_GALLERY_URL ?? '/');
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    const field = page.getByRole('button', {
      name: 'Remove sample Fields Country',
      exact: true,
    });
    const tag = page.getByRole('button', { name: 'Remove Table', exact: true });
    const multi = page.getByRole('combobox', {
      name: 'Multiple views',
      exact: true,
    });
    for (const button of [field, tag]) {
      await expect(button).toHaveClass(/rv-remove-button/);
      await expect(button).toHaveCSS('border-top-width', '0px');
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(button.locator('svg')).toHaveCSS('width', '12px');
      await expect(button.locator('svg')).toHaveCSS('height', '12px');
    }
    expect(await field.locator('svg').evaluate((e) => e.innerHTML)).toBe(
      await tag.locator('svg').evaluate((e) => e.innerHTML),
    );
    await expect(field).toHaveCSS(
      'color',
      theme === 'light' ? 'rgb(102, 102, 102)' : 'rgb(163, 163, 163)',
    );
    // Dropdown tag palettes own the remove glyph's foreground for contrast.
    await expect
      .poll(() =>
        tag.evaluate(
          (element) =>
            getComputedStyle(element).color ===
            getComputedStyle(element.parentElement!).color,
        ),
      )
      .toBe(true);
    await expect(field).toHaveCSS('width', '28px');
    await expect(tag).toHaveCSS('width', '24px');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const button of [field, tag]) {
      await button.hover();
      await expect(button.locator('svg')).toHaveCSS('transform', 'none');
      await expect(button).not.toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(tag.locator('svg')).toHaveCSS('transform', 'none');
    await page
      .getByRole('heading', { name: 'Multiple selection', exact: true })
      .hover();
    await tag.locator('..').screenshot({
      path: testInfo.outputPath(`multiple-selection-remove-${theme}.png`),
    });
    await tag.click();
    await expect(tag).toHaveCount(0);
    await expect(multi).toHaveAttribute('aria-expanded', 'false');
    await field.click();
    await expect(field).toHaveCount(0);
  });

test('chip remove remains a native keyboard action without opening the dropdown', async ({
  page,
}) => {
  await page.goto(process.env.UI_REMOVE_GALLERY_URL ?? '/');
  const remove = page.getByRole('button', {
    name: 'Remove Table',
    exact: true,
  });
  await remove.focus();
  await remove.press('Enter');
  await expect(remove).toHaveCount(0);
  await expect(
    page.getByRole('combobox', { name: 'Multiple views', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
});
