import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark']) {
  test(`stepper navigates with keyboard in ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/stepper/');
    const nav = page.getByRole('navigation', { name: 'Setup' });
    const review = nav.getByRole('button', { name: /Review/ });
    await expect(review).toHaveAttribute('aria-current', 'step');
    await review.focus();
    await page.keyboard.press('ArrowRight');
    const finish = nav.getByRole('button', { name: /Finish/ });
    await expect(finish).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(finish).toHaveAttribute('aria-current', 'step');
  });
}
