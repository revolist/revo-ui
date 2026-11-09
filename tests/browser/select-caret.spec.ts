import { expect, test } from './gallery-test';

test.use({
  gallerySections: ['calendar-and-dates', 'inputs-and-forms', 'pagination'],
});

test('shared selects reserve caret space in both directions', async ({
  page,
}) => {
  await page.goto('/#components');
  for (const rtl of [false, true]) {
    await page
      .getByRole('switch', { name: 'Right to left', exact: true })
      .setChecked(rtl);
    for (const title of [
      'Month and year dropdowns',
      'Persian calendar',
      'Hijri calendar',
      'Inline field group',
      'Last page',
    ]) {
      const card = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', { name: title, exact: true }),
      });
      const selects = card.getByRole('combobox');
      expect(await selects.count()).toBeGreaterThan(0);
      for (const select of await selects.all()) {
        const spacing = await select.evaluate((element) => {
          const text = element
            .querySelector('.selected-value, .dropdown-placeholder')!
            .getBoundingClientRect();
          const arrow = element
            .querySelector('.dropdown-arrow')!
            .getBoundingClientRect();
          return {
            rtl: getComputedStyle(element).direction === 'rtl',
            text: { x: text.x, right: text.right },
            arrow: { x: arrow.x, right: arrow.right },
          };
        });
        const context = `${title}: ${JSON.stringify(spacing)}`;
        expect(
          spacing.rtl
            ? spacing.arrow.right <= spacing.text.right
            : spacing.arrow.x >= spacing.text.x,
          context,
        ).toBe(true);
      }
    }
  }
});
