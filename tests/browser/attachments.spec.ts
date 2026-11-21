import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark'])
  test(`attachment can be removed by keyboard in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/attachments/');
    const list = page.getByRole('list', { name: 'Attachments' });
    await expect(list).toContainText('Brief.pdf');
    const remove = list.getByRole('button', { name: 'Remove Brief.pdf' });
    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(list.getByText('Brief.pdf')).toHaveCount(0);
  });
