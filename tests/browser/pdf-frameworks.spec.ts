import { expect, test } from '@playwright/test';

for (const framework of [
  'Native',
  'Preact',
  'React',
  'Vue',
  'Angular',
  'Svelte',
]) {
  test(`${framework} PDF adapter renders, configures, emits callbacks and releases its host`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/pdf.html');
    const section = page.getByRole('region', {
      name: `${framework} PDF`,
      exact: true,
    });
    const viewer = section.locator('.rv-pdf-viewer');
    await section.scrollIntoViewIfNeeded();
    await expect(viewer.locator('.textLayer').first()).toContainText(
      'A clearer view of your data',
      { timeout: 15_000 },
    );
    await section
      .getByRole('button', { name: 'Next page', exact: true })
      .click();
    await expect(section.locator('output')).toHaveText('2');
    await section
      .getByRole('button', { name: `Configure ${framework} PDF`, exact: true })
      .click();
    await expect(viewer.locator('.rv-pdf-viewer__filename')).toHaveText(
      'updated.pdf',
    );
    await expect(viewer.locator('.textLayer').first()).toContainText(
      'A clearer view of your data',
      { timeout: 15_000 },
    );
    await expect(
      section.getByRole('button', { name: 'Rotate clockwise', exact: true }),
    ).toHaveCount(0);
    await section
      .getByRole('button', { name: 'Page suivante', exact: true })
      .click();
    await expect(section.locator('output')).toHaveText('2');
    await section
      .getByRole('button', { name: 'Rechercher', exact: true })
      .click();
    await expect(
      section.getByRole('searchbox', { name: 'Rechercher' }),
    ).toBeFocused();
    await section
      .getByRole('button', { name: `Toggle ${framework} PDF`, exact: true })
      .click();
    await expect(viewer).toHaveCount(0);
    await expect(section.getByRole('searchbox')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
