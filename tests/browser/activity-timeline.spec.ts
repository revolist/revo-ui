import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark'])
  test(`activity action works from the keyboard in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/activity-timeline/');
    const list = page.getByRole('list', { name: 'Project activity' });
    const timestamps = list.locator('.rv-activity-message-time');
    expect(
      await timestamps.evaluateAll((items) =>
        items.every(
          (item) =>
            item.getBoundingClientRect().height <=
            parseFloat(getComputedStyle(item).lineHeight) + 1,
        ),
      ),
    ).toBe(true);
    const action = list.getByRole('button', { name: 'Open project' });
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('Opened project', { exact: true }),
    ).toBeVisible();
  });
