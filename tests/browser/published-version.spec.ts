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
