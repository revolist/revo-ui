import { expect, test } from './gallery-test';

test.use({ gallerySections: ['remote-lookup-field'] });

for (const method of ['fill', 'keyboard'] as const) {
  test(`lookup preserves immediate ${method} search across reopen (#1023)`, async ({
    page,
  }) => {
    await page.goto('/components/remote-lookup-field/');
    await page.getByRole('button', { name: 'Select linked record' }).click();
    const trigger = page.getByRole('combobox', { name: 'Linked records' });
    const search = page.getByRole('textbox', { name: 'Search options' });
    for (let attempt = 0; attempt < 5; attempt++) {
      await trigger.press('Enter');
      // Type immediately; waiting for options/focus first hides the race.
      if (method === 'fill') await search.fill('no matching target');
      else await search.pressSequentially('no matching target');
      await expect(
        page.getByText('No results found', { exact: true }),
      ).toBeVisible();
      // Empty results alone also pass with a missing first character.
      await expect(search).toHaveValue('no matching target');
      await search.press('Escape');
      await expect(search).toHaveCount(0);
    }
  });
}
