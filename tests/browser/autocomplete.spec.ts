import { expect, test } from './gallery-test';
import { chooseOption } from './choose-option';
test.use({ gallerySections: ['selects-chips-and-resources'] });

for (const width of [1280, 390]) {
  test(`editable autocomplete filters in the input and supports keyboard and pointer selection at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/selects-chips-and-resources/');
    const input = page.getByRole('combobox', {
      name: 'Autocomplete view',
      exact: true,
    });
    await expect(input).toHaveJSProperty('tagName', 'INPUT');
    await input.fill('boa');
    const options = page.getByRole('option');
    await expect(options).toHaveCount(1);
    await expect(options).toHaveText('Board');
    await expect(input).toBeFocused();
    await expect(page.locator('.dropdown-search-input')).toHaveCount(0);
    await expect(input).toHaveAttribute('aria-activedescendant', /option-0$/);
    await input.press('Enter');
    await expect(input).toHaveValue('Board');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Selected autocomplete view')).toHaveText(
      'board',
    );
    await input.fill('tab');
    await options.getByText('Table', { exact: true }).click();
    await expect(input).toHaveValue('Table');
    await expect(input).toBeFocused();
    await input.fill('not an option');
    await expect(options).toHaveCount(0);
    await input.press('Escape');
    await expect(input).toHaveValue('Table');
    await input.fill('boa');
    await input.press('Tab');
    await expect(input).not.toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveValue('Table');
  });

  test(`tags create entries only when selected and retain removable chips at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/selects-chips-and-resources/');
    const input = page.getByRole('combobox', { name: 'Skills', exact: true });
    await input.fill('Svelte');
    await expect(page.locator('[data-create-option=true]')).toHaveText(
      '+Svelte',
    );
    await expect(page.getByLabel('Selected skills')).toHaveText('TypeScript');
    await input.press('Enter');
    await expect(page.getByLabel('Selected skills')).toHaveText(
      'TypeScript, Svelte',
    );
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await input.fill('Svelte');
    await expect(page.locator('[data-create-option=true]')).toHaveCount(0);
    await input.press('Escape');
    const card = page.locator('#example-editable-tags');
    for (const theme of ['Light', 'Dark']) {
      await chooseOption(page.locator('button[aria-label="Theme"]'), theme);
      await page.keyboard.press('Escape');
      await card.screenshot({
        path: info.outputPath(`tags-${theme.toLowerCase()}-${width}.png`),
      });
    }
    await card
      .getByRole('button', { name: 'Remove Svelte', exact: true })
      .click();
    await expect(page.getByLabel('Selected skills')).toHaveText('TypeScript');
    await expect(input).toBeFocused();
  });
}

test('editable combobox does not commit Enter during composition and preserves the select-only variant', async ({
  page,
}) => {
  await page.goto('/components/selects-chips-and-resources/');
  const input = page.getByRole('combobox', {
    name: 'Autocomplete view',
    exact: true,
  });
  await input.fill('boa');
  await input.evaluate((element) =>
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  await expect(page.getByLabel('Selected autocomplete view')).toHaveText(
    'No selection',
  );
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Escape');
  const original = page.getByRole('combobox', {
    name: 'Searchable view',
    exact: true,
  });
  await expect(original).toHaveJSProperty('tagName', 'DIV');
  await original.click();
  await expect(
    page.getByRole('textbox', { name: 'Search options' }),
  ).toBeVisible();
});
