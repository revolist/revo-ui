import { expect, test } from '@playwright/test';

test('portalled selected options and checkboxes follow the gallery accent', async ({
  page,
}) => {
  await page.goto('/components/multi-selects-autocomplete/');
  const customize = page.getByRole('button', {
    name: 'Customize',
    exact: true,
  });
  for (const [color, rgb, dark] of [
    ['Pink', 'rgb(219, 39, 119)', false],
    ['Green', 'rgb(5, 150, 105)', true],
  ] as const) {
    if (dark)
      await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await customize.click();
    await page.getByRole('button', { name: color, exact: true }).click();
    await customize.click();
    const expected = await page.locator('.catalog').evaluate((root) => {
      const sample = document.createElement('span');
      sample.style.backgroundColor = 'var(--rv-ui-selected-bg)';
      root.append(sample);
      const result = getComputedStyle(sample).backgroundColor;
      sample.remove();
      return result;
    });
    await page.getByRole('combobox', { name: 'Multiple views' }).click();
    const popup = page.locator('.revo-dropdown-menu:visible');
    const selected = popup.locator('.dropdown-option.selected').first();
    await expect(selected).toHaveCSS('background-color', expected);
    await expect(selected.locator('input[type=checkbox]')).toHaveCSS(
      'accent-color',
      rgb,
    );
    await page.keyboard.press('Escape');
  }
});
