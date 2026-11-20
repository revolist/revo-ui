import { expect, test } from '@playwright/test';

test('the component picker exposes one remove button', async ({ page }) => {
  await page.goto('/customize/');
  const picker = page
    .locator('.theme-editor--standalone')
    .getByRole('combobox', { name: 'Component', exact: true });
  await picker.click();
  const search = page.getByRole('textbox', {
    name: 'Search components to edit',
  });
  await search.fill('RemoveButton');
  await expect(
    page.getByRole('option', { name: 'RemoveButton', exact: true }),
  ).toBeVisible();
  await search.fill('DeleteButton');
  await expect(
    page.getByRole('option', { name: 'DeleteButton', exact: true }),
  ).toHaveCount(0);
});
