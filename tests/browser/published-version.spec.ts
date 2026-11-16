import { expect, test } from '@playwright/test';

const metadataUrl = 'https://registry.npmjs.org/@revolist%2Fui/latest';

test('header follows npm latest on page load and tab return', async ({
  page,
}) => {
  let version = '4.0.19';
  await page.route(metadataUrl, (route) =>
    route.fulfill({ json: { version } }),
  );
  await page.goto('/');
  const badge = page.getByLabel('UI library version');
  await expect(badge).toHaveText('v4.0.19');
  version = '4.0.20';
  await page.evaluate(() =>
    document.dispatchEvent(new Event('visibilitychange')),
  );
  await expect(badge).toHaveText('v4.0.20');
  await page.reload();
  await expect(badge).toHaveText('v4.0.20');
});

test('unavailable npm metadata never falls back to a misleading local version', async ({
  page,
}) => {
  let unavailable = false;
  await page.route(metadataUrl, (route) =>
    route.fulfill(
      unavailable
        ? { status: 503, body: 'Unavailable' }
        : { json: { version: '4.0.19' } },
    ),
  );
  await page.goto('/');
  await expect(page.getByLabel('UI library version')).toHaveText('v4.0.19');
  unavailable = true;
  await page.evaluate(() =>
    document.dispatchEvent(new Event('visibilitychange')),
  );
  await expect(page.getByLabel('UI library version')).toHaveCount(0);
});

test('invalid registry versions are not shown', async ({ page }) => {
  await page.route(metadataUrl, (route) =>
    route.fulfill({ json: { version: 'not a release' } }),
  );
  await page.goto('/');
  await expect(page.getByLabel('UI library version')).toHaveCount(0);
});

test('API sidebar, heading and gallery header share the published version and refresh together', async ({
  page,
}) => {
  let version = '4.0.25';
  let requests = 0;
  await page.route(metadataUrl, (route) => {
    requests++;
    return route.fulfill({ json: { version } });
  });
  await page.goto('/api/pagination/');
  await expect(page.getByLabel('UI library version')).toHaveText('v4.0.25');
  await expect(page.locator('.api-sidebar-title span')).toHaveText('v4.0.25');
  await expect(page.locator('.api-eyebrow')).toHaveText(
    'DEVELOPER REFERENCE · v4.0.25',
  );
  expect(requests).toBe(1);
  version = '4.0.26';
  await page.evaluate(() =>
    document.dispatchEvent(new Event('visibilitychange')),
  );
  await expect(page.getByLabel('UI library version')).toHaveText('v4.0.26');
  await expect(page.locator('.api-sidebar-title span')).toHaveText('v4.0.26');
  await expect(page.locator('.api-eyebrow')).toHaveText(
    'DEVELOPER REFERENCE · v4.0.26',
  );
  expect(requests).toBe(2);
});

for (const response of ['unavailable', 'invalid'] as const) {
  test(`API reference never shows the stale local version when npm is ${response}`, async ({
    page,
  }) => {
    await page.route(metadataUrl, (route) =>
      route.fulfill(
        response === 'unavailable'
          ? { status: 503, body: 'Unavailable' }
          : { json: { version: 'not a release' } },
      ),
    );
    await page.goto('/api/pagination/');
    await expect(
      page.getByRole('heading', { name: 'Pagination API', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.api-sidebar-title')).toHaveText(
      'API reference',
    );
    await expect(page.locator('.api-eyebrow')).toHaveText(
      'DEVELOPER REFERENCE',
    );
    await expect(page.getByLabel('UI library version')).toHaveCount(0);
  });
}

test('API reference has no baked version while published metadata is pending', async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(metadataUrl, async (route) => {
    await pending;
    await route.fulfill({ json: { version: '4.0.25' } });
  });
  await page.goto('/api/pagination/');
  try {
    await expect(
      page.getByRole('heading', { name: 'Pagination API', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.api-sidebar-title')).toHaveText(
      'API reference',
    );
    await expect(page.locator('.api-eyebrow')).toHaveText(
      'DEVELOPER REFERENCE',
    );
    await expect(page.getByLabel('UI library version')).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.locator('.api-sidebar-title span')).toHaveText('v4.0.25');
  await expect(page.locator('.api-eyebrow')).toHaveText(
    'DEVELOPER REFERENCE · v4.0.25',
  );
});
