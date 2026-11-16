import { expect, type Locator } from '@playwright/test';

/** Select through the same trigger/listbox interaction used by a person. */
export async function chooseOption(
  control: Locator,
  label: string,
): Promise<void> {
  const options = control
    .page()
    .getByRole('button', { name: 'More gallery options', exact: true });
  // A prerendered header can be replaced while its mobile disclosure mounts.
  // Retry opening the disclosure rather than waiting forever on a hidden role.
  await expect(async () => {
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
    expect(await control.isVisible()).toBe(true);
  }).toPass({ timeout: 5000 });
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
