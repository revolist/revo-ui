import { chooseOption } from './choose-option';
import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`global theme updates examples and survives navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/buttons/');
    const trigger = page.getByRole('button', {
      name: 'Customize',
      exact: true,
    });
    await trigger.click();
    const panel = page.getByRole('region', { name: 'Customize gallery theme' });
    await expect(panel).toHaveCSS('box-shadow', 'none');
    const headerColor = await page
      .locator('.catalog-topbar')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await expect(panel).toHaveCSS('background-color', headerColor);
    await panel.getByRole('switch', { name: 'Animations' }).uncheck();
    await expect(page.locator('html')).toHaveAttribute(
      'data-rv-ui-motion',
      'off',
    );
    await panel.getByRole('switch', { name: 'Animations' }).check();
    await panel.getByRole('switch', { name: 'Right to left' }).check();
    await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
    await panel.getByRole('switch', { name: 'Right to left' }).uncheck();
    const eyebrow = panel.locator('.global-theme-intro > span');
    const before = await eyebrow.evaluate((el) => getComputedStyle(el).color);
    await panel.getByRole('button', { name: 'Red', exact: true }).click();
    const after = await eyebrow.evaluate((el) => getComputedStyle(el).color);
    expect(after).not.toBe(before);
    await expect(
      panel.getByRole('link', { name: 'Component presets' }),
    ).toHaveCSS('color', after);
    await expect(
      panel.getByRole('button', { name: 'Red', exact: true }),
    ).toHaveCSS('outline-color', 'rgb(220, 38, 38)');
    await panel.getByRole('button', { name: 'Radius 12px' }).click();
    await expect(
      panel.getByRole('button', { name: 'Radius 12px' }).locator('span'),
    ).toHaveCSS('border-top-color', 'rgb(220, 38, 38)');
    await expect(
      panel.getByRole('button', { name: 'Red', exact: true }),
    ).toHaveCSS('border-top-left-radius', '12px');
    const primary = page
      .locator('#example-button-variants')
      .getByRole('button', { name: 'Primary', exact: true });
    await expect(primary).toHaveCSS('background-color', 'rgb(220, 38, 38)');
    await expect(page.locator('.catalog')).toHaveCSS('--rv-ui-radius', '12px');
    await page.goto('/components/selection-controls/');
    await expect(page.locator('.catalog')).toHaveCSS(
      '--rv-ui-accent',
      '#dc2626',
    );
    await page.getByRole('button', { name: 'Customize', exact: true }).click();
    await expect(
      panel.getByRole('button', { name: 'Red', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await panel.getByRole('button', { name: 'Blue', exact: true }).click();
    await expect(page.locator('.catalog')).toHaveCSS(
      '--rv-ui-accent',
      '#2563eb',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('global customization opens the dedicated editor and old colors links redirect', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await page.getByRole('link', { name: 'Component presets' }).click();
  await expect(page).toHaveURL(/\/customize\/$/);
  const editor = page.locator('.theme-editor');
  await chooseOption(editor.getByLabel('Component'), 'Button');
  await chooseOption(editor.getByLabel('variant'), 'primary');
  const preview = page
    .locator('.theme-samples > div')
    .last()
    .getByRole('button', { name: 'Save' });
  await expect(preview).toHaveCSS('background-color', 'rgb(109, 40, 217)');
  await expect(
    editor.getByRole('button', { name: 'JSON', exact: true }),
  ).toBeVisible();
  await page.goto('/colors/');
  await expect(page).toHaveURL(/\/customize\/$/);
  await page.getByText('Explore semantic colors and palettes').click();
  await expect(page.getByLabel('light color palette')).toBeVisible();
});

test('global theme panel matches the dark header', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revo-ui-theme', 'dark'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  const headerColor = await page
    .locator('.catalog-topbar')
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect(
    page.getByRole('region', { name: 'Customize gallery theme' }),
  ).toHaveCSS('background-color', headerColor);
});

test('home buttons follow the selected global style', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Customize gallery theme' });
  await panel.getByRole('button', { name: 'Cyan', exact: true }).click();
  await panel.getByRole('button', { name: 'Radius 8px' }).click();
  const action = page
    .getByRole('link', { name: 'Explore components', exact: true })
    .first();
  await expect(action).toHaveCSS('background-color', 'rgb(8, 145, 178)');
  await expect(action).toHaveCSS('border-top-left-radius', '8px');
  await expect(
    page.getByRole('link', { name: 'Charts and range selection', exact: true }),
  ).toHaveCSS('border-top-left-radius', '8px');
  await expect(page.locator('.home-framework-card').first()).toHaveClass(
    /rv-btn/,
  );
  await expect(page.locator('.home-framework-card').first()).toHaveCSS(
    'border-top-left-radius',
    '8px',
  );
  const search = page.getByRole('searchbox', { name: 'Search invoices' });
  const sort = page.getByRole('combobox', { name: 'Sort invoices' });
  for (const radius of [0, 8, 16]) {
    await panel.getByRole('button', { name: `Radius ${radius}px` }).click();
    await expect(search).toHaveCSS('border-top-left-radius', `${radius}px`);
    await expect(sort).toHaveCSS('border-top-left-radius', `${radius}px`);
  }
});

test('checkboxes and segmented tabs follow the selected radius', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  await expect(
    page.getByRole('heading', { name: 'Customize a switch' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: /Customize Selection controls/ }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Customize gallery theme' });
  const checkboxes = page.locator('#example-checkboxes').getByRole('checkbox');
  for (const radius of [0, 8, 16]) {
    await panel.getByRole('button', { name: `Radius ${radius}px` }).click();
    for (const checkbox of await checkboxes.all())
      await expect(checkbox).toHaveCSS(
        'border-top-left-radius',
        `${radius / 2}px`,
      );
    await expect(
      page.locator('#example-choice-chips .rv-choice-chip').first(),
    ).toHaveCSS('border-top-left-radius', `${radius}px`);
  }
  await page.goto('/components/tabs-and-lists/');
  const tabs = page.getByRole('tablist', { name: 'Editor tabs' });
  await expect(tabs).toHaveCSS('border-top-left-radius', '16px');
  await expect(tabs.getByRole('tab').first()).toHaveCSS(
    'border-top-left-radius',
    '16px',
  );
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await page.getByRole('button', { name: 'Radius 0px' }).click();
  await expect(tabs).toHaveCSS('border-top-left-radius', '0px');
  await expect(tabs.getByRole('tab').first()).toHaveCSS(
    'border-top-left-radius',
    '0px',
  );
  await page.getByRole('button', { name: 'Radius 4px' }).click();
  await expect(tabs.getByRole('tab').first()).toHaveCSS(
    'border-top-left-radius',
    '4px',
  );
  await page.getByRole('button', { name: 'Radius 0px' }).click();
  const option = page
    .getByRole('listbox', { name: 'Value formats' })
    .getByRole('option', { name: /Automatic/ });
  const apiLink = page
    .getByRole('navigation', { name: 'Tabs and lists API pages' })
    .getByRole('link')
    .first();
  await expect(option).toHaveCSS('border-top-left-radius', '0px');
  await expect(apiLink).toHaveCSS('border-top-left-radius', '0px');
  await page.getByRole('button', { name: 'Radius 16px' }).click();
  await expect(option).toHaveCSS('border-top-left-radius', '16px');
  await expect(apiLink).toHaveCSS('border-top-left-radius', '16px');
});

test('square preview reaches gallery surfaces and native scrollbars follow the theme', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'revo-ui-gallery-global-theme-v1',
      JSON.stringify({ radius: 0 }),
    ),
  );
  const checks = [
    ['/components/timeline-track/', '.rv-timeline-control__track'],
    ['/components/color/', '.rv-color-palette__swatch'],
    ['/components/formatting-controls/', '.rv-format-segmented'],
    ['/components/ai-assistant/', '.rv-ai-prompt-composer'],
    ['/components/menus-and-toolbars/', '.rv-icon-toolbar'],
    ['/components/pdf-viewer/', '.rv-pdf-viewer'],
    ['/components/resource-selection/', '.rv-resource-picker__option'],
  ];
  for (const [url, selector] of checks) {
    await page.goto(url);
    await expect(page.locator(selector).first()).toHaveCSS(
      'border-top-left-radius',
      '0px',
    );
    await expect(
      page.locator('.catalog-nav-group a[aria-current]').first(),
    ).toHaveCSS('border-top-left-radius', '0px');
  }
  await page.goto('/components/pdf-viewer/');
  await expect(page.locator('.rv-pdf-viewer__viewport').first()).toHaveCSS(
    'color-scheme',
    'light',
  );
});

test('assignee picker uses the selected radius in its popup', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'revo-ui-gallery-global-theme-v1',
      JSON.stringify({ radius: 0 }),
    ),
  );
  await page.goto('/components/assignee-field/');
  await page.getByRole('button', { name: 'Assign people' }).click();
  const picker = page.getByRole('dialog', { name: 'Assign people' });
  await expect(picker.getByRole('searchbox')).toHaveCSS(
    'border-top-left-radius',
    '0px',
  );
  await expect(
    picker.locator('.rv-assignee-picker__allocations label').first(),
  ).toHaveCSS('border-top-left-radius', '0px');
  await expect(picker.getByRole('spinbutton').first()).toHaveCSS(
    'border-top-left-radius',
    '0px',
  );
});

test('customize remains accessible in the header and works on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const customize = page.getByRole('button', {
    name: 'Customize',
    exact: true,
  });
  const github = page.getByRole('link', { name: 'Revo UI on GitHub' });
  const customizeBox = await customize.boundingBox();
  const githubBox = await github.boundingBox();
  const searchBox = await page.getByRole('searchbox', { name: 'Search the site' }).boundingBox();
  expect(customizeBox!.x + customizeBox!.width).toBeLessThanOrEqual(searchBox!.x);
  expect(searchBox!.x + searchBox!.width).toBeLessThanOrEqual(githubBox!.x);
  await page.setViewportSize({ width: 390, height: 844 });
  await customize.click();
  await expect(
    page.getByRole('region', { name: 'Customize gallery theme' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('customize panel opens with motion and honors motion preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Customize', exact: true });
  const panel = page.getByRole('region', { name: 'Customize gallery theme' });
  await trigger.click();
  await expect(panel).toHaveCSS('animation-name', 'global-theme-enter');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  await expect(panel).toHaveCSS('animation-name', 'none');
  await trigger.click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .locator('.catalog')
    .evaluate((element) => element.setAttribute('data-rv-ui-motion', 'off'));
  await trigger.click();
  await expect(panel).toHaveCSS('animation-name', 'none');
});

test('home primary action uses the default accent', async ({ page }) => {
  await page.goto('/');
  const action = page
    .getByRole('link', { name: 'Explore components', exact: true })
    .first();
  await expect(action).toHaveCSS('background-color', 'rgb(37, 99, 235)');
});

test('ready-made styles change controls and persist independently of accent', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Customize gallery theme' });
  const catalog = page.locator('.catalog');
  await panel.getByRole('button', { name: 'Red', exact: true }).click();
  await panel.getByRole('button', { name: 'Compact', exact: true }).click();
  await expect(catalog).toHaveCSS('--rv-control-height', '28px');
  await panel.getByRole('button', { name: 'Sharp', exact: true }).click();
  await expect(catalog).toHaveCSS('--rv-ui-radius', '0px');
  await panel.getByRole('button', { name: 'Raised', exact: true }).click();
  const primary = page
    .locator('#example-button-variants')
    .getByRole('button', { name: 'Primary', exact: true });
  await expect(primary).not.toHaveCSS('box-shadow', 'none');
  await panel.getByRole('button', { name: 'Glass', exact: true }).click();
  await expect(catalog).toHaveAttribute('data-rv-style', 'glass');
  await page.reload();
  await expect(catalog).toHaveAttribute('data-rv-style', 'glass');
  await expect(catalog).toHaveCSS('--rv-ui-accent', '#dc2626');
});
