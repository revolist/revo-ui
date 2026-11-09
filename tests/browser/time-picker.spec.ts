import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['calendar-and-dates'] });

for (const width of [1280, 390])
  for (const theme of ['light', 'dark']) {
    test(`compact time selection is usable in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#components');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const trigger = page.getByRole('button', {
        name: 'Choose field time',
        exact: true,
      });
      await trigger.click();
      const popup = page.locator('.rv-editor-popup--time');
      await expect(popup).toBeVisible();
      const field = popup.getByRole('textbox', { name: 'Time', exact: true });
      await expect(field).toBeFocused();
      const bounds = (await popup.boundingBox())!;
      expect(bounds.width).toBeLessThanOrEqual(240);
      expect(bounds.x).toBeGreaterThanOrEqual(7);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 7);
      const hours = popup.getByRole('listbox', {
        name: 'Time: Hour',
        exact: true,
      });
      const selected = hours.getByRole('option', { selected: true });
      await expect(selected).toHaveText('09');
      await expect
        .poll(async () => {
          const list = (await hours.boundingBox())!,
            option = (await selected.boundingBox())!;
          return (
            option.y >= list.y &&
            option.y + option.height <= list.y + list.height
          );
        })
        .toBe(true);
      await selected.focus();
      await page.keyboard.press('ArrowDown');
      await expect(field).toHaveValue('10:00');
      await field.focus();
      await field.press('Enter');
      await expect(popup).toHaveCount(0);
      await expect(
        page.getByRole('textbox', { name: 'Time field', exact: true }),
      ).toHaveValue('10:00');
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(popup).toHaveCSS('opacity', '1');
      await popup.screenshot({
        path: info.outputPath('compact-time.png'),
        animations: 'disabled',
      });
      await popup.getByRole('button', { name: 'Clear', exact: true }).click();
      await expect(
        page.getByRole('textbox', { name: 'Time field', exact: true }),
      ).toHaveValue('');
    });
  }

test('honors time constraints, seconds, AM/PM, explicit cancel and RTL', async ({
  page,
}, info) => {
  await page.goto('/#components');
  await page
    .getByRole('button', { name: 'Choose business time', exact: true })
    .click();
  const popup = page.locator('.rv-editor-popup');
  await expect(popup).toBeVisible();
  await page.locator('.catalog-sidebar').dispatchEvent('scroll');
  await expect(popup).toBeVisible();
  const hours = popup.getByRole('listbox', { name: 'Time: Hour', exact: true });
  await expect(
    hours.getByRole('option', { name: '08', exact: true }),
  ).toBeDisabled();
  const minutes = popup.getByRole('listbox', {
    name: 'Time: Minute',
    exact: true,
  });
  await expect(
    minutes.getByRole('option', { name: '11', exact: true }),
  ).toBeDisabled();
  await minutes.getByRole('option', { name: '25', exact: true }).click();
  await popup
    .getByRole('textbox', { name: 'Time', exact: true })
    .press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Business hours', exact: true }),
  ).toHaveValue('09:25');
  await page
    .getByRole('button', { name: 'Choose precise time', exact: true })
    .click();
  await popup
    .getByRole('listbox', { name: 'Time: Second', exact: true })
    .getByRole('option', { name: '30', exact: true })
    .click();
  await popup
    .getByRole('listbox', { name: 'Time: Period', exact: true })
    .getByRole('option', { name: 'AM', exact: true })
    .click();
  await expect(
    popup.getByRole('textbox', { name: 'Time', exact: true }),
  ).toHaveValue('01:45:30 AM');
  await popup
    .getByRole('textbox', { name: 'Time', exact: true })
    .press('Escape');
  await expect(
    page.getByRole('textbox', { name: 'Time with seconds', exact: true }),
  ).toHaveValue('13:45:23');
  await page
    .getByRole('button', { name: 'Choose confirmed time', exact: true })
    .click();
  await popup
    .getByRole('listbox', { name: 'Time: Hour', exact: true })
    .getByRole('option', { name: '15', exact: true })
    .click();
  await popup.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Confirm time', exact: true }),
  ).toHaveValue('14:30');
  await page
    .getByRole('switch', { name: 'Right to left', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Choose confirmed time', exact: true })
    .click();
  await expect(popup).toHaveCSS('direction', 'rtl');
  await popup
    .getByRole('listbox', { name: 'Time: Minute', exact: true })
    .getByRole('option', { name: '45', exact: true })
    .click();
  await popup.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Confirm time', exact: true }),
  ).toHaveValue('14:45');
});
