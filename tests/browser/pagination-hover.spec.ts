import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test.use({ gallerySections: ['pagination'] });

for (const theme of ['light', 'dark']) {
  test(`pagination hover uses a fill without a border in ${theme}`, async ({
    page,
  }) => {
    await page.goto('/#components');
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await page
      .getByRole('switch', { name: 'Animations', exact: true })
      .uncheck();
    const simple = page.getByRole('navigation', {
      name: 'Simple page numbers',
      exact: true,
    });
    const pageFour = simple.getByRole('button', { name: '4', exact: true });
    await pageFour.hover();
    await expect(pageFour).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(pageFour).toHaveCSS(
      'background-color',
      theme === 'light' ? 'rgb(241, 241, 241)' : 'rgb(47, 47, 47)',
    );
    await expect(simple.locator('[aria-current="page"]')).toHaveText('1');
    await pageFour.focus();
    await pageFour.press('Enter');
    await expect(pageFour).toHaveAttribute('aria-current', 'page');
    const panel = page.locator('#pagination .rv-pagination-panel').first();
    const next = panel
      .locator('.rv-pagination-button:not(:disabled):not([aria-current])')
      .first();
    await next.hover();
    await expect(next).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(next).toHaveCSS(
      'background-color',
      theme === 'light' ? 'rgb(241, 241, 241)' : 'rgb(47, 47, 47)',
    );
  });
}

test('native pagination can hide first/last while retaining previous/next and the selector', async ({
  page,
}) => {
  await page.goto('/#pagination');
  const example = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', {
      name: 'Navigation without first/last',
      exact: true,
    }),
  });
  await expect(
    example.getByRole('button', { name: 'First page', exact: true }),
  ).toHaveCount(0);
  await expect(
    example.getByRole('button', { name: 'Last page', exact: true }),
  ).toHaveCount(0);
  await expect(
    example.getByRole('button', { name: 'Previous page', exact: true }),
  ).toBeDisabled();
  await example.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(
    example.getByRole('combobox', { name: 'Page', exact: true }),
  ).toHaveAttribute('data-value', '1');
  await expect(
    example.getByRole('button', { name: 'Previous page', exact: true }),
  ).toBeEnabled();
});
