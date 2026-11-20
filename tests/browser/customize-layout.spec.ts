import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`customize swatches and focus rings fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/customize/');
    const editor = page.locator('.theme-editor--standalone');
    const swatches = editor.locator('.theme-editor-swatches');
    const buttons = swatches.getByRole('button');
    await expect(buttons).toHaveCount(8);
    const geometry = await swatches.evaluate(fieldset => {
      const list = fieldset.querySelector('div')!;
      const bounds = list.getBoundingClientRect();
      const parent = fieldset.closest('.customize-settings')!.getBoundingClientRect();
      return Array.from(list.querySelectorAll('button')).map(button => {
        const box = button.getBoundingClientRect();
        return { left: box.left - bounds.left, right: bounds.right - box.right, parentRight: parent.right - box.right };
      });
    });
    for (const item of geometry) {
      expect(item.left).toBeGreaterThanOrEqual(5);
      expect(item.right).toBeGreaterThanOrEqual(5);
      expect(item.parentRight).toBeGreaterThanOrEqual(5);
    }
    await buttons.last().focus();
    await expect(buttons.last()).toHaveCSS('outline-style', 'solid');
    await buttons.last().click();
    await expect(buttons.last()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.customize-section-heading > span')).toHaveCount(0);
  });
}

test('searches and previews multiple customized components', async ({ page }) => {
  await page.goto('/customize/');
  const preview = page.locator('.customize-preview');
  await expect(preview.getByRole('region', { name: 'Button preview' })).toBeVisible();
  await expect(preview.getByText('Default', { exact: true })).toHaveCount(0);
  await page.locator('.theme-editor--standalone').getByRole('combobox', { name: 'Component', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search components to edit' }).fill('checkbox');
  await page.getByRole('option', { name: 'Checkbox', exact: true }).click();
  await expect(preview.getByRole('region', { name: 'Checkbox preview' })).toBeVisible();
  await page.locator('.theme-editor--standalone').getByRole('button', { name: 'Accent #059669' }).click();
  await expect(preview.getByRole('region', { name: 'Checkbox preview' }).locator('.rv-theme-checkbox-custom').first()).toHaveCSS('--rv-ui-accent', '#059669');
  await expect(preview.getByRole('region', { name: 'Button preview' }).getByRole('button', { name: 'Save', exact: true })).toHaveCSS('background-color', 'rgb(5, 150, 105)');
  await expect(page.getByText('Additional components', { exact: true })).toHaveCount(0);
  await page.locator('.theme-editor--standalone').getByRole('button', { name: 'Remove Checkbox' }).click();
  await expect(preview.getByRole('region', { name: 'Checkbox preview' })).toHaveCount(0);
  await expect(preview.getByRole('region', { name: 'Button preview' })).toBeVisible();
});

test('radius slider uses the available width on desktop and fits on mobile', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/customize/');
    const field = page.locator('.theme-editor--standalone .rv-slider-field').filter({ has: page.getByRole('slider', { name: 'Corner radius' }) });
    const geometry = await field.evaluate(element => {
      const fieldBox = element.getBoundingClientRect();
      const trackBox = element.querySelector('.rv-slider-field__track')!.getBoundingClientRect();
      const sliderBox = element.querySelector('input[type="range"]')!.getBoundingClientRect();
      return { className: element.className, grid: getComputedStyle(element).gridTemplateColumns, field: fieldBox.width, track: trackBox.width, slider: sliderBox.width, left: sliderBox.left - fieldBox.left, right: fieldBox.right - sliderBox.right };
    });
    expect(geometry.slider).toBeGreaterThan(geometry.track * 0.95);
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeGreaterThanOrEqual(0);
    expect(geometry.track, JSON.stringify(geometry)).toBeGreaterThan(geometry.field * (width > 520 ? 0.4 : 0.6));
  }
});

test('component picker searches and selects a component to edit', async ({ page }) => {
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  const picker = editor.getByRole('combobox', { name: 'Component', exact: true });
  await picker.click();
  await page.getByRole('textbox', { name: 'Search components to edit' }).fill('calendar');
  await page.getByRole('option', { name: 'Calendar', exact: true }).click();
  await expect(picker).toContainText('Calendar');
  await expect(page.getByRole('region', { name: 'Calendar preview' })).toBeVisible();
});


test('behavior defaults offer an example for the selected component', async ({ page }) => {
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  await editor.getByText('More behavior defaults (JSON)').click();
  const example = editor.locator('.theme-editor-behavior-example');
  await expect(example).toContainText('Example for Button');
  await expect(example.locator('code')).toContainText('"disabled": true');
  await example.getByRole('button', { name: 'Use example' }).click();
  await expect(editor.getByLabel('Behavior defaults')).toHaveValue('{\n  "disabled": true\n}');
  await editor.getByRole('button', { name: 'Apply defaults' }).click();
  await expect(page.getByRole('region', { name: 'Button preview' }).getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('loading the PDF preview preserves the page color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('revo-ui-theme', 'light'));
  await page.goto('/customize/');
  const root = page.locator('html');
  const before = await root.evaluate(element => getComputedStyle(element).colorScheme);
  await page.locator('.theme-editor--standalone').getByRole('combobox', { name: 'Component', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search components to edit' }).fill('PdfViewer');
  await page.getByRole('option', { name: 'PdfViewer', exact: true }).click();
  await expect(page.getByRole('region', { name: 'PdfViewer preview' }).locator('.rv-pdf-viewer canvas').first()).toBeVisible();
  await expect(root).toHaveCSS('color-scheme', before);
});

test('button preset starts primary and allows another variant', async ({ page }) => {
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  const sample = page.getByRole('region', { name: 'Button preview' }).getByRole('button', { name: 'Save', exact: true });
  await expect(sample).toHaveCSS('background-color', 'rgb(109, 40, 217)');
  await editor.getByRole('button', { name: 'Accent #059669' }).click();
  await expect(sample).toHaveCSS('background-color', 'rgb(5, 150, 105)');
  await editor.getByRole('combobox', { name: 'Variant', exact: true }).click();
  await page.getByRole('option', { name: 'secondary', exact: true }).click();
  await expect(sample).not.toHaveCSS('background-color', 'rgb(5, 150, 105)');
});

test('pane preview gives its content room inside the frame', async ({ page }) => {
  await page.goto('/customize/?component=Pane');
  const pane = page.getByRole('region', { name: 'Pane preview' }).locator('.rv-editor-pane');
  await expect(pane).toBeVisible();
  const spacing = await pane.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element.firstElementChild!.firstChild!);
    const content = range.getBoundingClientRect();
    const frame = element.getBoundingClientRect();
    return { left: content.left - frame.left, top: content.top - frame.top };
  });
  expect(spacing.left).toBeGreaterThanOrEqual(16);
  expect(spacing.top).toBeGreaterThanOrEqual(16);
});
