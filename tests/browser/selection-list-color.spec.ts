import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test.use({
  gallerySections: ['tabs-and-lists', 'resource-selection'],
});

test('selection lists use the resource selection tint in both themes', async ({
  page,
}) => {
  await page.goto('/#components');
  await page.getByRole('switch', { name: 'Animations', exact: true }).uncheck();
  const lists = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Selection list', exact: true }),
  });
  const resources = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', {
      name: 'Resource selection',
      exact: true,
    }),
  });
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    const reference = await resources
      .locator('.rv-resource-picker__option[data-selected="true"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    for (const name of ['Items', 'Value formats', 'Visual formats']) {
      const list = lists.getByRole('listbox', { name, exact: true });
      const selected = list.getByRole('option', { selected: true });
      await expect(selected).toHaveCSS('background-color', reference);
      await selected.hover();
      await expect(selected).toHaveCSS('background-color', reference);
    }
    const plain = lists.getByRole('listbox', { name: 'Items', exact: true });
    await plain.getByRole('option', { name: 'Table', exact: true }).click();
    await plain
      .getByRole('option', { name: 'Table', exact: true })
      .press('ArrowDown');
    await expect(
      plain.getByRole('option', { name: 'Board', exact: true }),
    ).toHaveCSS('background-color', reference);
  }
});
