import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`calendar, time and date/time field pages have distinct examples at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/calendar-and-dates/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Calendar and dates',
    );
    await expect(page.locator('#example-calendar')).toBeVisible();
    await expect(
      page.locator(
        '#example-time-picker-options, #example-date-and-time-fields, #example-shared-date-time-editor-options',
      ),
    ).toHaveCount(0);
    await page.goto('/components/time-pickers/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Time pickers',
    );
    await expect(
      page.getByRole('textbox', { name: 'Time field', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Choose business time', exact: true })
      .click();
    await expect(page.locator('.rv-editor-popup--time')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.locator('#example-calendar, #example-date-and-time-fields'),
    ).toHaveCount(0);
    await page.goto('/components/date-and-time-fields/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Date and time fields',
    );
    await expect(
      page.locator('#example-shared-date-time-editor-options'),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Time field', exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Choose field date and time', exact: true })
      .click();
    await expect(page.locator('.rv-editor-popup .revo-calendar')).toBeVisible();
  });
}

test('date/time APIs and old calendar example links lead to their new categories', async ({
  page,
}) => {
  await page.goto('/api/datetimefield/');
  await expect(
    page.getByRole('link', {
      name: 'View date and time fields examples →',
      exact: true,
    }),
  ).toHaveAttribute('href', '/components/date-and-time-fields/');
  await expect(
    page.getByRole('link', {
      name: 'View time pickers examples →',
      exact: true,
    }),
  ).toHaveAttribute('href', '/components/time-pickers/');
  for (const [anchor, route] of [
    ['time-picker-options', 'time-pickers'],
    ['date-and-time-fields', 'date-and-time-fields'],
    ['date-field-with-calendar-and-time-popup', 'date-and-time-fields'],
    ['shared-date-time-editor-options', 'date-and-time-fields'],
  ]) {
    await page.goto(`/components/calendar-and-dates/#example-${anchor}`);
    await expect(page).toHaveURL(
      new RegExp(`/components/${route}/#example-${anchor}$`),
    );
    await expect(page.locator(`#example-${anchor}`)).toBeVisible();
  }
});
