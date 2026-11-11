import { test, expect } from './gallery-test';
import { chooseOption } from './choose-option';

test('curated home widgets work and lead to component documentation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Components fordata-rich applications.',
  );
  await expect(page.locator('.home-widget')).toHaveCount(7);
  await expect(page.locator('.catalog-sidebar')).toHaveCount(0);
  const portraits = page.locator('.finance-transaction img');
  await expect(portraits).toHaveCount(3);
  await expect
    .poll(() =>
      portraits.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  const revenue = page.locator('.finance-revenue');
  await expect(revenue.locator('.rv-distribution-chart__datum')).toHaveCount(6);
  const initialRevenue = await revenue.locator('.finance-amount').textContent();
  await chooseOption(
    page.getByRole('combobox', { name: 'Reporting period', exact: true }),
    'Last 12 months',
  );
  await expect(revenue.locator('.rv-distribution-chart__datum')).toHaveCount(
    12,
  );
  await expect(revenue.locator('.finance-amount')).not.toHaveText(
    initialRevenue!,
  );
  await chooseOption(
    page.getByRole('combobox', { name: 'Transaction status', exact: true }),
    'Pending',
  );
  await expect(page.locator('.finance-transaction')).toHaveCount(1);
  await expect(page.locator('.finance-transaction')).toContainText(
    'Northstar Labs',
  );
  await page
    .getByRole('spinbutton', { name: 'Savings contribution' })
    .fill('750');
  await page.getByRole('button', { name: 'Add funds', exact: true }).click();
  await expect(
    page.getByRole('status', { name: 'Savings balance' }),
  ).toHaveText('$14,950.00');
  const savingsSlider = page.getByRole('slider', {
    name: 'Savings goal completion',
  });
  await expect(savingsSlider).toHaveValue('14950');
  await expect(
    page.locator('.finance-savings .rv-slider-field__value'),
  ).toHaveText('75%');
  await savingsSlider.focus();
  await savingsSlider.press('ArrowRight');
  await expect(
    page.getByRole('status', { name: 'Savings balance' }),
  ).toHaveText('$15,000.00');
  await expect(savingsSlider).toHaveAttribute(
    'aria-valuetext',
    '$15,000.00 of $20,000.00',
  );
  await page
    .getByRole('link', { name: 'Explore components', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/components\/buttons\/$/);
  await expect(page.locator('.catalog-section')).toHaveCount(1);
  await page
    .locator('.catalog-example-heading')
    .getByRole('link', { name: 'Button variants', exact: true })
    .click();
  await expect(page).toHaveURL(/\/components\/buttons\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Buttons');
  expect(await page.locator('.catalog-example').count()).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Solid', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Button action' })).toHaveText(
    'Solid clicked',
  );
  const expand = page
    .getByRole('button', { name: 'View code', exact: true })
    .first();
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await expand.click();
  await expect(
    page.getByRole('button', { name: 'Collapse code' }),
  ).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.example-code pre').first()).toContainText(
    '<Button',
  );
  await expect(page.locator('.syntax-string').first()).toBeVisible();
  await page.getByRole('button', { name: 'Full source', exact: true }).click();
  await expect(page.locator('.example-code pre').first()).toContainText(
    "from '@revolist/ui/preact'",
  );
  await page.getByRole('button', { name: 'Collapse code' }).click();
  await expect(
    page.getByRole('button', { name: 'View code' }).first(),
  ).toHaveAttribute('aria-expanded', 'false');
});

test('deep links, searchable navigation, history and missing routes', async ({
  page,
}) => {
  await page.goto('/#component/select');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selects, chips and resources',
  );
  expect(await page.locator('.catalog-example').count()).toBeGreaterThan(1);
  const search = page.getByRole('searchbox', { name: 'Find a component' });
  await search.fill('switch');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selects, chips and resources',
  );
  await page
    .getByRole('navigation', { name: 'Component sections' })
    .getByRole('link', { name: 'Selection controls', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selection controls',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selects, chips and resources',
  );
  await page.goto('/#component/not-a-component');
  await expect(
    page.getByRole('heading', { name: 'Component not found' }),
  ).toBeVisible();
});

