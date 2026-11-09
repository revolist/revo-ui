import { test, expect } from './gallery-test';

test.use({
  gallerySections: ['selects-chips-and-resources', 'calendar-and-dates'],
});

for (const backwards of [false, true]) {
  test(`standalone select dismisses on ${backwards ? 'Shift+Tab' : 'Tab'} and advances focus`, async ({
    page,
  }) => {
    await page.goto('/#selects-chips-and-resources');
    const select = page.getByRole('combobox', { name: 'View', exact: true });
    await select.evaluate((element) => {
      const control = element.closest('.rv-select')!;
      for (const [where, id] of [
        ['beforebegin', 'before-select'],
        ['afterend', 'after-select'],
      ] as const) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = id;
        control.insertAdjacentElement(where, button);
      }
    });
    await select.focus();
    await select.press('ArrowDown');
    const listbox = page.locator(
      '#' + (await select.getAttribute('aria-controls')),
    );
    await expect(listbox).toBeVisible();
    await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
    await expect(listbox).toBeHidden();
    await expect(
      page.locator(backwards ? '#before-select' : '#after-select'),
    ).toBeFocused();
  });
}

test('calendar caption choices remain above a top-layer parent', async ({
  page,
}) => {
  await page.goto('/#calendar-and-dates');
  const card = page.locator('#example-month-and-year-dropdowns');
  await card.evaluate((element) => {
    element.setAttribute('popover', 'manual');
    element.showPopover();
  });
  for (const name of ['Choose month', 'Choose year']) {
    const trigger = card.getByRole('combobox', { name, exact: true });
    await trigger.click();
    const listbox = page.locator(
      '#' + (await trigger.getAttribute('aria-controls')),
    );
    await expect(listbox).toBeVisible();
    expect(
      await listbox.evaluate((element) => !!element.closest(':popover-open')),
    ).toBe(true);
    const option = listbox.getByRole('option').first();
    expect(
      await option.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
          ),
        );
      }),
    ).toBe(true);
    await page.keyboard.press('Escape');
  }
});
