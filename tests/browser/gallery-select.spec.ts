import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test('gallery select uses the shared dropdown and preserves disabled choices', async ({
  page,
}) => {
  await page.goto('/#components');
  const select = page.getByRole('combobox', { name: 'View', exact: true });
  await expect(select).toHaveText('Table');
  await select.click();
  const list = page.locator('#' + (await select.getAttribute('aria-controls')));
  await expect(
    list.getByRole('option', { name: 'Calendar', exact: true }),
  ).toHaveAttribute('aria-disabled', 'true');
  await list.getByRole('option', { name: 'Board', exact: true }).click();
  await expect(select).toHaveText('Board');
});

test('gallery settings and forms use shared dropdowns throughout', async ({
  page,
}) => {
  await page.goto('/#components');
  await expect(page.locator('select')).toHaveCount(0);
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('switch', { name: 'Animations', exact: true }).uncheck();
  await expect(page.locator('html')).toHaveAttribute(
    'data-rv-ui-motion',
    'off',
  );
  await chooseOption(
    page.getByRole('combobox', { name: 'Sizing mode', exact: true }),
    'Auto',
  );
  await expect(
    page.getByRole('combobox', { name: 'Sizing mode', exact: true }),
  ).toHaveText('Auto');
  await chooseOption(
    page.getByRole('combobox', { name: 'Rows per page', exact: true }),
    '25',
  );
  await expect(
    page.getByRole('combobox', { name: 'Rows per page', exact: true }),
  ).toHaveText('25');
  await page.goto('/?page=colors');
  await expect(page.locator('select')).toHaveCount(0);
});