test('mobile overview and component code stay within the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.home-widget')).toHaveCount(7);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.goto('/#component/select');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selects, chips and resources',
  );
  const browse = page.getByRole('button', {
    name: 'Browse components',
    exact: true,
  });
  await expect(page.locator('.catalog-sidebar')).toBeHidden();
  await browse.click();
  await expect(page.locator('.catalog-sidebar')).toBeVisible();
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.locator('.catalog-sidebar')).toBeHidden();
  await page.getByRole('button', { name: 'View code' }).first().click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(page.locator('select')).toHaveCount(0);
});

test('home charts link to their own preview and formatted source', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Area chart', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Charts and range selection',
  );
  expect(await page.locator('.catalog-example').count()).toBeGreaterThan(1);
  const area = page.locator('#example-gradient-area');
  await area.getByRole('button', { name: 'View code', exact: true }).click();
  await expect(area.locator('.example-code pre')).toContainText('<AreaChart');
});

test('additional finance widgets update allocation and invoices', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.finance-cashflow')).toHaveCount(0);
  await chooseOption(
    page.getByRole('combobox', { name: 'Allocation profile', exact: true }),
    'Growth',
  );
  const equityWeight = page
    .getByRole('table', { name: 'Portfolio holdings' })
    .getByRole('row')
    .nth(1)
    .locator('.progress-line-container');
  await expect(equityWeight.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '70',
  );
  await expect(equityWeight.locator('.progress-line-label')).toHaveText('70%');
  const bar = (await equityWeight.getByRole('progressbar').boundingBox())!;
  const label = (await equityWeight
    .locator('.progress-line-label')
    .boundingBox())!;
  expect(label.x).toBeGreaterThanOrEqual(bar.x + bar.width);
  await page
    .getByRole('checkbox', { name: 'Select INV-1051', exact: true })
    .check();
  await page.getByRole('button', { name: 'Mark as paid', exact: true }).click();
  await expect(
    page.getByRole('status', { name: 'Outstanding invoice total' }),
  ).toHaveText('$5,050.00');
  await expect(
    page.getByRole('checkbox', { name: 'Select INV-1051', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Mark as paid', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.finance-subscriptions')).toHaveCount(0);
});

