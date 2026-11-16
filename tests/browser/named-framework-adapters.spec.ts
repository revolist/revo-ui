import { expect, test } from '@playwright/test';

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
