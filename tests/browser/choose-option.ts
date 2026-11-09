import { expect, type Locator } from '@playwright/test';

/** Select through the same trigger/listbox interaction used by a person. */
export async function chooseOption(
  control: Locator,
  label: string,
): Promise<void> {
  const options = control
    .page()
    .getByRole('button', { name: 'More gallery options', exact: true });
  if (await options.isVisible()) {
    // The media-query state follows the viewport change on the next render.
    await expect(options).toHaveAttribute('aria-expanded', /^(true|false)$/);
    if ((await options.getAttribute('aria-expanded')) === 'false') {
      // Closing disclosure motion briefly leaves its controls visible.
      await expect(
        control.page().locator('.gallery-settings-content'),
      ).toBeHidden();
      if (!(await control.isVisible())) {
        await options.click();
        await expect(options).toHaveAttribute('aria-expanded', 'true');
      }
    }
  }
  if (
    (await control.getAttribute('aria-label')) === 'Theme' &&
    (await control.getAttribute('aria-pressed')) !== null
  ) {
    if (
      ((await control.getAttribute('aria-pressed')) === 'true') !==
      (label.toLowerCase() === 'dark')
    )
      await control.click();
    return;
  }
  await control.click();
  const listId = await control.getAttribute('aria-controls');
  if (!listId) throw new Error('Dropdown did not expose its listbox');
  await control
    .page()
    .locator(`[id="${listId}"]`)
    .getByRole('option', { name: label, exact: true })
    .click();
}