test('UI-only finance previews, portfolio breakdown and invoice table work together', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('group', { name: 'Net cash flow over time', exact: true }),
  ).toHaveCount(0);
  const holdings = page.getByRole('table', { name: 'Portfolio holdings' });
  await expect(holdings.getByRole('row')).toHaveCount(4);
  await expect(holdings).toContainText('$21,000.00');
  const invoiceTable = page.getByRole('table', { name: 'Invoice details' });
  await chooseOption(
    page.getByRole('combobox', { name: 'Sort invoices', exact: true }),
    'Amount: high to low',
  );
  await expect(invoiceTable.getByRole('row').nth(1)).toContainText('INV-1053');
  await page.getByRole('searchbox', { name: 'Search invoices' }).fill('Orbit');
  await expect(invoiceTable.getByRole('row')).toHaveCount(2);
  await expect(invoiceTable).toContainText('INV-1052');
  await page
    .getByRole('searchbox', { name: 'Search invoices' })
    .fill('not-a-client');
  await expect(
    page.getByText('No matching invoices.', { exact: true }),
  ).toBeVisible();
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  await expect(holdings).toBeVisible();

  await page
    .getByRole('link', { name: 'Explore components', exact: true })
    .first()
    .click();
  await page.goBack();
  await expect(
    page.getByRole('table', { name: 'Portfolio holdings' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('weekly planner combines independent member schedules, capacity and priorities', async ({
  page,
}) => {
  await page.goto('/');
  const planner = (await page.locator('.home-weekly-planner').boundingBox())!;
  const portfolio = (await page.locator('.finance-allocation').boundingBox())!;
  expect(Math.abs(planner.width - portfolio.width)).toBeLessThan(2);
  expect(planner.y).toBeLessThan(portfolio.y);
  const recent = (await page.locator('.finance-recent').boundingBox())!;
  expect(Math.abs(recent.y - portfolio.y)).toBeLessThan(2);
  const grid = (await page
    .getByRole('grid', { name: 'Weekly focus plan' })
    .boundingBox())!;
  const controls = (await page
    .getByRole('complementary', { name: 'Weekly priorities' })
    .boundingBox())!;
  expect(controls.y).toBeGreaterThanOrEqual(grid.y + grid.height);
  await expect(
    page.getByRole('status', { name: 'Planned focus hours' }),
  ).toHaveText('14h / 40h');
  const chart = page.getByRole('group', { name: 'Focus hours by day' });
  await expect(
    chart.getByRole('listitem', { name: 'Mon. Monday: 4 hours' }),
  ).toBeVisible();
  await expect(
    chart.getByRole('listitem', { name: 'Sat. Saturday: 0 hours' }),
  ).toBeVisible();
  await expect(
    chart
      .getByRole('listitem', { name: 'Mon. Monday: 4 hours' })
      .locator('.rv-distribution-chart__bar'),
  ).toHaveAttribute('style', /height:\s*100%/);
  const slot = page
    .getByRole('grid', { name: 'Weekly focus plan' })
    .getByRole('gridcell', {
      name: 'Monday 08:00–10:00, selected',
      exact: true,
    });
  await slot.focus();
  await slot.press('Space');
  await expect(
    page.getByRole('status', { name: 'Planned focus hours' }),
  ).toHaveText('12h / 40h');
  await expect(
    chart.getByRole('listitem', { name: 'Mon. Monday: 2 hours' }),
  ).toBeVisible();
  await expect(
    chart
      .getByRole('listitem', { name: 'Mon. Monday: 2 hours' })
      .locator('.rv-distribution-chart__bar'),
  ).toHaveAttribute('style', /height:\s*50%/);
  await chooseOption(
    page.getByRole('combobox', { name: 'Planning team member', exact: true }),
    'Sam Rivera',
  );
  await expect(
    page.getByRole('status', { name: 'Planned focus hours' }),
  ).toHaveText('10h / 40h');
  await expect(
    chart.getByRole('listitem', { name: 'Tue. Tuesday: 4 hours' }),
  ).toBeVisible();
  const samSlot = page
    .getByRole('grid', { name: 'Weekly focus plan' })
    .getByRole('gridcell', {
      name: 'Tuesday 08:00–10:00, selected',
      exact: true,
    });
  await samSlot.focus();
  await samSlot.press('Space');
  await expect(
    chart.getByRole('listitem', { name: 'Tue. Tuesday: 2 hours' }),
  ).toBeVisible();
  const priority = page.getByRole('checkbox', {
    name: 'Protect time for deep work',
    exact: true,
  });
  await priority.check();
  await expect(priority).toBeChecked();
  await page.getByRole('button', { name: 'Reset week', exact: true }).click();
  await expect(priority).not.toBeChecked();
  await expect(
    chart.getByRole('listitem', { name: 'Tue. Tuesday: 4 hours' }),
  ).toBeVisible();
  await chooseOption(
    page.getByRole('combobox', { name: 'Planning team member', exact: true }),
    'Alex Morgan',
  );
  await expect(
    page.getByRole('status', { name: 'Planned focus hours' }),
  ).toHaveText('12h / 40h');
  await expect(
    chart.getByRole('listitem', { name: 'Mon. Monday: 2 hours' }),
  ).toBeVisible();
});

test('shared dropdown height and font size match buttons', async ({ page }) => {
  await page.goto('/');
  const select = page.getByRole('combobox', {
    name: 'Planning team member',
    exact: true,
  });
  const button = page.getByRole('button', { name: 'Reset week', exact: true });
  for (const compact of [false, true]) {
    await select.evaluate(
      (element, compact) =>
        element.parentElement!.classList.toggle('rv-control--compact', compact),
      compact,
    );
    await button.evaluate(
      (element, compact) =>
        element.classList.toggle('rv-control--compact', compact),
      compact,
    );
    expect((await select.boundingBox())!.height).toBe(
      (await button.boundingBox())!.height,
    );
    expect(
      await select.evaluate((element) => getComputedStyle(element).fontSize),
    ).toBe(
      await button.evaluate((element) => getComputedStyle(element).fontSize),
    );
  }
});

test('dropdown options keep horizontal padding with default and custom labels', async ({
  page,
}) => {
  await page.goto('/');
  for (const name of ['Allocation profile', 'Transaction status']) {
    const trigger = page.getByRole('combobox', { name, exact: true });
    await trigger.click();
    const menu = page.locator(
      '#' + (await trigger.getAttribute('aria-controls')),
    );
    const option = menu.getByRole('option').first();
    const spacing = await option.evaluate((element) => {
      const style = getComputedStyle(element);
      const label = element.querySelector('span')!.getBoundingClientRect();
      return {
        left: parseFloat(style.paddingLeft),
        right: parseFloat(style.paddingRight),
        inset: label.x - element.getBoundingClientRect().x,
      };
    });
    expect(spacing.left).toBeGreaterThanOrEqual(10);
    expect(spacing.right).toBeGreaterThanOrEqual(10);
    expect(spacing.inset).toBeGreaterThanOrEqual(10);
    await trigger.press('Escape');
  }
});

test('inline inputs match dropdown height and font size', async ({ page }) => {
  await page.goto('/#components');
  const select = page.getByRole('combobox', {
    name: 'Sizing mode',
    exact: true,
  });
  const input = page.getByRole('spinbutton', { name: 'Width', exact: true });
  expect((await input.boundingBox())!.height).toBe(
    (await select.boundingBox())!.height,
  );
  expect(await input.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
    await select.evaluate((el) => getComputedStyle(el).fontSize),
  );
});

test('searchable selects match plain select sizing', async ({ page }) => {
  await page.goto('/#selects-chips-and-resources');
  const plain = page.getByRole('combobox', { name: 'View', exact: true });
  const searchable = page.getByRole('combobox', {
    name: 'Searchable view',
    exact: true,
  });
  expect((await searchable.boundingBox())!.height).toBe(
    (await plain.boundingBox())!.height,
  );
  expect(await searchable.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
    await plain.evaluate((el) => getComputedStyle(el).fontSize),
  );
});

test('audit standalone field sizing across the gallery', async ({ page }) => {
  await page.goto('/#components');
  const fields = await page
    .locator(
      '.catalog-specimen input.rv-control:not([type="range"]):not([type="checkbox"]):not([type="radio"]), .catalog-specimen .rv-select .dropdown-trigger, .catalog-specimen .rv-combobox .dropdown-trigger, .catalog-specimen .rv-search-input > input',
    )
    .evaluateAll((elements) =>
      elements
        .filter((el) => el.getBoundingClientRect().height > 0)
        .map((el) => ({
          label:
            el.getAttribute('aria-label') ??
            el.closest('.catalog-example')?.querySelector('h3')?.textContent,
          classes: el.className,
          height: el.getBoundingClientRect().height,
          font: getComputedStyle(el).fontSize,
        })),
    );
  const standard = fields.filter(
    (field) => !String(field.classes).includes('rv-dialog__title-input'),
  );
  expect(standard.length).toBeGreaterThan(40);
  for (const field of standard) {
    expect(field.height, `${field.label} height`).toBe(32);
    expect(field.font, `${field.label} font`).toBe('14px');
  }
});

test('header uses icon theme button and animation switch', async ({ page }) => {
  await page.goto('/');
  const theme = page.getByRole('button', { name: 'Theme', exact: true });
  await expect(theme.locator('svg')).toHaveCount(1);
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const motion = page.getByRole('switch', { name: 'Animations', exact: true });
  await motion.uncheck();
  await expect(page.locator('html')).toHaveAttribute(
    'data-rv-ui-motion',
    'off',
  );
  await motion.check();
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-rv-ui-motion',
    'off',
  );
});

test('component search remains visible while sidebar navigation scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/#buttons');
  const sidebar = page.locator('.catalog-sidebar');
  await sidebar.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const search = (await page
    .getByRole('searchbox', { name: 'Find a component' })
    .boundingBox())!;
  const bounds = (await sidebar.boundingBox())!;
  expect(search.y).toBeGreaterThanOrEqual(bounds.y);
  expect(search.y + search.height).toBeLessThan(bounds.y + 70);
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('slider');
  await expect(
    sidebar.getByRole('link', { name: 'Sliders', exact: true }),
  ).toBeVisible();
});

