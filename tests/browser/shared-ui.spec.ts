import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test.beforeEach(async ({ page, gallerySections }) => {
  await page.goto('/#components');
  for (const section of gallerySections.length
    ? gallerySections
    : ['buttons']) {
    await expect(page.locator(`#${section}`)).toBeVisible();
  }
});

test('reusable legend owns its section and wraps inline without overflow', async ({
  page,
}, info) => {
  const section = page.locator('#legend');
  const legend = section.getByRole('list', {
    name: 'Calendar legend',
    exact: true,
  });
  await expect(legend).toBeVisible();
  await expect(legend).toHaveCSS('display', 'flex');
  await expect(legend).toHaveCSS('flex-wrap', 'wrap');
  await expect(legend.getByRole('listitem')).toHaveCount(4);
  const items = legend.getByRole('listitem');
  const first = await items.nth(0).boundingBox();
  const second = await items.nth(1).boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 390, height: 800 });
  await legend.scrollIntoViewIfNeeded();
  expect(
    await legend.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(1);
  await legend.screenshot({
    path: info.outputPath('calendar-inline-legend.png'),
  });
});

test('solid text and plus buttons share the neutral variant', async ({
  page,
}, info) => {
  const section = page.locator('#buttons');
  const solid = section.getByRole('button', { name: 'Solid', exact: true });
  const add = section.getByRole('button', { name: 'Add task', exact: true });
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await page.mouse.move(0, 0);
    await expect(add).toHaveClass(/rv-btn-solid/);
    await expect(add).not.toHaveClass(/rv-btn-ghost/);
    await expect
      .poll(async () => {
        const actual = await add.evaluate((el) => [
          getComputedStyle(el).backgroundColor,
          getComputedStyle(el).color,
        ]);
        const shared = await solid.evaluate((el) => [
          getComputedStyle(el).backgroundColor,
          getComputedStyle(el).color,
        ]);
        return actual[0] === shared[0] && actual[1] === shared[1];
      })
      .toBe(true);
    await add.click();
    await expect(
      section.locator('output[aria-label="Button action"]'),
    ).toHaveText('Add task clicked');
    await section.screenshot({
      path: info.outputPath(`solid-buttons-${theme}.png`),
    });
  }
});

test('field presentation examples retain actions without imitating the Pro field browser', async ({
  page,
}) => {
  const section = page.locator('#field-configurators');
  await expect(
    section.getByText('Field library shell', { exact: true }),
  ).toHaveCount(0);
  await expect(
    section.getByText('Ordered field group', { exact: true }),
  ).toHaveCount(0);
  const rows = section.getByRole('region', {
    name: 'Pivot selected fields',
    exact: true,
  });
  await rows.getByRole('button', { name: 'Reverse sample Fields' }).click();
  await expect(rows.locator('.rv-configurator-field-caption')).toHaveText([
    'Category',
    'Year',
    'Revenue (USD)',
    'Country',
  ]);
  await section.getByRole('checkbox', { name: 'Revenue (USD)' }).uncheck();
  await expect(
    section.getByRole('checkbox', { name: 'Order count' }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Selection', exact: true }),
  ).toBeChecked();
});

test('form sections stay transparent around contrasting fields in both themes', async ({
  page,
}) => {
  const section = page.locator('#inputs-and-forms .rv-form-section');
  const field = section.getByRole('textbox', { name: 'Invalid example' });
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await expect(section).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const backgrounds = await field.evaluate((node) => ({
      field: getComputedStyle(node).backgroundColor,
      card: getComputedStyle(node.closest('.catalog-example')!).backgroundColor,
    }));
    expect(backgrounds.field).not.toBe(backgrounds.card);
  }
});

test('independent examples do not change another card or group', async ({
  page,
}) => {
  const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
  const checkbox = page.getByRole('checkbox', {
    name: 'Selection',
    exact: true,
  });
  const enabled = page.getByRole('switch', {
    name: 'Enable notifications',
    exact: true,
  });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(checkbox).toBeChecked();
  await expect(enabled).toHaveAttribute('aria-checked', 'true');
});

