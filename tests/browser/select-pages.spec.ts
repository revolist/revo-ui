import { expect, test } from '@playwright/test';
const selects = '/components/multi-selects-autocomplete/';

for (const width of [1280, 390]) {
  test(`selects and autocomplete group remote lookup without resource/avatar demos at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(selects);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Multi/selects, autocomplete',
    );
    for (const id of [
      'select',
      'autocomplete-input',
      'editable-tags',
      'remote-lookup-field',
    ]) {
      await expect(page.locator(`#example-${id}`)).toBeVisible();
    }
    await expect(
      page.locator('#example-avatar, #example-user-select-with-images'),
    ).toHaveCount(0);
    await expect(
      page.locator(
        '.catalog-sidebar a[href="/components/remote-lookup-field/"]',
      ),
    ).toHaveCount(0);
    const remote = page.locator('#example-remote-lookup-field');
    await remote
      .getByRole('button', { name: 'Select linked record', exact: true })
      .click();
    await remote
      .getByRole('combobox', { name: 'Linked records', exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'Search options', exact: true })
      .fill('des');
    await page.getByRole('option', { name: 'Design', exact: true }).click();
    await expect(remote.locator('output')).toHaveText('"design"');
  });
  test(`resource page owns avatar and person selector examples at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/resource-selection/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Resource selection',
    );
    await expect(page.locator('#example-avatar')).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Choose a team member', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('searchbox', { name: 'Search people', exact: true }),
    ).toBeVisible();
    await expect(page.locator('#example-remote-lookup-field')).toHaveCount(0);
  });
}

test('moved API references link to the owning gallery families', async ({
  page,
}) => {
  for (const [name, family, route] of [
    ['LookupField', 'multi/selects, autocomplete', selects],
    ['Avatar', 'resource selection', '/components/resource-selection/'],
    ['AssigneePicker', 'assignee field', '/components/assignee-field/'],
  ]) {
    await page.goto(`/api/${name.toLowerCase()}/`);
    await expect(
      page.getByRole('link', {
        name: `View ${family} examples →`,
        exact: true,
      }),
    ).toHaveAttribute('href', route);
  }
});

test('legacy select and remote page links redirect to the new destinations', async ({
  page,
}) => {
  for (const [old, target] of [
    ['/components/selects-chips-and-resources/', selects],
    [
      '/components/remote-lookup-field/',
      `${selects}#example-remote-lookup-field`,
    ],
    [
      '/components/selects-chips-and-resources/#example-avatar',
      '/components/resource-selection/#example-avatar',
    ],
    ['/#selects-chips-and-resources', selects],
  ]) {
    await page.goto(old);
    await expect(page).toHaveURL(new URL(target, page.url()).href);
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(
      'Component not found',
    );
  }
});