test('spending highlights only the largest category in orange', async ({
  page,
}) => {
  await page.goto('/');
  const colors = await page
    .locator('.finance-spending .rv-distribution-chart__bar')
    .evaluateAll((bars) =>
      bars.map((bar) => getComputedStyle(bar).backgroundColor),
    );
  expect(colors.filter((color) => color === 'rgb(249, 115, 22)')).toHaveLength(
    1,
  );
  expect(colors[0]).toBe('rgb(249, 115, 22)');
  const firstDatum = page
    .locator('.finance-spending [role="listitem"]')
    .first();
  await firstDatum.scrollIntoViewIfNeeded();
  await firstDatum.hover();
  await expect(firstDatum.getByRole('tooltip')).toBeVisible();
  const marker = page
    .locator('.finance-spending .rv-distribution-chart__tooltip i')
    .first();
  await expect(marker).toHaveCSS('background-color', colors[0]);
  expect(new Set(colors.slice(1)).size).toBe(1);
  expect(colors[1]).not.toBe(colors[0]);
});

test('rounded buttons share pill styling across variants and navigation', async ({
  page,
}) => {
  await page.goto('/#buttons');
  const pills = page.locator('#example-rounded-buttons .rv-btn-rounded');
  await expect(pills).toHaveCount(8);
  for (const pill of await pills.all()) {
    await expect(pill).toHaveCSS('border-radius', '9999px');
    await expect(pill).not.toHaveAttribute('rounded');
  }
  await page.getByRole('link', { name: 'Browse sliders', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/sliders\/$/);
  await page.goto('/');
  await expect(page.locator('.home-browse .rv-btn-rounded')).toHaveCount(7);
});

test('solid home navigation button retains contrasting text', async ({
  page,
}) => {
  await page.goto('/');
  const button = page
    .getByRole('link', { name: 'Explore components', exact: true })
    .first();
  const colors = await button.evaluate((el) => ({
    text: getComputedStyle(el).color,
    background: getComputedStyle(el).backgroundColor,
  }));
  expect(colors.text).not.toBe(colors.background);
  expect(colors.text).toBe('rgb(255, 255, 255)');
});

test('framework guide covers supported adapters and works on mobile', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Library pages' })
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Getting started',
  );
  await expect(
    page.getByRole('heading', { name: 'Install the package', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.framework-card')).toHaveCount(0);
  const navigation = page.getByRole('navigation', {
    name: 'Documentation navigation',
  });
  for (const name of [
    'React',
    'Vue',
    'Angular',
    'Svelte',
    'Preact',
    'Vanilla TypeScript',
  ]) {
    await navigation.getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `${name} integration`,
    );
    await expect(page.locator('.framework-card')).toHaveCount(1);
  }
  await navigation.getByRole('link', { name: 'Svelte', exact: true }).click();
  await expect(page.locator('#svelte pre')).toContainText(
    '@revolist/ui/svelte',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.locator('#svelte summary').click();
  await expect(page.locator('#svelte pre')).toBeHidden();
});

test('overview introduces frameworks and links to adapter pages', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.locator('.home-frameworks');
  await expect(section.getByRole('heading')).toHaveText(
    'Fits the stack you already use.',
  );
  await expect(section.locator('.home-framework-card')).toHaveCount(6);
  await section.getByRole('link', { name: /Vue/ }).click();
  await expect(page).toHaveURL(/\/frameworks\/vue\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Vue integration',
  );
});

test('hero framework link jumps to overview integrations', async ({ page }) => {
  await page.goto('/');
  await page.locator('.home-framework-link').first().click();
  await expect(page).toHaveURL(/#frameworks$/);
  await expect(page.locator('#frameworks')).toBeVisible();
  await expect(page.locator('.home-hero')).toHaveCount(1);
});

test('framework hero and cards load SVG logos', async ({ page }) => {
  await page.goto('/');
  const logos = page.locator(
    '.home-framework-links img, .home-framework-card img',
  );
  await expect(logos).toHaveCount(12);
  await expect
    .poll(() =>
      logos.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
});

test('standalone dropdown has balanced text and caret insets', async ({
  page,
}) => {
  await page.goto('/');
  const select = page.getByRole('combobox', {
    name: 'Planning team member',
    exact: true,
  });
  for (const rtl of [false, true]) {
    if (rtl)
      await page
        .getByRole('switch', { name: 'Right to left', exact: true })
        .check();
    const sizes = await select.evaluate((el) => {
      const caret = el
        .querySelector('.dropdown-arrow')!
        .getBoundingClientRect();
      const value = el
        .querySelector('.selected-value')!
        .getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      return {
        caret: caret.width,
        right: rect.right - caret.right,
        left: caret.left - rect.left,
        valueLeft: value.left - rect.left,
        valueRight: rect.right - value.right,
      };
    });
    expect(sizes.caret).toBe(9);
    expect(rtl ? sizes.left : sizes.right).toBe(13);
    expect(rtl ? sizes.valueRight : sizes.valueLeft).toBe(13);
  }
});

test('selects page includes user photos in selected value and options', async ({
  page,
}) => {
  await page.goto('/#selects-chips-and-resources');
  const select = page.getByRole('combobox', {
    name: 'Choose a team member',
    exact: true,
  });
  await expect(select.locator('img')).toHaveCount(1);
  await select.click();
  const popup = page.locator(
    '#' + (await select.getAttribute('aria-controls')),
  );
  await expect(popup.getByRole('option').locator('img')).toHaveCount(2);
  await popup.getByRole('option', { name: 'Sam Rivera', exact: true }).click();
  await expect(select).toHaveText('Sam Rivera');
  await expect(select.locator('img')).toHaveCount(1);
});

test('header repository link, favicon and pre-rendered SEO work together', async ({
  page,
  request,
}) => {
  const response = await request.get('/');
  const html = await response.text();
  expect(html).toContain('Components for finance,');
  expect(html).toContain('https://ui.rv-grid.com/og-image.png');
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Revo UI on GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/revolist/revo-ui');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('.home-hero')).toHaveCount(1);
});

test('footer product names link to RevoGrid and Pro documentation', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.locator('.catalog-footer');
  const products = {
    RevoGrid: 'https://rv-grid.com/',
    'Grid Pro': 'https://pro.rv-grid.com/',
    Pivot: 'https://rv-grid.com/pivot/',
    Charts: 'https://rv-grid.com/charts/',
    Gantt: 'https://rv-grid.com/gantt/',
    Scheduler: 'https://rv-grid.com/jsscheduler/',
    Kanban: 'https://rv-grid.com/kanban/',
  };
  for (const [name, url] of Object.entries(products)) {
    await expect(
      footer.getByRole('link', { name, exact: true }),
    ).toHaveAttribute('href', url);
  }
});

test('component pages keep the GitHub star link visible on desktop and mobile', async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/components/timeline-track/');
    const star = page
      .getByRole('navigation', { name: 'Library pages' })
      .getByRole('link', { name: 'Star on GitHub' });
    await expect(star).toBeVisible();
    await expect(star).toHaveAttribute(
      'href',
      'https://github.com/revolist/revo-ui',
    );
    const bounds = await star.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
});

test('wide planner keeps member controls in the grid column beside the summary', async ({
  page,
}) => {
  await page.goto('/');
  const planner = page.locator('.home-weekly-planner');
  await planner.evaluate((element) => {
    element.style.width = '1000px';
    element.style.maxWidth = 'none';
  });
  const controls = (await planner
    .locator('.planning-member-actions')
    .boundingBox())!;
  const summary = (await planner
    .getByRole('complementary', { name: 'Weekly priorities' })
    .boundingBox())!;
  const gridPanel = (await planner.locator('.planning-grid-panel').boundingBox())!;
  expect(controls.x + controls.width).toBeLessThanOrEqual(summary.x);
  expect(Math.abs(summary.y - gridPanel.y)).toBeLessThan(5);
});
