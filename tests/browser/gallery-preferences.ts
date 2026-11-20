import { expect, type Page } from '@playwright/test';

/** Change a gallery preference through its global customization panel. */
export async function setGalleryPreference(
  page: Page,
  name: 'Animations' | 'Right to left',
  value: boolean | 'toggle',
) {
  const options = page.getByRole('button', {
    name: 'More gallery options',
    exact: true,
  });
  if (
    (await options.isVisible()) &&
    (await options.getAttribute('aria-expanded')) === 'true'
  )
    await options.click();
  const trigger = page.getByRole('button', { name: 'Customize', exact: true });
  if ((await trigger.getAttribute('aria-expanded')) !== 'true')
    await trigger.click();
  const control = page.getByRole('switch', { name, exact: true });
  await expect(control).toBeVisible();
  if (value === 'toggle') await control.click();
  else await control.setChecked(value);
  await trigger.click();
}
