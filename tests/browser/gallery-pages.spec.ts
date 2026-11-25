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
    'Multi/selects, autocomplete',
  );
  expect(await page.locator('.catalog-example').count()).toBeGreaterThan(1);
  const search = page.getByRole('searchbox', { name: 'Find a component' });
  await search.fill('switch');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Multi/selects, autocomplete',
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
    'Multi/selects, autocomplete',
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
    'Multi/selects, autocomplete',
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
    .locator('td')
    .nth(1);
  await expect(equityWeight.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '70',
  );
  await expect(equityWeight.locator('span').last()).toHaveText('70%');
  const bar = (await equityWeight.getByRole('progressbar').boundingBox())!;
  const label = (await equityWeight.locator('span').last().boundingBox())!;
  expect(label.x).toBeGreaterThanOrEqual(bar.x + bar.width);
  expect(
    Math.abs(label.y + label.height / 2 - (bar.y + bar.height / 2)),
  ).toBeLessThan(2);
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
  for (const table of [holdings, invoiceTable]) {
    await expect(
      table.locator('tbody tr:first-child > :first-child'),
    ).toHaveCSS('padding-inline-start', '10px');
    await expect(table.locator('thead th:first-child')).toHaveCSS(
      'padding-inline-start',
      '10px',
    );
    await expect(table.locator('tbody tr:first-child > :last-child')).toHaveCSS(
      'padding-inline-end',
      '10px',
    );
  }
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
  await page.goto('/#multi-selects-autocomplete');
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

