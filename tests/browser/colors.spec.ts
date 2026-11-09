import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { DEFAULT_COLOR_PALETTE_OPTIONS } from '@revolist/ui/color-palette/palette';
import { colorRoles } from '@revolist/ui/color-roles';

test('header library links support pointer and keyboard navigation', async ({
  page,
}) => {
  await page.goto('/#components');
  const navigation = page.getByRole('navigation', { name: 'Library pages' });
  const components = navigation.getByRole('link', {
    name: 'Components',
    exact: true,
  });
  await expect(components).toHaveAttribute('aria-current', 'page');
  await navigation.getByRole('link', { name: 'Colors', exact: true }).click();
  await expect(page).toHaveURL(/\/colors\/$/);
  await expect(page.locator('#colors')).toBeVisible();
  const colors = navigation.getByRole('link', { name: 'Colors', exact: true });
  await expect(colors).toHaveAttribute('aria-current', 'page');
  await colors.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(components).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/components\/buttons\/$/);
  await expect(
    page.getByRole('navigation', { name: 'Component sections' }),
  ).toBeVisible();
});

test('color reference resolves semantic roles in both themes and supports searching', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  const section = page.locator('#colors');
  await expect(section).toBeVisible();
  for (const theme of ['light', 'dark']) {
    const palette = section.getByLabel(`${theme} color palette`);
    await expect(palette.locator('[data-color-token]')).toHaveCount(
      colorRoles.length,
    );
    const missing = await palette.evaluate((element) =>
      Array.from(element.querySelectorAll<HTMLElement>('[data-color-token]'))
        .filter(
          (swatch) =>
            !getComputedStyle(swatch)
              .getPropertyValue(swatch.dataset.colorToken!)
              .trim(),
        )
        .map((swatch) => swatch.dataset.colorToken),
    );
    expect(missing).toEqual([]);
    await expect(
      palette.getByRole('button', { name: 'Disabled', exact: true }),
    ).toBeDisabled();
    await expect(palette.locator('.colors-value').first()).not.toHaveText(
      'Resolving…',
    );
  }
  const surface = async (theme: string) =>
    section
      .getByLabel(`${theme} color palette`)
      .locator('[data-color-token="--rv-ui-surface"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await surface('light')).not.toEqual(await surface('dark'));
  for (const token of [
    'disabled-bg',
    'disabled-fg',
    'danger-surface',
    'warning-surface',
    'success-surface',
  ]) {
    const value = (theme: string) =>
      section
        .getByLabel(`${theme} color palette`)
        .locator(`[data-color-token="--rv-ui-${token}"]`)
        .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(
      await value('light'),
      `${token} must resolve within its explicit theme scope`,
    ).not.toEqual(await value('dark'));
  }
  await section
    .getByRole('textbox', { name: 'Find a color token' })
    .fill('warning');
  await expect(section.locator('.colors-role:visible')).toHaveCount(4);
  await section
    .getByRole('textbox', { name: 'Find a color token' })
    .fill('no-such-token');
  await expect(section.locator('.colors-role:visible')).toHaveCount(0);
  await expect(
    section.getByRole('status', { name: 'Semantic color results' }),
  ).toHaveText('0 color roles');
  await expect(
    page
      .getByRole('navigation', { name: 'Library pages' })
      .getByRole('link', { name: 'Colors', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('navigation', { name: 'Component sections' }),
  ).toHaveCount(0);
  await expect(page.locator('#buttons')).toHaveCount(0);
});

test('palette samples retain explicit theme scopes and fit narrow viewports', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  const light = page.getByLabel('light color palette');
  const dark = page.getByLabel('dark color palette');
  expect(
    await light.evaluate((element) => getComputedStyle(element).colorScheme),
  ).toBe('light');
  expect(
    await dark.evaluate((element) => getComputedStyle(element).colorScheme),
  ).toBe('dark');
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page
      .locator('#colors')
      .evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test('custom accent and control overrides take precedence over semantic defaults', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  const palette = page.getByLabel('light color palette');
  await palette.evaluate((element) => {
    const host = element as HTMLElement;
    host.style.setProperty('--rv-ui-accent', 'rgb(124, 58, 237)');
    host.style.setProperty('--rv-ui-surface-sunken', 'rgb(232, 240, 247)');
  });
  await expect(
    palette.getByRole('button', { name: 'Save', exact: true }),
  ).toHaveCSS('background-color', 'rgb(124, 58, 237)');
  const input = palette.getByRole('textbox', { name: 'light example input' });
  await expect(input).toHaveCSS('background-color', 'rgb(232, 240, 247)');
  await palette.evaluate((element) =>
    (element as HTMLElement).style.setProperty(
      '--rv-control-bg',
      'rgb(210, 225, 240)',
    ),
  );
  await expect(input).toHaveCSS('background-color', 'rgb(210, 225, 240)');
  await input.focus();
  await expect(input).toHaveCSS('border-top-color', 'rgb(124, 58, 237)');
});

test('native stylesheet uses the same explicit dark colors and detached dialogs inherit the page theme', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  const sass = createRequire(
    new URL('../../package.json', import.meta.url),
  )('sass-embedded');
  const nativeCss = sass.compile(
    fileURLToPath(
      new URL(
        import.meta.resolve('@revolist/ui/native-styles.scss'),
        import.meta.url,
      ),
    ),
  ).css;
  await page.addStyleTag({ content: nativeCss });
  await page.evaluate(() => {
    const native = document.createElement('div');
    native.className = 'rv-native-controls';
    native.dataset.theme = 'dark';
    const input = document.createElement('input');
    input.className = 'rv-control';
    input.setAttribute('aria-label', 'Native dark fixture');
    native.append(input);
    document.body.append(native);
  });
  const native = page.getByRole('textbox', { name: 'Native dark fixture' });
  const sample = page.getByRole('textbox', { name: 'dark example input' });
  await expect(native).toHaveCSS('color-scheme', 'dark');
  const background = await sample.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await expect(native).toHaveCSS('background-color', background);
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--rv-ui-accent',
      'rgb(124, 58, 237)',
    ),
  );
  const expected = await page
    .getByLabel('dark color palette')
    .locator('[data-color-token="--rv-ui-surface-elevated"]')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page
    .getByRole('navigation', { name: 'Library pages' })
    .getByRole('link', { name: 'Components', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Component sections' })
    .getByRole('link', { name: 'Dialogs and floating surfaces', exact: true })
    .click();
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--rv-ui-accent',
      'rgb(124, 58, 237)',
    ),
  );
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Edit project',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((element) => element.closest('.catalog') === null),
  ).toBe(true);
  const surface = dialog.locator('.rv-dialog__surface');
  await expect(surface).toHaveCSS('background-color', expected);
  const field = dialog.getByRole('textbox');
  await field.focus();
  await expect(field).toHaveCSS('border-top-color', 'rgb(124, 58, 237)');
});