test('examples are grouped by purpose and keep values independent', async ({
  page,
}) => {
  const buttons = page.locator('#buttons');
  await expect(
    buttons.getByRole('button', { name: 'Delete', exact: true }),
  ).toBeVisible();
  await expect(
    buttons.getByRole('group', { name: 'Grouped actions' }),
  ).toBeVisible();
  await expect(
    buttons.locator('input, textarea, select, [role="switch"]'),
  ).toHaveCount(0);
  const inputs = page.locator('#inputs-and-forms');
  await expect(
    inputs.getByRole('textbox', { name: 'Quick message' }),
  ).toBeVisible();
  await expect(
    inputs.getByRole('searchbox', { name: 'Search catalog' }),
  ).toBeVisible();
  await inputs
    .getByPlaceholder('Project name', { exact: true })
    .fill('Independent project');
  await expect(
    inputs.getByRole('searchbox', { name: 'Search catalog' }),
  ).toHaveValue('');
  await inputs
    .getByRole('spinbutton', { name: 'Quantity', exact: true })
    .fill('12');
  await expect(
    page.getByRole('slider', { name: 'Opacity', exact: true }),
  ).toHaveValue('35');
  await expect(
    page.getByRole('slider', { name: 'Compact slider', exact: true }),
  ).toHaveValue('35');
  await chooseOption(
    page.getByRole('combobox', { name: 'View', exact: true }),
    'Board',
  );
  await expect(
    page.getByRole('tab', { name: 'Table', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page
      .getByRole('listbox', { name: 'Items' })
      .getByRole('option', { name: 'Table', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page
      .getByRole('group', { name: 'View', exact: true })
      .getByRole('radio', { name: 'Table', exact: true }),
  ).toBeChecked();
  await expect(
    page
      .getByRole('group', { name: 'View choices' })
      .getByRole('button', { name: 'Table', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.locator('#weekly-time-grid').getByRole('heading', {
      name: 'Weekly time grid',
      level: 3,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('radiogroup', { name: 'Color swatches' })
    .getByRole('radio', { name: 'Red', exact: true })
    .click();
  await expect(
    page
      .getByRole('button', { name: /^Accent:/ })
      .locator('.rv-format-color-picker__trigger-value'),
  ).toHaveText('#2563EB');
  await expect(page.locator('#pagination .catalog-example')).toHaveCount(13);
  await expect(
    page.locator('#pagination').getByRole('heading', {
      name: 'Navigation without first/last',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator('#progress-and-rating .catalog-example'),
  ).toHaveCount(4);
  await expect(
    page.getByRole('heading', { name: 'Native renderer adapters' }),
  ).toHaveCount(0);
});

test('action feedback stays with the control that produced it', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByLabel('Toolbar action', { exact: true })).toHaveText(
    'Export requested',
  );
  await expect(page.getByLabel('Last action', { exact: true })).toHaveText(
    'None',
  );
  await page
    .getByRole('button', { name: 'Remove Priority filter', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Restore Priority filter' }),
  ).toBeVisible();
  await expect(page.getByLabel('Last action', { exact: true })).toHaveText(
    'None',
  );
  await page.getByRole('menuitem', { name: 'Open', exact: true }).click();
  await expect(page.getByLabel('Last action', { exact: true })).toHaveText(
    'Open',
  );
  await expect(page.getByLabel('Toolbar action', { exact: true })).toHaveText(
    'Export requested',
  );
});

test('catalog navigation filters links without hiding the current component', async ({
  page,
}) => {
  await page.goto('/#buttons');
  const sidebar = page.locator('.catalog-sidebar');
  await expect(sidebar).toBeVisible();
  const navigation = page.getByRole('navigation', {
    name: 'Component sections',
  });
  await expect(
    navigation.getByRole('link', { name: 'Buttons', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  const total = await navigation.getByRole('link').count();
  expect(total).toBeGreaterThan(10);
  await expect(
    navigation.getByText('Individual examples', { exact: true }),
  ).toHaveCount(0);
  const search = page.getByRole('searchbox', { name: 'Find a component' });
  await search.fill('calendar');
  expect(await navigation.getByRole('link').count()).toBeLessThan(total);
  await expect(
    page.getByRole('heading', { name: 'Buttons', exact: true }),
  ).toBeVisible();
  await navigation
    .getByRole('link', { name: 'Calendar and dates', exact: true })
    .click();
  await expect(page).toHaveURL(/\/components\/calendar-and-dates\/$/);
  await expect(page.locator('.catalog-section')).toHaveCount(1);
  await search.fill('no-such-component');
  await expect(sidebar.getByText('No matching sections.')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Calendar and dates', exact: true }),
  ).toBeVisible();
  await search.fill('');
  await expect(navigation.getByRole('link')).toHaveCount(total);
});

test('documentation previews fill one readable column at every viewport', async ({
  page,
}) => {
  await page.goto('/#buttons');
  for (const width of [1440, 1116, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const cards = await page
      .locator('#buttons .catalog-example')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          let parent = node.parentElement!;
          while (getComputedStyle(parent).display === 'contents')
            parent = parent.parentElement!;
          const style = getComputedStyle(parent);
          const parentWidth =
            parent.clientWidth -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight);
          return { x: box.x, width: box.width, parentWidth };
        }),
      );
    expect(new Set(cards.map((card) => Math.round(card.x))).size).toBe(1);
    for (const card of cards)
      expect(Math.abs(card.width - card.parentWidth)).toBeLessThan(2);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test('controls operate without a grid and report no client errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page.locator('revo-grid')).toHaveCount(0);
  const tabSection = page.locator('#tabs-and-lists');
  await expect(tabSection.locator('.catalog-example')).toHaveCount(2);
  await expect(tabSection.getByRole('tablist')).toHaveCount(1);
  await expect(tabSection.getByRole('radiogroup')).toHaveCount(0);
  await tabSection.getByRole('tab', { name: 'Board', exact: true }).click();
  await expect(
    tabSection.getByRole('tabpanel', { name: 'Board', exact: true }),
  ).toHaveText('Board content');
  const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  const slider = page.getByRole('slider', { name: 'Opacity', exact: true });
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('36');
  await expect(
    page.getByRole('slider', { name: 'Disabled slider' }),
  ).toBeDisabled();
  const from = page.getByRole('slider', { name: 'Minimum amount' });
  await from.focus();
  await from.press('ArrowRight');
  await expect(from).toHaveAttribute('aria-valuetext', /20\.01|21/);
  expect(errors).toEqual([]);
});

test('pane resizing follows consecutive pointer moves, keyboard bounds and RTL', async ({
  page,
}) => {
  await page
    .getByRole('navigation', { name: 'Component sections' })
    .getByRole('link', { name: 'Layout', exact: true })
    .click();
  const handle = page.getByRole('separator', {
    name: 'Panel width',
    exact: true,
  });
  const pane = page.locator('.catalog-resizable-pane');
  await handle.focus();
  await handle.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow', '100');
  expect((await pane.boundingBox())!.width).toBeCloseTo(100, 0);
  const grip = (await handle.boundingBox())!;
  const x = grip.x + grip.width / 2,
    y = grip.y + 30;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 20, y, { steps: 2 });
  await expect(handle).toHaveAttribute('aria-valuenow', '120');
  await page.mouse.move(x + 40, y, { steps: 2 });
  await expect(handle).toHaveAttribute('aria-valuenow', '140');
  expect((await pane.boundingBox())!.width).toBeCloseTo(140, 0);
  await page.mouse.up();
  await page.mouse.move(x + 80, y);
  await expect(handle).toHaveAttribute('aria-valuenow', '140');
  await page.getByRole('switch', { name: 'Right to left' }).click();
  await handle.focus();
  await handle.press('ArrowLeft');
  await expect(handle).toHaveAttribute('aria-valuenow', '150');
  await handle.press('End');
  const maximum = Number(await handle.getAttribute('aria-valuemax'));
  await expect(handle).toHaveAttribute('aria-valuenow', String(maximum));
  expect((await pane.boundingBox())!.width).toBeCloseTo(maximum, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => (await pane.boundingBox())!.width)
    .toBeLessThanOrEqual(maximum);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test('nested dialogs trap focus and restore it to the correct trigger', async ({
  page,
}) => {
  const trigger = page.getByRole('button', {
    name: 'Open dialog',
    exact: true,
  });
  await trigger.click();
  const outer = page.getByRole('dialog', { name: 'Edit project', exact: true });
  await expect(outer).toBeVisible();
  const nestedTrigger = outer.getByRole('button', {
    name: 'Open nested confirmation',
  });
  await nestedTrigger.click();
  const inner = page.getByRole('dialog', { name: 'Confirm changes' });
  await expect(inner).toBeVisible();
  await inner.getByRole('button', { name: 'Confirm', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(
    inner.getByRole('button', { name: 'Close confirmation' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(inner).toBeVisible();
  await expect(page.locator('[role="tooltip"]:visible')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(inner).toHaveCount(0);
  await expect(outer).toBeVisible();
  await expect(nestedTrigger).toBeFocused();
  await outer
    .getByRole('textbox', { name: 'Dialog name', exact: true })
    .focus();
  await page.keyboard.press('Escape');
  await expect(outer).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('dropdown escape dismisses the nested popup before its dialog', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Edit project',
    exact: true,
  });
  await dialog.getByRole('combobox', { name: 'Dialog view' }).click();
  const popup = page.locator('.revo-dropdown-menu');
  await expect(popup).toBeVisible();
  await popup.locator('input').focus();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(dialog).toBeVisible();
});

test('date picker instances have distinct relationships and return keyboard focus', async ({
  page,
}) => {
  const first = page.getByRole('button', {
    name: 'Choose due date',
    exact: true,
  });
  const second = page.getByRole('button', {
    name: 'Choose second date',
    exact: true,
  });
  expect(await first.getAttribute('aria-controls')).not.toBe(
    await second.getAttribute('aria-controls'),
  );
  await first.click();
  const calendar = page.getByRole('dialog', { name: 'Due date', exact: true });
  await expect(calendar).toBeVisible();
  const day = calendar
    .locator('button.revo-calendar__day[aria-selected="true"]')
    .first();
  await day.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(calendar).toBeHidden();
  await expect(first).toBeFocused();
  await expect(
    page.locator('input[type="text"][aria-label="Due date"]'),
  ).toHaveValue('2026-10-25');
  await expect(
    page.locator('input[type="text"][aria-label="Second date"]'),
  ).toHaveValue('2026-10-24');
  await second.click();
  await page.keyboard.press('Escape');
  await expect(second).toBeFocused();
});

test('menu keyboard navigation skips disabled actions and opens submenus', async ({
  page,
}) => {
  const menu = page.getByRole('menu', { name: 'Example menu' });
  await menu.getByRole('menuitem', { name: 'Open', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    menu.getByRole('menuitem', { name: 'More actions' }),
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    menu.getByRole('menuitem', { name: 'More actions' }),
  ).toBeFocused();
});

test('themes, RTL and narrow layouts retain visible focus and fit the viewport', async ({
  page,
}) => {
  await page.goto('/#buttons');
  await expect(page.locator('.catalog')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(page.locator('.catalog-example').first()).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await chooseOption(page.getByRole('button', { name: 'Theme' }), 'Dark');
  await expect(page.locator('.catalog')).toHaveCSS(
    'background-color',
    'rgb(31, 31, 31)',
  );
  await expect(page.locator('.catalog-example').first()).toHaveCSS(
    'background-color',
    'rgb(31, 31, 31)',
  );
  const activeSection = page
    .getByRole('navigation', { name: 'Component sections' })
    .getByRole('link', { name: 'Buttons', exact: true });
  await expect(activeSection).toHaveAttribute('aria-current', 'location');
  await page.getByRole('switch', { name: 'Right to left' }).click();
  await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.locator('main *').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width && (rect.right > innerWidth + 1 || rect.left < -1);
      })
      .map((element) => ({
        tag: element.tagName,
        class: element.className,
        width: element.getBoundingClientRect().width,
        left: element.getBoundingClientRect().left,
      }))
      .slice(0, 15),
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    JSON.stringify(overflow),
  ).toBeLessThanOrEqual(390);
  const primary = page.getByRole('button', { name: 'Primary', exact: true });
  await primary.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(primary).toBeFocused();
  expect(
    await primary.evaluate((element) => getComputedStyle(element).boxShadow),
  ).not.toBe('none');
  await page.screenshot({
    path: 'test-results/gallery-dark-mobile.png',
    fullPage: true,
  });
  await chooseOption(page.getByRole('button', { name: 'Theme' }), 'Light');
  await page.getByRole('switch', { name: 'Right to left' }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: 'test-results/gallery-light.png',
    fullPage: true,
  });
});

test('shared control states have complete presentation and logical RTL spacing', async ({
  page,
}) => {
  const compact = page.getByRole('button', { name: 'Compact', exact: true });
  expect((await compact.boundingBox())!.height).toBeLessThan(32);
  expect(
    await page
      .locator('.rv-circular-progress circle')
      .first()
      .evaluate((element) => getComputedStyle(element).fill),
  ).toBe('none');
  await expect(
    page.getByRole('img', { name: 'Quality: 3 / 5', exact: true }),
  ).toBeVisible();
  const nativePage = page
    .locator('#pagination .catalog-example')
    .filter({
      has: page.getByRole('heading', { name: 'Page selector', exact: true }),
    })
    .getByRole('combobox', { name: 'Page', exact: true });
  await chooseOption(nativePage, '2');
  await expect(nativePage).toHaveText('2');
  await expect(
    page
      .getByRole('navigation', { name: 'Result pages', exact: true })
      .locator('[aria-live]'),
  ).toHaveText('1 / 5');
  const stepperButton = page
    .getByRole('group', { name: 'Priority', exact: true })
    .getByRole('button')
    .first();
  expect((await stepperButton.boundingBox())!.height).toBe(32);
  const option = page
    .getByRole('listbox', { name: 'Items' })
    .getByRole('option')
    .first();
  expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(32);
  const invalid = page.locator('input[aria-invalid="true"]');
  expect(
    await invalid.evaluate((element) => getComputedStyle(element).borderColor),
  ).not.toBe(
    await page
      .locator('input[readonly]')
      .evaluate((element) => getComputedStyle(element).borderColor),
  );
  await page.getByRole('switch', { name: 'Right to left' }).click();
  const search = page
    .locator('.rv-search-input')
    .filter({ has: page.getByRole('searchbox', { name: 'Search catalog' }) });
  const icon = await search.locator('.rv-search-input-icon').boundingBox();
  const field = await search.locator('input').boundingBox();
  expect(icon!.x).toBeGreaterThan(field!.x + field!.width / 2);
});

test('gallery groups controls, outlines destructive actions and counts icon history with tooltips', async ({
  page,
}) => {
  const logo = page
    .getByRole('banner')
    .getByRole('img', { name: 'Revo UI', exact: true });
  await expect(logo).toBeVisible();
  await expect
    .poll(() =>
      logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const section = page.locator('.catalog-section').filter({
    has: page.getByRole('heading', { name: 'Buttons', exact: true }),
  });
  await expect(
    section.locator('.catalog-example').getByRole('heading', { level: 3 }),
  ).toHaveCount(6);
  const primary = await page
    .getByRole('button', { name: 'Primary', exact: true })
    .boundingBox();
  const outline = await page
    .getByRole('button', { name: 'Outline', exact: true })
    .boundingBox();
  expect(outline!.x - primary!.x - primary!.width).toBeGreaterThanOrEqual(12);
  const remove = section.getByRole('button', { name: 'Delete', exact: true });
  expect(
    await remove.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe('rgba(0, 0, 0, 0)');
  expect(await remove.evaluate((el) => getComputedStyle(el).borderColor)).toBe(
    'rgb(220, 38, 38)',
  );
  const undo = page.getByRole('button', { name: /^Undo / });
  const redo = page.getByRole('button', { name: /^Redo / });
  const exp = page.getByRole('button', { name: 'Export', exact: true });
  for (const control of [undo, redo, exp])
    await expect(control.locator('svg')).toBeVisible();
  await expect(undo.locator('.rv-badge')).toHaveText('3');
  await expect(redo.locator('.rv-badge')).toHaveText('0');
  await expect(redo).toBeDisabled();
  await undo.click();
  await expect(undo.locator('.rv-badge')).toHaveText('2');
  await expect(redo.locator('.rv-badge')).toHaveText('1');
  await redo.click();
  await expect(undo.locator('.rv-badge')).toHaveText('3');
  await undo.focus();
  await expect(undo.locator('.rv-control-tooltip')).toBeVisible();
  await exp.hover();
  await expect(exp.locator('.rv-control-tooltip')).toBeVisible();
  await chooseOption(page.getByRole('button', { name: 'Theme' }), 'Dark');
  await expect(remove).toHaveCSS('border-color', 'rgb(252, 165, 165)');
});

test('filter building blocks operate independently with shared presentation', async ({
  page,
}) => {
  for (const label of ['Standalone bar chart', 'Standalone line chart']) {
    const chart = page.getByRole('group', { name: label, exact: true });
    await expect(chart).toBeVisible();
    await expect(chart.getByRole('listitem')).toHaveCount(10);
    await expect(chart.locator('input, revo-grid')).toHaveCount(0);
    const first = chart.getByRole('listitem').first();
    await first.focus();
    await first.press('ArrowRight');
    await expect(chart.getByRole('listitem').nth(1)).toBeFocused();
    await expect(
      chart.getByRole('listitem').nth(1).getByRole('tooltip'),
    ).toBeVisible();
  }
  await expect(
    page.getByRole('heading', { name: 'Searchable metric selection' }),
  ).toHaveCount(0);
  const track = page.getByRole('slider', { name: 'Brush maximum' });
  await expect(track).toHaveCSS('background-image', /rgb\(37, 99, 235\)/);
  const preset = page.getByRole('button', { name: /Compact spacing/ });
  await preset.click();
  await expect(preset).toHaveAttribute('aria-pressed', 'true');
  const matrix = page.getByRole('grid', { name: 'Availability slots' });
  const first = matrix.locator('[data-time-cell="1:0"]');
  const next = matrix.locator('[data-time-cell="1:2"]');
  await first.focus();
  await first.press('ArrowRight');
  await expect(next).toBeFocused();
  await next.press('Space');
  await expect(next).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Time selection commits')).toContainText(
    '1 change committed',
  );
  const expression = page.getByRole('textbox', { name: 'Highlighted example' });
  await expression.fill('value > 250');
  await expect(
    page.locator('.rv-highlighted-input__highlight').last(),
  ).toHaveText('value > 250');
  const cellHeight = await first.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(cellHeight).toBe(22);
  await page.getByRole('radio', { name: 'Line', exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'Standalone distribution' }),
  ).toHaveClass(/--line/);
});

test('drawing tools share contained native toolbar presentation in both themes', async ({
  page,
}, testInfo) => {
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('Menus and toolbars');
  await page.mouse.move(0, 0);
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    const toolbar = page.getByRole('toolbar', {
      name: 'Drawing tools',
      exact: true,
    });
    const select = toolbar.getByRole('button', {
      name: 'Select tool',
      exact: true,
    });
    const rectangle = toolbar.getByRole('button', {
      name: 'Rectangle tool',
      exact: true,
    });
    await expect(select).toHaveAttribute('aria-pressed', 'true');
    const selectedColors = await toolbar.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.cssText =
        'background:var(--rv-ui-selected-bg);color:var(--rv-ui-selected-fg)';
      element.append(probe);
      const colors = {
        background: getComputedStyle(probe).backgroundColor,
        color: getComputedStyle(probe).color,
      };
      probe.remove();
      return colors;
    });
    await expect(select).toHaveCSS(
      'background-color',
      selectedColors.background,
    );
    await expect(select).toHaveCSS('color', selectedColors.color);
    await expect(rectangle.locator('svg')).toHaveCSS('fill', 'none');
    await toolbar.scrollIntoViewIfNeeded();
    await select.press('Tab');
    await expect(rectangle).toBeFocused();
    await expect(rectangle.locator('.rv-control-tooltip')).toBeVisible();
    await rectangle.hover();
    await expect(rectangle).not.toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await rectangle.click();
    await expect(rectangle).toHaveAttribute('aria-pressed', 'true');
    await expect(select).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: 'Drawing unavailable', exact: true }),
    ).toBeDisabled();
    await page.locator('#menus-and-toolbars').screenshot({
      path: testInfo.outputPath(`drawing-toolbar-${theme}.png`),
      animations: 'disabled',
    });
    await select.click();
    await page.mouse.move(0, 0);
  }
});

test('button groups have a single joined outline with logical corners and visible focus', async ({
  page,
}, testInfo) => {
  const group = page.getByRole('group', {
    name: 'Grouped actions',
    exact: true,
  });
  const first = group.getByRole('button', { name: 'First', exact: true });
  const second = group.getByRole('button', { name: 'Second', exact: true });
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    for (const rtl of [false, true]) {
      await page
        .getByRole('switch', { name: 'Right to left', exact: true })
        .setChecked(rtl);
      await expect(first).toHaveCSS('border-inline-start-width', '0px');
      await expect(first).toHaveCSS('border-inline-end-width', '0px');
      await expect(first).toHaveCSS('border-top-width', '0px');
      await expect(second).toHaveCSS('border-inline-start-width', '1px');
      await expect(second).toHaveCSS('border-inline-end-width', '0px');
      await expect(first).toHaveCSS('border-start-end-radius', '0px');
      await expect(second).toHaveCSS('border-start-start-radius', '0px');
      const a = (await first.boundingBox())!,
        b = (await second.boundingBox())!;
      expect(
        Math.abs(rtl ? b.x + b.width - a.x : a.x + a.width - b.x),
      ).toBeLessThanOrEqual(1);
      await first.focus();
      await first.press('Tab');
      await expect(second).toBeFocused();
      await expect(second).not.toHaveCSS('box-shadow', 'none');
      await second.press('Enter');
      await expect(
        page.getByLabel('Grouped action', { exact: true }),
      ).toHaveText('Second selected');
      await group.screenshot({
        path: testInfo.outputPath(
          `button-group-${theme}-${rtl ? 'rtl' : 'ltr'}.png`,
        ),
        animations: 'disabled',
      });
    }
  }
});

test.describe('pagination family', () => {
  test.use({ gallerySections: ['pagination'] });
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark'])
      for (const rtl of [false, true]) {
        test(`pagination combinations retain readable groups, current pages and boundaries at ${width}px in ${theme} ${rtl ? 'RTL' : 'LTR'}`, async ({
          page,
        }, testInfo) => {
          const simple = page.getByRole('navigation', {
            name: 'Simple page numbers',
            exact: true,
          });
          await simple.getByRole('button', { name: '3', exact: true }).click();
          await expect(
            simple.getByRole('button', { name: '3', exact: true }),
          ).toHaveAttribute('aria-current', 'page');
          const numbered = page.getByRole('navigation', {
            name: 'Numbered pages',
            exact: true,
          });
          await expect(
            numbered.getByRole('button', { name: '10', exact: true }),
          ).toHaveAttribute('aria-current', 'page');
          await numbered
            .getByRole('button', { name: 'Next page', exact: true })
            .click();
          await expect(
            numbered.getByRole('button', { name: '11', exact: true }),
          ).toHaveAttribute('aria-current', 'page');
          const selector = page.locator('#pagination .catalog-example').filter({
            has: page.getByRole('heading', {
              name: 'Page selector',
              exact: true,
            }),
          });
          await chooseOption(
            selector.getByRole('combobox', { name: 'Page', exact: true }),
            '10',
          );
          await expect(selector).toContainText('91-95 of 95 items');
          await expect(
            selector.getByRole('button', { name: 'Next page', exact: true }),
          ).toBeDisabled();
          await expect(
            selector.getByRole('button', { name: 'Last page', exact: true }),
          ).toBeDisabled();
          await selector
            .getByRole('button', { name: 'First page', exact: true })
            .focus();
          await page.keyboard.press('Enter');
          await expect(selector.getByRole('combobox')).toHaveText('1');
          await chooseOption(
            page.getByRole('combobox', { name: 'Rows per page', exact: true }),
            '25',
          );
          const table = page.getByRole('navigation', {
            name: 'Table pages',
            exact: true,
          });
          await table
            .getByRole('button', { name: 'Next table page', exact: true })
            .click();
          await expect(table.locator('..')).toContainText('Page 2 of 4');
          const empty = page.locator('#pagination .catalog-example').filter({
            has: page.getByRole('heading', {
              name: 'Empty results',
              exact: true,
            }),
          });
          await expect(empty).toContainText('0-0 of 0 items');
          for (const button of await empty
            .locator('.catalog-specimen')
            .getByRole('button')
            .all())
            await expect(button).toBeDisabled();
          await page.setViewportSize({ width, height: 1000 });
          await chooseOption(
            page.getByRole('button', { name: 'Theme', exact: true }),
            theme === 'light' ? 'Light' : 'Dark',
          );
          await page
            .getByRole('switch', { name: 'Right to left', exact: true })
            .setChecked(rtl);
          const section = page.locator('#pagination');
          await expect(
            page
              .getByRole('navigation', { name: 'Result pages', exact: true })
              .locator('.rv-pagination-summary'),
          ).toHaveCSS('direction', 'ltr');
          expect(
            await section.evaluate(
              (node) =>
                [
                  ...node.querySelectorAll<HTMLElement>('.catalog-example'),
                ].filter((card) => card.scrollWidth > card.clientWidth + 1)
                  .length,
            ),
          ).toBe(0);
          for (const unit of await section
            .locator('.rv-pagination-selector')
            .all()) {
            expect(
              await unit.evaluate(
                (node) => node.scrollWidth <= node.clientWidth + 1,
              ),
            ).toBe(true);
            await expect(unit).toHaveCSS('white-space', 'nowrap');
          }
          await section.screenshot({
            path: testInfo.outputPath(
              `pagination-${width}-${theme}-${rtl ? 'rtl' : 'ltr'}.png`,
            ),
            animations: 'disabled',
            style: '.catalog-topbar,.catalog-skip{visibility:hidden!important}',
          });
        });
      }
});

test('formatting controls are independent reusable examples in both themes and directions', async ({
  page,
}, info) => {
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('Formatting controls');
  const section = page.locator('#formatting-controls');
  await expect(section.locator('.catalog-example')).toHaveCount(4);
  const typography = section.locator('.catalog-example').filter({
    has: page.getByRole('heading', {
      name: 'Typography controls',
      exact: true,
    }),
  });
  await typography.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(
    typography.getByRole('button', { name: 'Bold', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const choices = section.getByRole('group', {
    name: 'Text alignment',
    exact: true,
  });
  await choices.getByRole('button', { name: 'Align center' }).press('Enter');
  await expect(
    choices.getByRole('button', { name: 'Align center' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    typography.getByRole('button', { name: 'Bold', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const details = section.locator('details');
  await details.locator('summary').click();
  await expect(details.locator('summary')).toHaveAttribute(
    'aria-label',
    'Expand Details',
  );
  await details.locator('summary').click();
  await expect(details.locator('summary')).toHaveAttribute(
    'aria-label',
    'Collapse Details',
  );
  await expect(section.locator('[role="status"]')).toHaveText('$1,234.50');
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark'])
      for (const rtl of [false, true]) {
        await page.setViewportSize({ width, height: 900 });
        await chooseOption(
          page.getByRole('button', { name: 'Theme', exact: true }),
          theme === 'light' ? 'Light' : 'Dark',
        );
        await page
          .getByRole('switch', { name: 'Right to left', exact: true })
          .setChecked(rtl);
        const options = page.getByRole('button', {
          name: 'More gallery options',
          exact: true,
        });
        if (
          (await options.isVisible()) &&
          (await options.getAttribute('aria-expanded')) === 'true'
        )
          await page.keyboard.press('Escape');
        await section.scrollIntoViewIfNeeded();
        await expect(
          typography.getByRole('button', { name: 'Bold', exact: true }),
        ).toHaveCSS('border-top-width', '0px');
        expect(
          await section.evaluate((el) => el.scrollWidth - el.clientWidth),
        ).toBeLessThanOrEqual(1);
        await section.screenshot({
          path: info.outputPath(
            `formatting-controls-${width}-${theme}-${rtl ? 'rtl' : 'ltr'}.png`,
          ),
          animations: 'disabled',
        });
      }
});

test('calendar options support constrained selections, captions, calendar systems and RTL keyboard input', async ({
  page,
}) => {
  const section = page.locator('#calendar-and-dates');
  const card = (name: string) =>
    section
      .locator('.catalog-example')
      .filter({ has: page.getByRole('heading', { name, exact: true }) });
  const day = (scope: any, date: string) =>
    scope.locator(
      `button[data-calendar-date="${date}"]:not([aria-hidden="true"])`,
    );
  const range = card('Range calendar');
  await day(range, '2026-10-22').click();
  await day(range, '2026-10-26').click();
  await expect(day(range, '2026-10-26')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(day(range, '2026-10-22')).not.toHaveAttribute(
    'aria-selected',
    'true',
  );
  await day(range, '2026-10-28').click();
  await expect(day(range, '2026-10-27')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const multiple = card('Multiple dates');
  for (const date of ['2026-10-21', '2026-10-22', '2026-10-23'])
    await day(multiple, date).click();
  await expect(day(multiple, '2026-10-22')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(day(multiple, '2026-10-23')).not.toHaveAttribute(
    'aria-selected',
    'true',
  );
  const dropdown = card('Month and year dropdowns');
  await chooseOption(
    dropdown.getByRole('combobox', { name: 'Choose year', exact: true }),
    '2027',
  );
  await chooseOption(
    dropdown.getByRole('combobox', { name: 'Choose month', exact: true }),
    'Dec',
  );
  await expect(
    dropdown.getByRole('grid', { name: 'December 2027 Calendar' }),
  ).toBeVisible();
  await expect(
    dropdown.locator('.revo-calendar__day[tabindex="0"]:not(:disabled)'),
  ).toHaveCount(1);
  const persian = card('Persian calendar');
  const first = day(persian, '2024-03-20');
  await expect(first).toHaveText('۱');
  await first.focus();
  await first.press('ArrowRight');
  await expect(day(persian, '2024-03-19')).toBeFocused();
  await expect(
    persian.getByRole('combobox', { name: 'انتخاب ماه' }),
  ).toContainText('اسفند');
  const booked = card('Booked dates and custom cells');
  await expect(day(booked, '2026-10-12')).toBeDisabled();
  await expect(
    card('Calendar week numbers').getByRole('rowheader'),
  ).toHaveCount(5);
  await expect(
    card('Natural weeks and locked navigation').locator('[role="gridcell"]'),
  ).toHaveCount(28);
  await expect(
    card('Natural weeks and locked navigation').getByRole('combobox').first(),
  ).toHaveAttribute('aria-disabled', 'true');
  const zone = card('Timezone-safe calendar');
  await expect(day(zone, '2026-10-23')).toHaveAttribute('aria-current', 'date');
  await zone.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(day(zone, '2026-10-23')).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test.describe('calendar family', () => {
  test.use({ gallerySections: ['calendar-and-dates'] });
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark'])
      for (const rtl of [false, true]) {
        test(`calendar variants keep blue selection and fit light dark LTR RTL layouts at ${width}px in ${theme} ${rtl ? 'RTL' : 'LTR'}`, async ({
          page,
        }, info) => {
          const section = page.locator('#calendar-and-dates');
          await page.setViewportSize({ width, height: 900 });
          await chooseOption(
            page.getByRole('button', { name: 'Theme', exact: true }),
            theme === 'light' ? 'Light' : 'Dark',
          );
          await page
            .getByRole('switch', { name: 'Right to left', exact: true })
            .setChecked(rtl);
          const selected = section
            .locator('.revo-calendar__day.range-start')
            .first();
          await expect(selected).toHaveCSS(
            'background-color',
            'rgb(37, 99, 235)',
          );
          await expect(selected).toHaveCSS('color', 'rgb(255, 255, 255)');
          const overflow = await section
            .locator('.revo-calendar')
            .evaluateAll((nodes) =>
              nodes.map((el) => el.scrollWidth - el.clientWidth),
            );
          expect(Math.max(...overflow)).toBeLessThanOrEqual(1);
          await section.screenshot({
            style: '.catalog-topbar{visibility:hidden!important}',
            path: info.outputPath(
              `calendars-${width}-${theme}-${rtl ? 'rtl' : 'ltr'}.png`,
            ),
          });
          if (!rtl)
            for (const title of [
              'Range calendar',
              'Persian calendar',
              'Booked dates and custom cells',
            ]) {
              const card = section.locator('.catalog-example').filter({
                has: page.getByRole('heading', { name: title, exact: true }),
              });
              await card.screenshot({
                style: '.catalog-topbar{visibility:hidden!important}',
                path: info.outputPath(
                  `calendar-${title.toLowerCase().replaceAll(' ', '-')}-${width}-${theme}.png`,
                ),
              });
            }
        });
      }
});

test.describe('charts family', () => {
  test.use({ gallerySections: ['charts-and-range-selection'] });
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark'])
      for (const rtl of [false, true]) {
        test(`chart presentation options retain keyboard access across responsive themes at ${width}px in ${theme} ${rtl ? 'RTL' : 'LTR'}`, async ({
          page,
        }) => {
          const section = page.locator('#charts-and-range-selection');
          const bars = page.getByRole('group', {
            name: 'Monthly orders',
            exact: true,
          });
          await expect(
            bars.locator('.rv-distribution-chart__labels span'),
          ).toHaveText(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
          await expect(
            bars.locator('.rv-distribution-chart__value').first(),
          ).toHaveText('186');
          await expect(
            bars.locator('.rv-distribution-chart__grid span'),
          ).toHaveCount(5);
          await bars.getByRole('listitem').first().focus();
          await bars.getByRole('listitem').first().press('ArrowRight');
          await expect(
            bars.getByRole('listitem').nth(1).getByRole('tooltip'),
          ).toBeVisible();
          await expect(
            bars.getByRole('listitem').nth(1).getByRole('tooltip').locator('i'),
          ).toHaveCSS('background-color', 'rgb(37, 99, 235)');
          await expect(
            page
              .getByRole('group', { name: 'Monthly activity', exact: true })
              .getByRole('tooltip'),
          ).toHaveCount(0);
          await expect(
            page
              .getByRole('group', { name: 'Weekly subscriptions' })
              .locator('path')
              .first(),
          ).toHaveAttribute('d', / H .* V /);
          await page.setViewportSize({ width, height: 1000 });
          await chooseOption(
            page.getByRole('button', { name: 'Theme' }),
            theme === 'light' ? 'Light' : 'Dark',
          );
          await page
            .getByRole('switch', { name: 'Right to left' })
            .setChecked(rtl);
          await section.scrollIntoViewIfNeeded();
          await expect(section).toBeVisible();
          await expect(
            bars.locator('.rv-distribution-chart__labels'),
          ).toHaveCSS('direction', 'ltr');
          await expect(
            bars.locator('.rv-distribution-chart__region'),
          ).toHaveCSS('direction', 'ltr');
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          ).toBe(true);
          await section.screenshot({
            path: `./test-results/captures/chart-parity/charts-${width}-${theme}-${rtl ? 'rtl' : 'ltr'}.png`,
            animations: 'disabled',
          });
        });
      }
});

test('default color palette uses reference swatches and an inline no-color option', async ({
  page,
}) => {
  const section = page.locator('#color');
  const palette = section.getByRole('radiogroup').first();
  await expect(palette.getByRole('radio')).toHaveCount(24);
  await expect(
    palette.locator('[data-rv-color-palette-value]').first(),
  ).toHaveAttribute('data-rv-color-palette-value', '#e53935');
  await palette.locator('[data-rv-color-palette-value="#000000"]').click();
  await expect(
    palette.locator('[data-rv-color-palette-value="#000000"]'),
  ).toHaveAttribute('aria-checked', 'true');
  await palette.locator('[data-rv-color-palette-default]').click();
  await expect(
    palette.locator('[data-rv-color-palette-default]'),
  ).toHaveAttribute('aria-checked', 'true');
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme' }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await palette.screenshot({
      path: `./test-results/captures/palette-reference/${theme}.png`,
    });
    await expect(palette).toHaveCSS(
      'grid-template-columns',
      '28px 28px 28px 28px 28px',
    );
  }
});

test('slider layouts expose units, callouts, ticks and native keyboard behavior', async ({
  page,
}) => {
  const section = page.locator('#sliders');
  const volume = section.getByRole('slider', { name: 'Volume', exact: true });
  await expect(volume).toHaveAttribute('aria-valuetext', '7 dB');
  const commonSlider = section.getByRole('slider', {
    name: 'Opacity',
    exact: true,
  });
  await expect(volume).toHaveCSS(
    'height',
    await commonSlider.evaluate((el) => getComputedStyle(el).height),
  );
  await expect(volume).toHaveCSS(
    'background-size',
    await commonSlider.evaluate((el) => getComputedStyle(el).backgroundSize),
  );
  await volume.focus();
  await volume.press('ArrowRight');
  await expect(volume).toHaveValue('8');
  await expect(volume).toHaveAttribute('aria-valuetext', '8 dB');
  await expect(
    section.getByRole('slider', { name: 'Code quality', exact: true }),
  ).toHaveValue('80');
  await expect(
    section.getByRole('slider', { name: 'Legacy code', exact: true }),
  ).toBeDisabled();
  await expect(section.locator('.rv-slider-field__thumb-value')).toHaveText(
    '70',
  );
  await expect(section.locator('.rv-slider-field__ticks i')).toHaveCount(17);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme' }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await section.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await section.screenshot({
        path: `./test-results/captures/slider-layouts/${width}-${theme}.png`,
      });
    }
  }
});

test('resource selection reuses shared search and keeps selection while filtering', async ({
  page,
}) => {
  const card = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', {
      name: 'Resource selection',
      exact: true,
    }),
  });
  const search = card.getByRole('searchbox', { name: 'Search people' });
  await expect(card.locator('.rv-search-input-icon svg')).toHaveCount(1);
  await search.fill('engineer');
  await expect(card.getByRole('checkbox')).toHaveCount(1);
  await expect(card.getByRole('checkbox', { name: /Alex Chen/ })).toHaveCount(
    1,
  );
  await search.fill('nobody');
  await expect(card).toContainText('No matches');
  await search.fill('');
  await expect(
    card.getByRole('checkbox', { name: /Morgan Lee/ }),
  ).toBeChecked();
  await card.getByRole('checkbox').first().check();
  await expect(card.getByRole('checkbox', { name: /Alex Chen/ })).toBeChecked();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme' }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await card.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await card.screenshot({
        path: `./test-results/captures/resource-selection/${width}-${theme}.png`,
      });
    }
  }
});

test('selection list variants share row presentation and keep groups independently selected', async ({
  page,
}, info) => {
  const formats = page.getByRole('listbox', {
    name: 'Value formats',
    exact: true,
  });
  const visuals = page.getByRole('listbox', {
    name: 'Visual formats',
    exact: true,
  });
  await expect(formats.locator('.rv-editor-list__content')).toHaveCount(2);
  await expect(formats.locator('.rv-editor-list__label').first()).toHaveCSS(
    'font-size',
    '12px',
  );
  await expect(formats.locator('.rv-editor-list__icon svg').first()).toHaveCSS(
    'width',
    '13px',
  );
  await expect(visuals.getByRole('group', { name: 'Identity' })).toBeVisible();
  await formats.getByRole('option', { name: /Number/ }).focus();
  await formats.getByRole('option', { name: /Number/ }).press('Home');
  await expect(
    formats.getByRole('option', { name: /Automatic/ }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    visuals.getByRole('option', { name: 'None', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await visuals.getByRole('option', { name: 'Avatar with text' }).click();
  await expect(
    visuals.getByRole('option', { name: 'Avatar with text' }),
  ).toHaveAttribute('aria-selected', 'true');
  const example = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Selection list', exact: true }),
  });
  await expect(example.getByRole('listbox')).toHaveCount(3);
  await expect(
    page.locator('#formatting-controls').getByRole('listbox'),
  ).toHaveCount(0);
  const plain = example.getByRole('listbox', { name: 'Items', exact: true });
  await plain.getByRole('option', { name: 'Table', exact: true }).focus();
  await plain.getByRole('option', { name: 'Table', exact: true }).press('End');
  await expect(
    plain.getByRole('option', { name: 'Board', exact: true }),
  ).toBeFocused();
  await expect(
    plain.getByRole('option', { name: 'Board', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await example.scrollIntoViewIfNeeded();
      expect(
        await example.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await example.screenshot({
        path: info.outputPath(`selection-list-${width}-${theme}.png`),
      });
      for (const id of ['tabs-and-lists', 'formatting-controls']) {
        await page.locator(`#${id}`).screenshot({
          path: info.outputPath(`${width}-${theme}-${id}.png`),
          animations: 'disabled',
          style:
            '.catalog-topbar, .catalog-skip { visibility: hidden !important; }',
        });
      }
    }
  }
});

test('selected field section components expose statuses and independent row actions', async ({
  page,
}) => {
  const rows = page.getByRole('region', {
    name: 'Pivot selected fields',
    exact: true,
  });
  await expect(rows.locator('.rv-configurator-field-row')).toHaveCount(4);
  await rows
    .getByRole('button', { name: 'Remove sample Fields Category' })
    .click();
  await expect(rows.locator('.rv-configurator-field-row')).toHaveCount(3);
  const filters = rows;
  await expect(
    filters.getByLabel('Include 1 value', { exact: true }),
  ).toBeVisible();
  await filters
    .getByRole('button', { name: 'Configure sample Fields Year' })
    .click();
  await expect(
    filters.locator('.rv-configurator-status-badge[data-active="true"]'),
  ).toHaveCount(1);
  await filters
    .getByRole('button', { name: 'Configure sample Fields Year' })
    .click();
  await rows
    .getByRole('button', { name: 'Add sample Fields', exact: true })
    .click();
  await expect(rows.locator('.rv-configurator-field-row')).toHaveCount(4);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme' }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      for (const name of [
        'Add sample Fields',
        'Configure sample Fields Country',
        'Remove sample Fields Country',
      ]) {
        const button = rows.getByRole('button', { name, exact: true });
        await expect(button).toHaveCSS('width', '28px');
        await expect(button).toHaveCSS('height', '28px');
        await expect(button).toHaveCSS('opacity', '1');
        await expect(button).toHaveCSS(
          'color',
          theme === 'dark' ? 'rgb(163, 163, 163)' : 'rgb(102, 102, 102)',
        );
        await expect(button.locator('svg')).toHaveCSS('width', '12px');
      }
      await page.locator('#field-configurators').screenshot({
        path: `./test-results/captures/pivot-selected-fields/gallery-${width}-${theme}.png`,
      });
    }
  }
});

test('field remove controls keep stable icons with disabled and reduced-motion states', async ({
  page,
}) => {
  const remove = page.getByRole('button', {
    name: 'Remove sample Fields Country',
    exact: true,
  });
  await expect(remove.locator('svg')).toHaveCount(1);
  await expect(remove).toHaveCSS('opacity', '1');
  await expect(remove).toHaveCSS('color', 'rgb(102, 102, 102)');
  const addIcon = page
    .getByRole('button', { name: 'Add sample Fields', exact: true })
    .locator('svg');
  await expect(addIcon).toHaveCSS('width', '12px');
  await expect(remove).toHaveCSS('border-top-width', '0px');
  await expect(remove).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await remove.hover();
  await expect(remove.locator('svg')).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(remove.locator('svg')).toHaveCSS('transform', 'none');
  await remove.click();
  await expect(remove).toHaveCount(0);
  const clear = page.getByRole('button', {
    name: 'Clear sample Fields',
    exact: true,
  });
  await clear.click();
  await expect(clear).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await clear.hover();
  await expect(clear.locator('svg')).toHaveCSS('transform', 'none');
});

test('selected fields reorder within their section by dragging in both directions', async ({
  page,
}) => {
  const section = page.getByRole('region', {
    name: 'Pivot selected fields',
    exact: true,
  });
  const rows = section.locator('.rv-configurator-field-row');
  const captions = section.locator('.rv-configurator-field-caption');
  await rows.nth(0).dragTo(rows.nth(2), { targetPosition: { x: 60, y: 36 } });
  await expect(captions).toHaveText([
    'Revenue (USD)',
    'Year',
    'Country',
    'Category',
  ]);
  await rows.nth(3).dragTo(rows.nth(0), { targetPosition: { x: 60, y: 2 } });
  await expect(captions).toHaveText([
    'Category',
    'Revenue (USD)',
    'Year',
    'Country',
  ]);
  await section.screenshot({
    path: './test-results/captures/pivot-selected-fields/gallery-reordered.png',
  });
});

test('configured field actions use a neutral cog with an accent dot and spaced shared badges', async ({
  page,
}) => {
  const rows = page.getByRole('region', {
    name: 'Pivot selected fields',
    exact: true,
  });
  const cog = rows.getByRole('button', {
    name: 'Configure sample Fields Year',
    exact: true,
  });
  await expect(cog).toHaveAttribute('data-configured', 'true');
  await expect(cog).toHaveCSS('color', 'rgb(102, 102, 102)');
  await expect(cog).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await cog.hover();
  await expect(cog.locator('svg')).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(cog.locator('svg')).toHaveCSS('transform', 'none');
  await expect(cog).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(cog).toHaveCSS('color', 'rgb(102, 102, 102)');
  await cog.evaluate((el) => el.setAttribute('aria-expanded', 'true'));
  await expect(cog).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(cog).toHaveCSS('color', 'rgb(102, 102, 102)');
  expect(
    await cog.evaluate((el) => getComputedStyle(el, '::after').width),
  ).toBe('5px');
  await expect(
    rows.getByLabel('Sum aggregation', { exact: true }),
  ).toHaveAttribute('data-active', 'true');
  await expect(
    rows.getByLabel('All values', { exact: true }),
  ).not.toHaveAttribute('data-active');
  await expect(rows.getByLabel('Sum aggregation', { exact: true })).toHaveCSS(
    'margin-inline-end',
    '4px',
  );
});

test('shared reorder shows an insertion marker and accepts drops between rows', async ({
  page,
}) => {
  const section = page.getByRole('region', {
    name: 'Pivot selected fields',
    exact: true,
  });
  const rows = section.locator('.rv-configurator-field-row');
  await rows.first().scrollIntoViewIfNeeded();
  const source = (await rows.nth(0).boundingBox())!,
    target = (await rows.nth(2).boundingBox())!;
  await page.mouse.move(source.x + 20, source.y + 20);
  await page.mouse.down();
  await page.mouse.move(source.x + 35, source.y + 25, { steps: 5 });
  const x = target.x + 60,
    y = target.y + target.height + 2;
  await page.mouse.move(x, y, { steps: 5 });
  await page.mouse.move(x + 1, y);
  await expect(
    section.locator('.rv-configurator-drop-indicator[data-position="before"]'),
  ).toHaveCount(1);
  await section.screenshot({
    path: './test-results/captures/pivot-selected-fields/gallery-insertion-marker.png',
  });
  await page.mouse.up();
  await expect(section.locator('.rv-configurator-field-caption')).toHaveText([
    'Revenue (USD)',
    'Year',
    'Country',
    'Category',
  ]);
  await expect(section.locator('.rv-configurator-drop-indicator')).toHaveCount(
    0,
  );
});

test('shared filter badge details and removal remain independent', async ({
  page,
}, testInfo) => {
  await expect(page.getByText('Chips', { exact: true })).toHaveCount(0);
  const section = page.locator('#selection-controls');
  await expect(
    section.getByText('Active filter badges', { exact: true }),
  ).toHaveCount(0);
  const card = section
    .locator('.catalog-example')
    .filter({ has: page.getByText('Choice chips', { exact: true }) });
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('group', { name: 'View choices' })).toBeVisible();
  const list = card.getByRole('list', { name: 'Active sample filters' });
  const details = list.getByRole('button', {
    name: 'Details for Priority filter',
  });
  await expect(details).not.toHaveAttribute('data-tooltip');
  await details.hover();
  await expect(page.locator('.rv-tooltip:visible')).toHaveCount(0);
  await details.click();
  await expect(page.locator('.rv-tooltip:visible')).toHaveText(
    'Critical, High · blanks excluded',
  );
  await details.press('Escape');
  await expect(page.locator('.rv-tooltip:visible')).toHaveCount(0);
  await expect(details).toHaveCSS('width', '24px');
  await expect(details).toHaveCSS('height', '24px');
  await expect(list.locator('.rv-choice-chip').first()).toHaveCSS(
    'font-weight',
    '400',
  );
  await expect(details).toHaveCSS('border-top-width', '0px');
  const colors = card.getByRole('group', { name: 'Colored choices' });
  const critical = colors.getByRole('button', {
    name: 'Critical',
    exact: true,
  });
  const normal = colors.getByRole('button', { name: 'Normal', exact: true });
  await expect(critical).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(critical).toHaveCSS('font-weight', '500');
  await normal.click();
  await expect(normal).toHaveAttribute('aria-pressed', 'true');
  await expect(normal).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await normal.click();

  await list.screenshot({ path: testInfo.outputPath('filter-badges.png') });
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await expect(list.locator('.rv-choice-chip').first()).toHaveCSS(
        'font-weight',
        '400',
      );
      await section.screenshot({
        path: testInfo.outputPath(`${width}-${theme}-selection-controls.png`),
      });
      await page.locator('#selects-chips-and-resources').screenshot({
        path: testInfo.outputPath(
          `${width}-${theme}-selects-chips-and-resources.png`,
        ),
      });
    }

  await list.getByRole('button', { name: 'Remove Priority filter' }).click();
  await expect(list.locator('.rv-filter-badge-label')).toHaveText([
    'Region: Europe',
  ]);
  await section
    .getByRole('button', { name: 'Restore Priority filter' })
    .click();
  await expect(list.locator('.rv-filter-badge')).toHaveCount(2);
});

test('shared link-style buttons support text, icons, keyboard and disabled states', async ({
  page,
}, testInfo) => {
  const link = page.getByRole('button', { name: 'Link action', exact: true });
  const iconLink = page
    .locator('#buttons .rv-btn-link')
    .filter({ hasText: 'Add item' });
  await expect(link).toHaveCSS('border-top-width', '0px');
  await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(link).toHaveCSS('font-weight', '400');
  await link.focus();
  await link.press('Enter');
  await expect(page.getByLabel('Button action', { exact: true })).toHaveText(
    'Link clicked',
  );
  await iconLink.click();
  await expect(page.getByLabel('Button action', { exact: true })).toHaveText(
    'Add item clicked',
  );
  await expect(iconLink.locator('svg')).toHaveCSS('width', '12px');
  await expect(
    page.getByRole('button', { name: 'Disabled link', exact: true }),
  ).toBeDisabled();
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await page.locator('#buttons').screenshot({
        path: testInfo.outputPath(`${width}-${theme}-buttons.png`),
      });
    }
});

test('date examples use shared calendars without browser-native temporal pickers', async ({
  page,
}) => {
  const dates = page.locator('#calendar-and-dates');
  await expect(
    dates.locator(
      'input[type="date"],input[type="datetime-local"],input[type="time"]',
    ),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Choose field date', exact: true })
    .click();
  await expect(
    page.getByRole('grid', { name: /Calendar/ }).last(),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  const due = page.getByRole('textbox', { name: 'Due date', exact: true });
  await due.fill('2026-11-05');
  await due.press('Tab');
  await expect(due).toHaveValue('2026-11-05');
  await page
    .getByRole('button', { name: 'Choose due date', exact: true })
    .click();
  await expect(
    page
      .getByRole('dialog', { name: 'Due date', exact: true })
      .locator('[aria-selected="true"]')
      .first(),
  ).toContainText('5');
});
