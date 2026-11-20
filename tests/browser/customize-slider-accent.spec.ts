import { chooseOption } from './choose-option';
import { expect, test } from '@playwright/test';

test('radius slider follows the accent selected in the preset editor', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-gallery-global-theme-v1', JSON.stringify({ accent: '#db2777' })));
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  const field = editor.locator('.rv-slider-field').filter({ has: page.getByRole('slider', { name: 'Corner radius' }) });
  const slider = field.getByRole('slider', { name: 'Corner radius' });
  const accent = () => slider.evaluate(element => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--range-color)';
    element.parentElement!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await editor.getByRole('button', { name: 'Accent #2563eb' }).click();
  await expect.poll(accent).toBe('rgb(37, 99, 235)');
  const save = editor.getByRole('button', { name: 'Save to theme' });
  await expect(save).toHaveCSS('background-color', 'rgb(37, 99, 235)');
  await expect(editor.getByRole('button', { name: 'CSS', exact: true })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'JSON', exact: true })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'CSS and JSON', exact: true })).toBeVisible();
  await expect(editor.getByLabel('Variant', { exact: true })).toBeVisible();
  await expect(editor.getByLabel('Size', { exact: true })).toBeVisible();
  await expect(editor.getByLabel('Rounded', { exact: true })).toBeVisible();
  await expect(field.locator('.rv-slider-field__value')).toHaveCSS('background-color', 'color(srgb 0.0943137 0.252353 0.59902)');
  await editor.getByRole('button', { name: 'Accent #059669' }).click();
  await expect.poll(accent).toBe('rgb(5, 150, 105)');
  await expect(save).toHaveCSS('background-color', 'rgb(5, 150, 105)');
  await slider.fill('12');
  await expect(field.locator('.rv-slider-field__value')).toHaveText('12px');
});


test('select popup uses the preset accent instead of the gallery accent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-gallery-global-theme-v1', JSON.stringify({ accent: '#db2777' })));
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  await chooseOption(editor.getByLabel('Component'), 'Select');
  await editor.getByRole('button', { name: 'Accent #059669' }).click();
  await page.getByRole('region', { name: 'Select preview' }).getByRole('combobox', { name: 'Option' }).click();
  const popup = page.locator('.revo-dropdown-menu.rv-theme-select-custom');
  await expect(popup).toHaveCSS('--rv-ui-accent', '#059669');
  const selected = popup.getByRole('option', { name: 'First' });
  const expected = await popup.evaluate(element => {
    const probe = document.createElement('div');
    probe.style.background = 'color-mix(in srgb, #059669 12%, var(--rv-ui-surface))';
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  await expect(selected).toHaveCSS('background-color', expected);
});

test('nested controls use the preset accent instead of the gallery accent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-gallery-global-theme-v1', JSON.stringify({ accent: '#db2777' })));
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  await chooseOption(editor.getByLabel('Component'), 'HtmlEditor');
  await editor.getByRole('button', { name: 'Accent #6d28d9' }).click();
  const preview = page.getByRole('region', { name: 'HtmlEditor preview' });
  const active = preview.locator('.rv-segmented-switch-item.on');
  const expected = await active.evaluate(element => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--rv-ui-accent-text)';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(active).toHaveCSS('color', expected);
});

test('sidebar fields and dropdowns use the preset accent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-gallery-global-theme-v1', JSON.stringify({ accent: '#db2777' })));
  await page.goto('/customize/');
  const editor = page.locator('.theme-editor--standalone');
  await editor.getByRole('button', { name: 'Accent #6d28d9' }).click();
  const name = editor.getByLabel('Preset name');
  await name.focus();
  await expect(name).toHaveCSS('border-top-color', 'rgb(109, 40, 217)');
  const picker = editor.getByRole('combobox', { name: 'Component', exact: true });
  await picker.click();
  const selected = page.getByRole('option', { name: 'Button', exact: true });
  await expect(selected.locator('input[type="checkbox"]')).toHaveCSS('accent-color', 'rgb(109, 40, 217)');
  const popup = selected.locator('xpath=ancestor::div[contains(@class,"revo-dropdown-menu")]');
  await expect(popup).toHaveCSS('--rv-ui-accent', '#6d28d9');
  await page.keyboard.press('Escape');
  await editor.getByRole('button', { name: 'Accent #059669' }).click();
  await name.focus();
  await expect(name).toHaveCSS('border-top-color', 'rgb(5, 150, 105)');
  await picker.click();
  await expect(page.getByRole('option', { name: 'Button', exact: true }).locator('input[type="checkbox"]')).toHaveCSS('accent-color', 'rgb(5, 150, 105)');
});