test('palette visual reference', async ({ page }) => {
  await page.goto('/?page=colors');
  await page.screenshot({
    path: test.info().outputPath('revogrid-colors.png'),
    fullPage: true,
  });
});

test('standalone checkboxes keep semantic borders and checked marks in both palettes', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  await expect(
    page.getByRole('link', { name: 'Skip to colors', exact: true }),
  ).toHaveAttribute('href', '#colors-title');
  for (const theme of ['light', 'dark']) {
    const palette = page.getByLabel(`${theme} color palette`);
    await palette.evaluate((host, name) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'rv-checkbox';
      checkbox.setAttribute('aria-label', `${name} standalone checkbox`);
      host.prepend(checkbox);
    }, theme);
    const checkbox = palette.getByRole('checkbox', {
      name: `${theme} standalone checkbox`,
    });
    await expect(checkbox).toHaveCSS('border-top-width', '2px');
    await expect(checkbox).toHaveCSS('border-top-style', 'solid');
    const border = await palette
      .locator('[data-color-token="--rv-ui-border-strong"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect(checkbox).toHaveCSS('border-top-color', border);
    expect(border).not.toBe('rgba(0, 0, 0, 0)');
    await checkbox.check();
    const foreground = await palette
      .locator('[data-color-token="--rv-ui-accent-fg"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const mark = await checkbox.evaluate((element) => ({
      color: getComputedStyle(element).color,
      borderColor: getComputedStyle(element, '::after').borderRightColor,
      borderWidth: getComputedStyle(element, '::after').borderRightWidth,
    }));
    expect(mark).toEqual({
      color: foreground,
      borderColor: foreground,
      borderWidth: '2px',
    });
  }
});

test('selectable swatches show the shared names and hexadecimal values', async ({
  page,
}) => {
  await page.goto('/?page=colors');
  const swatches = page.getByLabel('Selectable color swatch values');
  await expect(swatches.locator('.colors-role')).toHaveCount(
    DEFAULT_COLOR_PALETTE_OPTIONS.length,
  );
  for (const { value, label } of DEFAULT_COLOR_PALETTE_OPTIONS) {
    const row = swatches
      .locator('.colors-role')
      .filter({ has: page.getByText(value, { exact: true }) });
    await expect(row).toContainText(label);
    expect(
      await row
        .locator('.colors-swatch')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
  }
  await page
    .getByRole('textbox', { name: 'Find a color token' })
    .fill('magenta');
  await expect(swatches.locator('.colors-role:visible')).toHaveCount(1);
});

test('built-in product palettes expose preserved values and their usage', async ({
  page,
}, testInfo) => {
  await page.goto('/?page=colors');
  const { builtInColorPalettes } =
    await import('@revolist/ui/color-palette/built-in-palettes');
  await expect(page.locator('[data-built-in-palette]')).toHaveCount(
    builtInColorPalettes.length,
  );
  for (const palette of builtInColorPalettes) {
    const card = page.locator(`[data-built-in-palette="${palette.id}"]`);
    await expect(card).toContainText(palette.usage);
    await expect(card).toContainText(palette.consumers.join(', '));
  }
  await page
    .getByRole('textbox', { name: 'Find a built-in palette' })
    .fill('chart-series');
  const series = page.locator('[data-built-in-palette="chart-series"]');
  await expect(series).toBeVisible();
  await expect(series.locator('details')).toHaveAttribute('open', '');
  await expect(series.locator('[data-built-in-color]')).toHaveCount(8);
  await expect(series).toContainText('#6647f0');
  const first = series.locator('.colors-swatch').first();
  await expect(first).toHaveCSS('background-color', 'rgb(102, 71, 240)');
  await page
    .getByRole('textbox', { name: 'Find a built-in palette' })
    .fill('avatar-cell');
  const avatars = page.locator('[data-built-in-palette="avatar-cell"]');
  await expect(avatars.locator('.colors-swatch')).toHaveCount(8);
  await expect(avatars.locator('.colors-swatch').first()).toHaveCSS(
    'background-image',
    'linear-gradient(135deg, rgb(125, 211, 252), rgb(37, 99, 235))',
  );
  await avatars.screenshot({ path: testInfo.outputPath('avatar-palette.png') });
  await page
    .getByRole('textbox', { name: 'Find a built-in palette' })
    .fill('no-such-built-in-palette');
  await expect(page.locator('[data-built-in-palette]')).toHaveCount(0);
  await expect(
    page.getByRole('status', { name: 'Built-in palette results' }),
  ).toHaveText('0 named palettes');
});
