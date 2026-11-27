import { expect, test } from '@playwright/test';
test('date popup inherits a nested dialog scope', async ({ page }) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/picker-context/index.html');
  await page.getByRole('button', { name: 'Open date' }).click();
  const popup = page.locator('.rv-popover[role="dialog"]:visible');
  await expect(popup).toHaveCSS('direction', 'rtl');
  expect(
    await popup.evaluate((element) =>
      getComputedStyle(element)
        .getPropertyValue('--calendar-scope-color')
        .trim(),
    ),
  ).toBe('rgb(1, 2, 3)');
  await expect(popup.locator('.revo-calendar')).toHaveCount(1);
});

test('disabling a fieldset closes its open date picker', async ({ page }) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/picker-context/index.html');
  await page.getByRole('button', { name: 'Open visit' }).click();
  const calendar = page.getByRole('dialog', { name: 'Open visit' });
  await expect(calendar).toBeVisible();
  await page.evaluate(() => {
    document.querySelector('fieldset')!.disabled = true;
  });
  await expect(calendar).toHaveCount(0);
});

test('date popup retains scope through a dialog shadow root', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/picker-context/index.html');
  await page.getByRole('button', { name: 'Open shadow date' }).click();
  const popup = page
    .locator('section[dir="rtl"] .rv-popover[role="dialog"]:visible')
    .last();
  await expect(popup).toHaveCount(1);
  await expect(popup).toHaveCSS('direction', 'rtl');
  expect(
    await popup.evaluate((element) =>
      getComputedStyle(element)
        .getPropertyValue('--calendar-scope-color')
        .trim(),
    ),
  ).toBe('rgb(4, 5, 6)');
});

test('native date field in a shadow-root modal closes with its owner', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/picker-context/index.html');
  await page.evaluate(() =>
    document
      .querySelector<HTMLDialogElement>('#native-shadow-modal')!
      .showModal(),
  );
  await page.getByRole('button', { name: 'Open shadow visit' }).click();
  const popup = page.getByRole('dialog', { name: 'Open shadow visit' });
  await expect(popup).toBeVisible();
  await page.evaluate(() =>
    document.querySelector<HTMLDialogElement>('#native-shadow-modal')!.close(),
  );
  await expect(popup).toHaveCount(0);
});

test('finds a dialog through a real assigned slot', async ({ page }) => {
  await page.goto('http://127.0.0.1:4180/tests/browser/fixtures/picker-context/index.html');
  const result = await page.evaluate(async () => {
    const { findOpenDialog } = await import('/package/core/open-dialog.ts');
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const dialog = document.createElement('dialog');
    const slot = document.createElement('slot');
    dialog.append(slot);
    shadow.append(dialog);
    const button = document.createElement('button');
    host.append(button);
    document.body.append(host);
    dialog.showModal();
    const found = button.assignedSlot === slot && findOpenDialog(button) === dialog;
    dialog.close();
    host.remove();
    return found;
  });
  expect(result).toBe(true);
});
