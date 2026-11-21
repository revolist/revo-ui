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

test('supports vertical and RTL arrow navigation without activating a step', async ({
  page,
}) => {
  await page.goto('/components/stepper/');
  const vertical = page.getByRole('navigation', { name: 'Review stages' });
  const draft = vertical.getByRole('button', { name: 'Draft' });
  const proof = vertical.getByRole('button', { name: 'Proofread' });
  await draft.focus();
  await page.keyboard.press('ArrowDown');
  await expect(proof).toBeFocused();
  await expect(draft).toHaveAttribute('aria-current', 'step');
  await page.keyboard.press('ArrowUp');
  await expect(draft).toBeFocused();

  const rtl = page.getByRole('navigation', { name: 'إعداد المشروع' });
  const review = rtl.getByRole('button', { name: 'المراجعة' });
  await review.focus();
  await page.keyboard.press('ArrowLeft');
  const finish = rtl.getByRole('button', { name: 'إنهاء' });
  await expect(finish).toBeFocused();
  await page.keyboard.press('Space');
  await expect(finish).toHaveAttribute('aria-current', 'step');
});

test('validates forward navigation and preserves mounted panels through completion', async ({
  page,
}) => {
  await page.goto('/components/stepper/');
  const stepper = page.locator('#workspace-setup');
  const input = stepper.getByRole('textbox', { name: 'Workspace name' });
  const next = stepper.getByRole('button', { name: 'Next' });
  const back = stepper.getByRole('button', { name: 'Back' });
  await expect(back).toBeDisabled();
  await next.click();
  await expect(stepper.getByText('Enter a workspace name.')).toBeVisible();
  await input.fill('Northstar');
  await next.click();
  await expect(stepper.getByText('Review Northstar.')).toBeVisible();
  await expect(input).toBeHidden();
  await back.click();
  await expect(input).toHaveValue('Northstar');
  await next.click();
  await next.click();
  await expect(stepper.getByText('Workspace ready')).toBeVisible();
  await expect(next).toBeDisabled();
  await back.click();
  await expect(stepper.getByText('Review Northstar.')).toBeVisible();
});

test('accordion disclosure keeps progress independent and focuses the next step', async ({
  page,
}) => {
  await page.goto('/components/stepper/');
  const stepper = page.locator('#launch-checklist');
  const brief = stepper.getByRole('button', { name: /Set the project brief/ });
  const review = stepper.getByRole('button', {
    name: /Review the launch plan/,
  });
  const invite = stepper.getByRole('button', { name: /Invite collaborators/ });
  await expect(review).toHaveAttribute('aria-expanded', 'true');
  await expect(review).toHaveAttribute('aria-current', 'step');
  await review.focus();
  await page.keyboard.press('ArrowUp');
  await expect(brief).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(brief).toHaveAttribute('aria-expanded', 'true');
  await expect(review).toHaveAttribute('aria-expanded', 'false');
  await expect(review).toHaveAttribute('aria-current', 'step');
  await expect(
    stepper.getByRole('region', { name: /Set the project brief/ }),
  ).toBeVisible();
  await review.click();
  await stepper.getByRole('button', { name: 'Done, next step' }).click();
  await expect(invite).toHaveAttribute('aria-expanded', 'true');
  await expect(invite).toHaveAttribute('aria-current', 'step');
  await expect(invite).toBeFocused();
  await stepper.getByRole('button', { name: 'Done, next step' }).click();
  await expect(stepper.getByText('Launch checklist complete')).toBeVisible();
  await expect(stepper.locator('[data-part=completed]')).toBeFocused();
});
