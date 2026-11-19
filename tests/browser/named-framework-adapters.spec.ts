import { expect, test } from '@playwright/test';

test('Svelte named date pickers use defaults and submit ISO values', async ({
  page,
}) => {
  await page.goto('/named.html');
  const form = page.getByRole('form', { name: 'Svelte date defaults' });
  await expect(form.getByRole('textbox', { name: 'Svelte date' })).toHaveValue(
    '2024-03-31',
  );
  await expect(form.getByRole('textbox', { name: 'Svelte from' })).toHaveValue(
    '2024-02-29',
  );
  await expect(form.getByRole('textbox', { name: 'Svelte to' })).toHaveValue(
    '2024-03-01',
  );
  expect(
    await form.evaluate((element: HTMLFormElement) =>
      Object.fromEntries(new FormData(element)),
    ),
  ).toEqual({
    date: '2024-03-31',
    from: '2024-02-29',
    to: '2024-03-01',
  });
  await form.getByRole('button', { name: 'Clear date', exact: true }).click();
  await expect(form.getByRole('textbox', { name: 'Svelte date' })).toHaveValue(
    '',
  );
  await form.evaluate((element: HTMLFormElement) => element.reset());
  await expect(form.getByRole('textbox', { name: 'Svelte date' })).toHaveValue(
    '2024-03-31',
  );
  await form
    .getByRole('button', { name: 'Clear date range', exact: true })
    .click();
  await expect(form.getByRole('textbox', { name: 'Svelte from' })).toHaveValue(
    '',
  );
  await expect(form.getByRole('textbox', { name: 'Svelte to' })).toHaveValue(
    '',
  );
  await form.evaluate((element: HTMLFormElement) => element.reset());
  await expect(form.getByRole('textbox', { name: 'Svelte from' })).toHaveValue(
    '2024-02-29',
  );
  await expect(form.getByRole('textbox', { name: 'Svelte to' })).toHaveValue(
    '2024-03-01',
  );
  expect(
    await form.evaluate((element: HTMLFormElement) =>
      Object.fromEntries(new FormData(element)),
    ),
  ).toEqual({ date: '2024-03-31', from: '2024-02-29', to: '2024-03-01' });
});

test('outside-day focus moves even when the grid tab stop stays the same', async ({
  page,
}) => {
  await page.goto('/named.html');
  await page
    .getByRole('button', { name: 'Choose Angular outside day' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Angular outside day' });
  const outside = dialog.locator('[data-calendar-date="2024-02-29"]');
  const inside = dialog.locator('[data-calendar-date="2024-03-01"]');
  await outside.focus();
  await expect(outside).toBeFocused();
  await expect(inside).toHaveAttribute('tabindex', '0');
  await page
    .getByRole('button', { name: 'Restrict outside dates' })
    .dispatchEvent('click');
  await expect(outside).toBeDisabled();
  await expect(inside).toBeFocused();
  await page
    .getByRole('button', { name: 'Restrict whole month' })
    .dispatchEvent('click');
  await expect(inside).toBeDisabled();
  await expect(
    dialog.locator('.revo-calendar__header button:not([disabled])').first(),
  ).toBeFocused();
});

test('Svelte date picker retains an explicitly bound model', async ({
  page,
}) => {
  await page.goto('/named.html');
  const input = page.getByRole('textbox', {
    name: 'Svelte bound date',
    exact: true,
  });
  await input.fill('2024-03-18');
  await input.blur();
  await expect(page.locator('[data-svelte-bound-date]')).toHaveText(
    '2024-03-18',
  );
  await page.getByRole('button', { name: 'Clear Svelte model' }).click();
  await expect(input).toHaveValue('');
});

test('Angular named date picker retains uncontrolled edits', async ({
  page,
}) => {
  await page.goto('/named.html');
  const input = page.getByRole('textbox', {
    name: 'Angular date',
    exact: true,
  });
  await input.fill('2024-03-29');
  await input.blur();
  await expect(input).toHaveValue('2024-03-29');
  await page
    .getByRole('button', { name: 'Choose Angular date', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Angular date', exact: true })
    .locator('[data-calendar-date="2024-03-31"]')
    .click();
  await expect(input).toHaveValue('2024-03-31');
});

test('date focus moves to an enabled day when minDate changes', async ({
  page,
}) => {
  await page.goto('/named.html');
  await page
    .getByRole('button', { name: 'Choose Angular bounded date' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Angular bounded date' });
  await expect(
    dialog.locator('[data-calendar-date="2024-03-30"]'),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Raise date minimum' })
    .dispatchEvent('click');
  await expect(
    dialog.locator('[data-calendar-date="2024-03-30"]'),
  ).toBeDisabled();
  await expect(
    dialog.locator('[data-calendar-date="2024-03-31"]'),
  ).toBeFocused();
});

for (const framework of ['Angular', 'Svelte']) {
  test(`${framework} named components update direct props, models, slots and clean up`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/named.html');
    const section = page.getByRole('region', {
      name: `${framework} named components`,
    });
    await section.getByRole('button', { name: 'Save 0', exact: true }).click();
    await expect(
      section.getByRole('button', { name: 'Save 1', exact: true }),
    ).toBeVisible();
    if (framework === 'Angular') {
      await expect(section.locator('[data-callbacks]')).toHaveText('1');
      await expect(section.locator('[data-events]')).toHaveText('1');
      const projected = section.getByRole('textbox', {
        name: 'Angular projected draft',
      });
      await projected.focus();
      await projected.pressSequentially('Keep projected draft');
      await expect(projected).toHaveValue('Keep projected draft');
      await expect(projected).toBeFocused();
    }

    const search = section.getByRole('searchbox', {
      name: `${framework} search`,
    });
    await search.fill('Find reports');
    await expect(section.locator('[data-query]')).toHaveText('Find reports');
    await section
      .getByRole('button', { name: 'Clear search', exact: true })
      .click();
    await expect(search).toHaveValue('');

    const dropdown = section.getByRole('combobox', {
      name: `${framework} status`,
    });
    await dropdown.click();
    const option = page
      .getByRole('listbox')
      .getByRole('option', { name: 'Beta' });
    await expect(option.locator('strong')).toHaveText('Beta');
    await option.click();
    await expect(section.locator('[data-selected]')).toHaveText('b');

    await section
      .getByRole('button', { name: 'Open editor', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: `${framework} editor` });
    const draft = dialog.getByRole('textbox', { name: `${framework} draft` });
    await draft.fill('Keep my draft');
    await dialog
      .getByRole('button', { name: 'Update counter', exact: true })
      .click();
    await expect(draft).toHaveValue('Keep my draft');
    await dialog.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(dialog).toHaveCount(0);

    await dropdown.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await section
      .getByRole('button', { name: 'Toggle controls', exact: true })
      .click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(section.getByRole('combobox')).toHaveCount(0);
    await section
      .getByRole('button', { name: 'Toggle controls', exact: true })
      .click();
    await expect(
      section.getByRole('button', { name: 'Save 2', exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}
