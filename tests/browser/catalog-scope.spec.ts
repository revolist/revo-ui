import { test, expect } from './gallery-test';

test.describe('focused gallery fixtures', () => {
  test.use({ gallerySections: ['buttons'] });
  test('mounts only the requested family and keeps its interactions working', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('.catalog-section')).toHaveCount(1);
    await expect(page.locator('#buttons')).toBeVisible();
    await expect(
      page.locator('#ai-assistant, #pdf-viewer, #calendar-and-dates'),
    ).toHaveCount(0);
    await expect(
      page
        .getByRole('navigation', { name: 'Component sections' })
        .getByRole('link'),
    ).toHaveCount(2);
    await expect(
      page
        .getByRole('navigation', { name: 'Component sections' })
        .getByRole('link', { name: 'Overview', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.locator('output[aria-label="Button action"]')).toHaveText(
      'Add task clicked',
    );
    await page
      .getByRole('searchbox', { name: 'Find a component' })
      .fill('button');
    await expect(page.locator('#buttons')).toBeVisible();
  });
});

test('ordinary gallery fixtures exclude PDF mounting while retaining navigation', async ({
  page,
}) => {
  await page.goto('/#components');
  await expect(page.locator('#buttons')).toBeVisible();
  await expect(page.locator('#pdf-viewer')).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Component sections' })
      .getByRole('link', { name: 'AI assistant', exact: true }),
  ).toBeVisible();
});
