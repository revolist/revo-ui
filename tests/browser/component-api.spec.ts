import { test, expect } from '@playwright/test';

test('dedicated API navigation, types and gallery links', async ({ page }) => {
  await page.goto('/api/typographycontrols/');
  await expect(
    page.getByRole('heading', { name: 'TypographyControls API', exact: true }),
  ).toBeVisible();
  const props = page.getByRole('table', {
    name: 'TypographyControls props',
    exact: true,
  });
  await expect(props).toBeVisible();
  await props
    .getByRole('row')
    .filter({ has: page.locator('code', { hasText: /^value$/ }) })
    .locator('summary')
    .click();
  await expect(props.getByText('fontFamily', { exact: true })).toBeVisible();
  await page.reload();
  await expect(props).toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Find an API component' })
    .fill('button');
  await expect(
    page
      .getByRole('navigation', { name: 'Component APIs' })
      .getByRole('link', { name: 'Button', exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Component APIs' })
      .getByRole('link', { name: 'Calendar', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Component APIs' })
    .getByRole('link', { name: 'Button', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Button API', exact: true }),
  ).toBeVisible();
  await page.mouse.move(1100, 80);
  await page.screenshot({
    path: 'test-results/api-button-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Browse API', exact: true }).click();
  await expect(
    page.getByRole('searchbox', { name: 'Find an API component' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto('/components/buttons/');
  await page
    .getByRole('link', { name: 'API reference', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'API reference', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Browse API', exact: true }).click();
  await expect(
    page
      .getByRole('navigation', { name: 'Component APIs' })
      .getByRole('link', { name: 'Button', exact: true }),
  ).toBeVisible();
});

test('page contents navigate gallery examples and API contract sections', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  const galleryContents = page.getByRole('navigation', {
    name: 'Component page contents',
  });
  await expect(
    galleryContents.getByRole('heading', { name: 'On this page' }),
  ).toBeVisible();
  const example = galleryContents.getByRole('link').first();
  const target = await example.getAttribute('href');
  await example.click();
  await expect(page.locator(target!)).toBeInViewport();
  await galleryContents
    .getByRole('link', { name: 'API reference', exact: true })
    .click();
  await expect(page.locator('#buttons-api')).toBeInViewport();
  await page.goto('/api/button/');
  const apiContents = page.getByRole('navigation', {
    name: 'API page contents',
  });
  await apiContents.getByRole('link', { name: 'Methods', exact: true }).click();
  await expect(page.locator('#api-methods')).toBeInViewport();
  await expect(
    apiContents.getByRole('link', { name: 'Methods', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  await page.reload();
  await expect(page.locator('#api-methods')).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/api/button/');
  await expect(apiContents).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/api/button/');
  await page.mouse.move(1100, 80);
  await page.screenshot({
    path: 'test-results/api-page-contents.png',
    fullPage: true,
  });
});

test('component contents follow example display order', async ({ page }) => {
  await page.goto('/components/buttons/');
  const headings = await page
    .locator('.component-document-main .catalog-example')
    .evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.id,
        title: element.querySelector('h3')!.textContent!.trim(),
      })),
    );
  expect(headings[0].title).toBe('Button variants');
  const links = await page
    .getByRole('navigation', { name: 'Component page contents' })
    .getByRole('link')
    .evaluateAll((elements) =>
      elements.slice(0, -1).map((element) => ({
        id: element.getAttribute('href')!.slice(1),
        title: element.textContent!.trim(),
      })),
    );
  expect(links).toEqual(headings);
});

test('Tooltip has its own gallery family and API backlinks', async ({
  page,
}) => {
  await page.goto('/components/tooltip/');
  await expect(
    page.getByRole('heading', { name: 'Tooltip', exact: true, level: 1 }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Tooltip trigger', exact: true })
    .focus();
  await expect(page.getByRole('tooltip')).toContainText(
    'Keyboard and pointer tooltip',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Component page contents' })
      .getByRole('link', { name: 'Tooltip', exact: true }),
  ).toBeVisible();
  await page.goto('/api/tooltip/');
  await expect(
    page.getByRole('link', { name: 'View tooltip examples →', exact: true }),
  ).toHaveAttribute('href', '/components/tooltip/');
  await page.goto('/components/dialogs-and-floating-surfaces/');
  await expect(
    page.getByRole('button', { name: 'Tooltip trigger', exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Component page contents' })
      .getByRole('link', { name: 'Tooltip', exact: true }),
  ).toHaveCount(0);
});

test('compact header keeps settings behind an overflow button', async ({
  page,
}) => {
  await page.setViewportSize({ width: 840, height: 900 });
  await page.goto('/components/layout/');
  const more = page.getByRole('button', {
    name: 'More gallery options',
    exact: true,
  });
  await expect(more).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toBeHidden();
  await more.click();
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toBeVisible();
  const githubBox = await page
    .getByRole('link', { name: 'Revo UI on GitHub', exact: true })
    .boundingBox();
  const themeBox = await page
    .getByRole('button', { name: 'Theme', exact: true })
    .boundingBox();
  expect(Math.abs(githubBox!.y - themeBox!.y)).toBeLessThan(3);
  const switches = page.locator('.gallery-settings .rv-switch');
  await expect(switches).toHaveCount(2);
  const animationBox = await switches.nth(0).boundingBox();
  const rtlBox = await switches.nth(1).boundingBox();
  expect(rtlBox!.y).toBeGreaterThanOrEqual(
    animationBox!.y + animationBox!.height,
  );
  expect(Math.abs(animationBox!.x - rtlBox!.x)).toBeLessThan(2);
  await page
    .locator('.gallery-settings-content')
    .screenshot({ path: 'test-results/gallery-settings-compact.png' });
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  // Escape dismisses the innermost layer before the containing menu.
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(more).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toBeHidden();
  for (const width of [390, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(more).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Theme', exact: true }),
  ).toBeVisible();
});

test('Accordion showcases the existing CollapsibleSection contract', async ({
  page,
}) => {
  await page.goto('/components/accordion/');
  await expect(
    page.getByRole('heading', { name: 'Accordion', level: 1, exact: true }),
  ).toBeVisible();
  const section = page
    .locator('.rv-collapsible-section')
    .filter({ has: page.locator('summary', { hasText: 'Project details' }) });
  const input = page.getByRole('textbox', {
    name: 'Accordion project name',
    exact: true,
  });
  await input.fill('Saved draft');
  await section.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(input).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Saved draft');
  await page
    .getByRole('navigation', { name: 'Accordion API pages' })
    .getByRole('link', { name: /CollapsibleSection/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'CollapsibleSection API', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('table', { name: 'CollapsibleSection props', exact: true }),
  ).toBeVisible();
});

test('Weekly time grid is a standalone gallery component', async ({ page }) => {
  await page.goto('/components/weekly-time-grid/');
  await expect(
    page.getByRole('heading', {
      name: 'Weekly time grid',
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  const grid = page.getByRole('grid', {
    name: 'Availability slots',
    exact: true,
  });
  await expect(grid).toBeVisible();
  const cell = grid.getByRole('gridcell').first();
  await cell.focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Time selection commits')).not.toHaveText(
    '0 changes committed',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Component page contents' })
      .getByRole('link', { name: 'Weekly time grid', exact: true }),
  ).toBeVisible();
  await page.goto('/api/timegrid/');
  await expect(
    page.getByRole('link', {
      name: 'View weekly time grid examples →',
      exact: true,
    }),
  ).toHaveAttribute('href', '/components/weekly-time-grid/');
  await page.goto('/components/calendar-and-dates/');
  await expect(
    page.getByRole('grid', { name: 'Availability slots', exact: true }),
  ).toHaveCount(0);
});

test('duration and remote lookup have independent gallery pages', async ({
  page,
}) => {
  for (const [route, title, component] of [
    ['duration-and-effort', 'Duration and effort', 'DurationField'],
    ['remote-lookup-field', 'Remote lookup field', 'LookupField'],
  ]) {
    await page.goto(`/components/${route}/`);
    await expect(
      page.getByRole('heading', { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Component page contents' })
        .getByRole('link', { name: title, exact: true }),
    ).toBeVisible();
    await page.goto(`/api/${component.toLowerCase()}/`);
    await expect(
      page.getByRole('heading', { name: `${component} API`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: `View ${title.toLowerCase()} examples →`,
        exact: true,
      }),
    ).toHaveAttribute('href', `/components/${route}/`);
  }
  await page.goto('/components/calendar-and-dates/');
  const contents = page.getByRole('navigation', {
    name: 'Component page contents',
  });
  await expect(
    contents.getByRole('link', { name: 'Duration and effort', exact: true }),
  ).toHaveCount(0);
  await expect(
    contents.getByRole('link', { name: 'Remote lookup field', exact: true }),
  ).toHaveCount(0);
});

test('AssigneeField has a standalone gallery page', async ({ page }) => {
  await page.goto('/components/assignee-field/');
  await expect(
    page.getByRole('heading', {
      name: 'Assignee field',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Component page contents' })
      .getByRole('link', { name: 'Assignee allocation field', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Assign people', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Assign people', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.catalog-example')).toContainText('Ana');
  await page.goto('/api/assigneefield/');
  await expect(
    page.getByRole('link', {
      name: 'View assignee field examples →',
      exact: true,
    }),
  ).toHaveAttribute('href', '/components/assignee-field/');
  await page.goto('/components/calendar-and-dates/');
  await expect(
    page.getByRole('button', { name: 'Assign people', exact: true }),
  ).toHaveCount(0);
});

test('Legend has its own control page and API link', async ({ page }) => {
  await page.goto('/components/legend/');
  await expect(
    page.getByRole('heading', { name: 'Legend', exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Working day', { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Component page contents' })
      .getByRole('link', { name: 'Legend', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Legend API pages' })
    .getByRole('link', { name: /Legend/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Legend API', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View legend examples →', exact: true }),
  ).toHaveAttribute('href', '/components/legend/');
  await page.goto('/components/calendar-and-dates/');
  await expect(
    page.getByRole('heading', { name: 'Legend', exact: true }),
  ).toHaveCount(0);
});
