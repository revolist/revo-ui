import { expect, test } from '@playwright/test';

test('icon button labels stay accessible without an automatic tooltip', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  await page.clock.install();
  const button = page.getByRole('button', { name: 'Add task', exact: true });
  await button.hover();
  await button.focus();
  await page.clock.runFor(1000);
  await expect(button).toHaveAttribute('aria-label', 'Add task');
  await expect(button).not.toHaveAttribute('title');
  await expect(button).not.toHaveAttribute('aria-describedby');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await button.click();
  await expect(
    page.getByText('Add task clicked', { exact: true }),
  ).toBeVisible();
});