test('header theme button and customize panel animation switch work', async ({
  page,
}) => {
  await page.goto('/');
  const theme = page.getByRole('button', { name: 'Theme', exact: true });
  await expect(theme.locator('svg')).toHaveCount(1);
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
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

for (const width of [1280, 390]) {
  for (const theme of ['light', 'dark']) {
    test(`documentation categories keep every guide accessible at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (value) => localStorage.setItem('revo-ui-theme', value),
        theme,
      );
      await page.goto('/frameworks/');
      const navigation = page.getByRole('navigation', {
        name: 'Documentation navigation',
      });
      const categories = {
        Essentials: [
          'Getting started',
          'JavaScript / CDN',
          'Bundle size',
          'Themes and presets',
          'Customize components',
          'Accessibility',
        ],
        'Framework adapters': [
          'React',
          'Vue',
          'Angular',
          'Svelte',
          'Preact',
          'Vanilla TypeScript',
        ],
        'Server rendering': [
          'SSR',
          'Next.js SSR',
          'Nuxt SSR',
          'SvelteKit SSR',
          'Astro SSR',
          'Angular SSR',
          'React Router SSR',
          'TanStack Start SSR',
          'NestJS',
        ],
        Integrations: ['Refine', 'Lovable'],
      };
      await expect(navigation.getByRole('group')).toHaveCount(4);
      for (const [category, links] of Object.entries(categories)) {
        await expect(
          navigation
            .getByRole('group', { name: category, exact: true })
            .getByRole('link'),
        ).toHaveText(links);
      }
      await expect(navigation.getByRole('link')).toHaveCount(22);
      await navigation
        .getByRole('link', { name: 'Next.js SSR', exact: true })
        .click();
      await expect(
        navigation.getByRole('link', { name: 'Next.js SSR', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Next.js App Router and Revo UI',
      );
      await navigation
        .getByRole('link', { name: 'Refine', exact: true })
        .click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Refine and Revo UI',
      );
      await expect(navigation.locator('[aria-current="page"]')).toHaveText(
        'Refine',
      );
      if (width === 390) {
        const groups = await navigation
          .getByRole('group')
          .evaluateAll((elements) =>
            elements.map((element) => {
              const bounds = element.getBoundingClientRect();
              return { top: bounds.top, bottom: bounds.bottom };
            }),
          );
        for (let index = 1; index < groups.length; index++) {
          expect(
            groups[index].top - groups[index - 1].bottom,
          ).toBeGreaterThanOrEqual(20);
        }
        await page
          .getByRole('button', { name: 'Customize', exact: true })
          .click();
        await page
          .getByRole('switch', { name: 'Right to left', exact: true })
          .click();
        await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });
  }
}

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
    if (rtl) {
      await page
        .getByRole('button', { name: 'Customize', exact: true })
        .click();
      await page
        .getByRole('switch', { name: 'Right to left', exact: true })
        .check();
      await page
        .getByRole('button', { name: 'Customize', exact: true })
        .click();
    }
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

test('resource selection page includes user photos in selected value and options', async ({
  page,
}) => {
  await page.goto('/components/resource-selection/');
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
  expect(html).toMatch(
    /<h1[^>]*>Components for<br\s*\/?\s*>data-rich applications\.<\/h1>/,
  );
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

test('header navigation omits the star request on desktop and mobile', async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/components/timeline-track/');
    const navigation = page.getByRole('navigation', { name: 'Library pages' });
    await expect(
      navigation.getByRole('link', { name: 'Star on GitHub' }),
    ).toHaveCount(0);
    await expect(navigation.getByRole('link')).toHaveText([
      'Overview',
      'Components',
      'Docs',
      'API',
    ]);
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
  const gridPanel = (await planner
    .locator('.planning-grid-panel')
    .boundingBox())!;
  expect(controls.x + controls.width).toBeLessThanOrEqual(summary.x);
  expect(Math.abs(summary.y - gridPanel.y)).toBeLessThan(5);
});

test('resource selection has a dedicated picker page', async ({ page }) => {
  await page.goto('/components/resource-selection/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Resource selection',
  );
  await expect(
    page.getByRole('searchbox', { name: 'Search people' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Component sections' })
      .getByRole('link', {
        name: 'Resource selection',
        exact: true,
      }),
  ).toBeVisible();
  await page.goto('/components/multi-selects-autocomplete/');
  await expect(
    page.getByRole('searchbox', { name: 'Search people' }),
  ).toHaveCount(0);
});

test('sidebar finds individual controls and links to their examples', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  const navigation = page.getByRole('navigation', {
    name: 'Component sections',
  });
  const search = page.getByRole('searchbox', { name: 'Find a component' });
  await search.fill('mini calendar');
  const miniCalendar = navigation.getByRole('link', {
    name: 'Mini Calendar',
    exact: true,
  });
  await expect(miniCalendar).toBeVisible();
  await miniCalendar.click();
  await expect(page).toHaveURL(
    /\/components\/calendar-and-dates\/#example-mini-calendar$/,
  );
  await expect(page.locator('#example-mini-calendar')).toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('benchmark card');
  await expect(
    navigation.getByRole('link', { name: 'Benchmark Card', exact: true }),
  ).toBeVisible();
  await search.fill('toast');
  await expect(
    navigation.getByRole('link', { name: 'Toaster', exact: true }),
  ).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: 'Toast notifications', exact: true }),
  ).toHaveCount(0);
  await search.fill('MetricTile');
  await expect(
    navigation.getByRole('link', { name: 'Metric Tile', exact: true }),
  ).toHaveCount(0);
});

test('sidebar component links open live gallery examples', async ({ page }) => {
  await page.goto('/components/buttons/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const link = nav.getByRole('link', { name: 'Button Group', exact: true });
  await expect(link).toHaveAttribute(
    'href',
    '/components/buttons/#example-button-group',
  );
  await expect(
    nav.getByRole('link', { name: 'Icon Button', exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Svg Button', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Svg Icon', exact: true }),
  ).toHaveCount(0);
  await link.click();
  await expect(page).toHaveURL(/\/components\/buttons\/#example-button-group$/);
  await expect(page.locator('#example-button-group')).toBeVisible();
  await expect(link).toHaveAttribute('aria-current', 'location');
  await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
  await expect(
    nav.getByRole('link', { name: 'ButtonGroup', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('toaster');
  await expect(
    nav.getByRole('link', { name: 'Toaster', exact: true }),
  ).toHaveAttribute(
    'href',
    '/components/status-and-feedback/#example-toast-notifications',
  );
});

test('sidebar restores the active component position on reload', async ({
  page,
}) => {
  await page.goto(
    '/components/status-and-feedback/#example-toast-notifications',
  );
  const sidebar = page.locator('#component-navigation');
  const active = sidebar.getByRole('link', { name: 'Toaster', exact: true });
  await expect(active).toHaveAttribute('aria-current', 'location');
  await page.reload();
  await expect(active).toHaveAttribute('aria-current', 'location');
  await expect
    .poll(async () => sidebar.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  const positions = await sidebar.evaluate((element) => {
    const item = [...element.querySelectorAll('a')].find(
      (link) => link.textContent?.trim() === 'Toaster',
    )!;
    const bounds = element.getBoundingClientRect();
    const target = item.getBoundingClientRect();
    return {
      top: target.top - bounds.top,
      bottom: bounds.bottom - target.bottom,
    };
  });
  expect(positions.top).toBeGreaterThanOrEqual(0);
  expect(positions.bottom).toBeGreaterThanOrEqual(0);
});

test('sidebar navigation updates content without reloading and supports history', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  await page.evaluate(() => {
    (window as Window & { galleryMarker?: number }).galleryMarker = 123;
  });
  const sidebar = page.getByRole('navigation', { name: 'Component sections' });
  await sidebar
    .getByRole('link', { name: 'Calendar and dates', exact: true })
    .click();
  await expect(page).toHaveURL(/\/components\/calendar-and-dates\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Calendar and dates',
  );
  expect(
    await page.evaluate(
      () => (window as Window & { galleryMarker?: number }).galleryMarker,
    ),
  ).toBe(123);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Buttons');
  expect(
    await page.evaluate(
      () => (window as Window & { galleryMarker?: number }).galleryMarker,
    ),
  ).toBe(123);
});

test('sidebar merges controls with the same destination and searches their aliases', async ({
  page,
}) => {
  await page.goto('/components/menus-and-toolbars/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const groups = await nav
    .locator('.catalog-nav-examples')
    .evaluateAll((lists) =>
      lists.map((list) =>
        [...list.querySelectorAll('a')].map((link) =>
          link.getAttribute('href'),
        ),
      ),
    );
  for (const hrefs of groups) expect(new Set(hrefs).size).toBe(hrefs.length);
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('MenuSeparator');
  const result = nav.getByRole('link', { name: 'Menu Separator', exact: true });
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute(
    'href',
    /^\/components\/menus-and-toolbars\//,
  );
});

test('sidebar indents controls beneath their family with a vertical guide', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const family = nav.getByRole('link', { name: 'Buttons', exact: true });
  const control = nav.getByRole('link', { name: 'Button Group', exact: true });
  await expect(control).toBeVisible();
  const geometry = await control.evaluate((element) => {
    const list = element.closest('ul')!;
    const parent = list.parentElement!.querySelector(
      '.catalog-nav-family-link',
    )!;
    const parentStyle = getComputedStyle(parent);
    return {
      parentText:
        parent.getBoundingClientRect().left +
        parseFloat(parentStyle.paddingLeft),
      guide: list.getBoundingClientRect().left,
      child: element.getBoundingClientRect().left,
      border: getComputedStyle(list).borderInlineStartStyle,
      parentFont: parentStyle.fontSize,
      childFont: getComputedStyle(element).fontSize,
    };
  });
  await expect(family).toBeVisible();
  expect(geometry.border).toBe('solid');
  expect(Math.abs(geometry.guide - geometry.parentText)).toBeLessThan(1);
  expect(geometry.child).toBeGreaterThan(geometry.guide);
  expect(geometry.parentFont).toBe(geometry.childFont);
});

test('sidebar does not repeat a control already named by its family', async ({
  page,
}) => {
  await page.goto('/components/command-palette/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const family = nav.getByRole('link', {
    name: 'Command palette',
    exact: true,
  });
  await expect(family).toBeVisible();
  await expect(family).toHaveAttribute('data-controls', /CommandPalette/);
  await expect(
    nav.getByRole('link', { name: 'Command Palette', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('CommandPalette');
  await expect(family).toBeVisible();
});

test('sidebar merges singular and plural versions of the same control', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const chips = nav.getByRole('link', { name: 'Choice Chips', exact: true });
  await expect(chips).toBeVisible();
  await expect(chips).toHaveAttribute('data-controls', /ChoiceChip/);
  await expect(chips).toHaveAttribute('data-controls', /ChoiceChips/);
  await expect(
    nav.getByRole('link', { name: 'Choice Chip', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('ChoiceChip');
  const matching = nav
    .locator('[data-controls]')
    .filter({ hasText: /Choice Chip/ });
  await expect(matching).toHaveCount(1);
});

test('appearance configurator has a readable, interactive layout', async ({
  page,
}) => {
  await page.goto('/components/field-configurators/');
  const example = page.locator('#example-appearance-configurator');
  const control = example.locator('.rv-appearance-configurator');
  await expect(control).toHaveCSS('display', 'flex');
  await expect(control).toHaveCSS('flex-direction', 'column');
  const switches = control.getByRole('switch');
  await expect(switches).toHaveCount(4);
  const bounds = await switches.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, width: rect.width };
    }),
  );
  for (let i = 1; i < bounds.length; i++)
    expect(bounds[i].top).toBeGreaterThanOrEqual(bounds[i - 1].bottom);
  expect(bounds.every((rect) => rect.width >= 240)).toBe(true);
  const density = control.getByRole('combobox', { name: 'Density' });
  await density.click();
  await page.getByRole('option', { name: 'Compact', exact: true }).click();
  await expect(density).toContainText('Compact');
  const stripes = control.getByRole('switch', { name: 'Row stripes' });
  await stripes.click();
  await expect(stripes).toHaveAttribute('aria-checked', 'true');
  const reset = control.getByRole('button', { name: 'Reset', exact: true });
  await expect(reset).toHaveText('Reset');
  await reset.click();
  await expect(stripes).toHaveAttribute('aria-checked', 'false');
  await expect(density).toContainText('Comfortable');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test('search action bar uses the same icon as the search field', async ({
  page,
}) => {
  await page.goto('/components/inputs-and-forms/');
  const fieldIcon = page.locator(
    '#example-search-input .rv-search-input-icon svg',
  );
  const barIcon = page.locator(
    '#example-search-action-bar .rv-search-input-icon svg',
  );
  await expect(fieldIcon).toBeVisible();
  await expect(barIcon).toBeVisible();
  const field = await fieldIcon.evaluate((svg) => ({
    markup: svg.innerHTML,
    fill: getComputedStyle(svg).fill,
  }));
  const bar = await barIcon.evaluate((svg) => ({
    markup: svg.innerHTML,
    fill: getComputedStyle(svg).fill,
  }));
  expect(bar).toEqual(field);
});

test('highlighted input demonstrates live expression highlighting', async ({
  page,
}) => {
  await page.goto('/components/inputs-and-forms/');
  const example = page.locator('#example-highlighted-text-input');
  const input = example.getByRole('textbox', { name: 'Expression' });
  const highlight = example.locator('[data-part="highlight"]');
  await expect(highlight.locator('.highlighted-example-variable')).toHaveText(
    'value',
  );
  await expect(highlight.locator('.highlighted-example-number')).toHaveText(
    '100',
  );
  await input.fill('value > 250');
  await expect(highlight.locator('.highlighted-example-number')).toHaveText(
    '250',
  );
});

test('record navigation uses balanced controls and spaced position text', async ({
  page,
}) => {
  await page.goto('/components/layout/');
  const nav = page.locator('#example-record-navigation .rv-record-navigation');
  const previous = nav.getByRole('button', { name: 'Previous record' });
  const next = nav.getByRole('button', { name: 'Next record' });
  const label = nav.locator('.rv-record-navigation__position');
  await expect(previous).toBeDisabled();
  await expect(previous.locator('svg')).toBeVisible();
  await expect(next.locator('svg')).toBeVisible();
  const first = await previous.boundingBox();
  const second = await next.boundingBox();
  expect(first!.width).toBe(second!.width);
  expect(first!.height).toBe(second!.height);
  expect(
    await label.evaluate((element) =>
      parseFloat(getComputedStyle(element).paddingLeft),
    ),
  ).toBeGreaterThan(0);
  await next.click();
  await expect(nav).toContainText('2 of 3');
});

test('metric progress row uses the shared progress bar', async ({ page }) => {
  await page.goto('/components/layout/');
  const row = page.locator(
    '#example-metric-progress-row .rv-metric-progress-row',
  );
  const bar = row.getByRole('progressbar', { name: 'Budget spent' });
  await expect(bar).toHaveClass(/rv-progress-bar/);
  await expect(bar).toHaveAttribute('aria-valuenow', '72');
  await expect(bar.locator('.rv-progress-bar__fill')).toHaveCSS('width', /px/);
  await expect(row).toHaveCSS('display', 'flex');
  await expect(row).toContainText('This quarter');
});

test('sidebar only links to relevant examples and uses matching headings', async ({
  page,
}) => {
  await page.goto('/components/menus-and-toolbars/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  for (const [name, id] of [
    ['Action Bar', 'bulk-file-actions'],
    ['Icon Toolbar', 'zoom-and-pan-controls'],
  ]) {
    const link = nav.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', new RegExp(`#example-${id}$`));
    await link.click();
    await expect(page.locator(`#example-${id} h3`)).toHaveText(name);
  }
  for (const name of [
    'Svg Button',
    'Svg Icon',
    'Editor List',
    'Tabs',
    'Duration Draft',
    'Duration Field',
  ]) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
});

test('field configurators and typography navigation match their examples', async ({
  page,
}) => {
  await page.goto('/components/field-configurators/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  const fieldGroup = nav.getByRole('link', {
    name: 'Field Group',
    exact: true,
  });
  await expect(fieldGroup).toBeVisible();
  await expect(
    nav.locator('[aria-label="Field configurators controls"] a').first(),
  ).toHaveText('Field Group');
  await expect(
    page.locator('.catalog-section .catalog-example').first().locator('h3'),
  ).toHaveText('Field Group');
  await expect(fieldGroup).toHaveAttribute(
    'href',
    /#example-selected-field-group$/,
  );
  for (const name of ['Field Icon', 'Field Row', 'Filter Badge']) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
  await expect(
    nav.getByRole('link', { name: 'Typography controls', exact: true }),
  ).toHaveCount(1);
  await expect(
    nav.getByRole('link', { name: 'Formatting controls', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Input', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Chip', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Search Action Bar', exact: true }),
  ).toBeVisible();
});

test('calendar starts with its calendar and weekly time grid has one navigation entry', async ({
  page,
}) => {
  await page.goto('/components/calendar-and-dates/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  await expect(
    page.locator('#calendar-and-dates .catalog-example').first(),
  ).toHaveId('example-calendar');
  await expect(
    nav.getByRole('link', { name: 'Calendar', exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Calendar Day', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Weekly time grid', exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Time Grid', exact: true }),
  ).toHaveCount(0);
  for (const name of [
    'Activity Message',
    'Activity Timeline',
    'Assignee Picker',
    'Dialog Body',
    'Control Tooltip',
  ]) {
    await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
});

test('sidebar omits composition parts and redundant date field links', async ({
  page,
}) => {
  await page.goto('/components/tabs-and-lists/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  await expect(
    nav.getByRole('link', { name: 'Listbox', exact: true }),
  ).toBeVisible();
  const dialogs = nav.locator('.catalog-nav-family').filter({
    has: nav.getByRole('link', {
      name: 'Dialogs and floating surfaces',
      exact: true,
    }),
  });
  await expect(dialogs.locator('.catalog-nav-examples a')).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Tab Panel', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.locator('a[href$="#example-selectable-measures"]'),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Date Time Field', exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole('link', { name: 'Field Group', exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Temporal Picker', exact: true }),
  ).toBeVisible();
});

test('sidebar example destinations exist and are not duplicated within a section', async ({
  page,
  request,
}) => {
  await page.goto('/components/buttons/');
  const nav = page.getByRole('navigation', { name: 'Component sections' });
  await expect(
    nav.getByRole('link', { name: 'Button Group', exact: true }),
  ).toBeVisible();
  const links = await nav.locator('a[data-component]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      label: node.textContent?.trim() ?? '',
      href: node.getAttribute('href') ?? '',
    })),
  );
  const destinations = new Set<string>();
  const byPage = new Map<string, typeof links>();
  for (const link of links) {
    expect(
      destinations.has(link.href),
      `duplicate destination for ${link.label}: ${link.href}`,
    ).toBe(false);
    destinations.add(link.href);
    const url = new URL(link.href, 'http://localhost');
    expect(url.hash, `${link.label} does not point to an example`).toBeTruthy();
    const entries = byPage.get(url.pathname) ?? [];
    entries.push(link);
    byPage.set(url.pathname, entries);
  }
  for (const [path, entries] of byPage) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
    const html = await response.text();
    const ids = await page.evaluate(
      (documentText) =>
        Array.from(
          new DOMParser()
            .parseFromString(documentText, 'text/html')
            .querySelectorAll('[id]'),
          (node) => node.id,
        ),
      html,
    );
    for (const entry of entries) {
      const anchor = new URL(entry.href, 'http://localhost').hash.slice(1);
      expect(
        ids,
        `${entry.label} points to a missing example: ${entry.href}`,
      ).toContain(anchor);
    }
  }
});
