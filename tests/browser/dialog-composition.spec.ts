import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['dialogs-and-floating-surfaces'] });

test('editable dialog composition supports standard actions, custom slots and locked spacing', async ({
  page,
}, info) => {
  await page.goto('/#dialogs-and-floating-surfaces');
  const form = page.getByRole('form', { name: 'Shared editor composition' });
  const result = page.getByLabel('Dialog action result');
  await expect(form).toBeVisible();
  await form
    .getByRole('textbox', { name: 'Event title' })
    .fill('Release review');
  await form.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(result).toHaveText('Saved Release review');
  await form.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(form.getByRole('textbox', { name: 'Event title' })).toHaveValue(
    'Project review',
  );
  await expect(result).toHaveText('Reset');
  await form.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(result).toHaveText('Deleted');
  await form.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(result).toHaveText('Canceled');
  await form.getByRole('button', { name: 'Custom start', exact: true }).click();
  await expect(result).toHaveText('Custom start');
  await form.getByRole('button', { name: 'Custom end', exact: true }).click();
  await expect(result).toHaveText('Custom end');
  await page.getByLabel('Locked item', { exact: true }).check();
  await expect(
    form.getByRole('textbox', { name: 'Event title' }),
  ).toBeDisabled();
  await expect(
    form.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled();
  const gap = await form.evaluate(
    (element) =>
      element.querySelector('[role="alert"]')!.getBoundingClientRect().top -
      element.querySelector('header')!.getBoundingClientRect().bottom,
  );
  expect(gap).toBeGreaterThanOrEqual(12);
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await form.screenshot({
      path: info.outputPath(`shared-dialog-${theme}.png`),
    });
  }
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await form.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  await form.screenshot({ path: info.outputPath('shared-dialog-narrow.png') });
  await page.getByLabel('Hide standard actions', { exact: true }).check();
  await expect(form.locator('[data-dialog-action]')).toHaveCount(0);
  await expect(form.locator('.rv-dialog__action-start button')).toHaveText(
    'Custom start',
  );
  await expect(form.locator('.rv-dialog__actions button')).toHaveText(
    'Custom end',
  );
});

test('dialog close uses an icon surface without an outlined command border', async ({
  page,
}) => {
  await page.goto('/#dialogs-and-floating-surfaces');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Edit project',
    exact: true,
  });
  const close = dialog.locator('.rv-dialog__close');
  await expect(close).toHaveCSS('border-top-width', '0px');
  await expect(close).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('Tab');
  await close.focus();
  await expect(close).toBeFocused();
  await expect(close).not.toHaveCSS('box-shadow', 'none');
  await close.click();
  await expect(dialog).toHaveCount(0);
});
