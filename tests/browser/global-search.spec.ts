import { test, expect } from './gallery-test';

test('global search ranks controls, supports typos and opens results with the keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const launcher = page.getByRole('searchbox', { name: 'Search the site' });
  await expect(launcher).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(launcher).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(launcher).toHaveCSS('height', '38px');
  await expect(
    launcher.locator('..').locator('.rv-search-input-icon svg'),
  ).toHaveCSS('fill', 'none');
  await expect(
    launcher.locator('..').locator('.rv-search-input-shortcut'),
  ).toContainText(/^(⌘|Ctrl) K$/);
  await launcher.focus();
  await launcher.press('Enter');
  const search = page.getByRole('combobox', {
    name: 'Search controls, examples, and guides',
  });
  await expect(search).toBeFocused();
  const status = page.getByRole('status').filter({ hasText: 'results' });
  await expect(status.locator('..')).toHaveClass(/rv-dialog__footer/);
  await expect(status.locator('..')).toHaveCSS('border-top-style', 'solid');
  await expect(status.locator('..')).toHaveCSS('margin-inline-start', '0px');
  await expect(search).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const focusSpace = await search.evaluate((input) => {
    const field = input.getBoundingClientRect();
    const body = input.closest('.rv-dialog__body')!.getBoundingClientRect();
    return {
      left: field.left - body.left,
      right: body.right - field.right,
      top: field.top - body.top,
    };
  });
  expect(
    Math.min(focusSpace.left, focusSpace.right, focusSpace.top),
  ).toBeGreaterThanOrEqual(4);
  await search.press('Escape');
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(search).toBeFocused();
  await search.fill('toas');
  await expect(
    page.getByRole('option', { name: /Toaster/ }).first(),
  ).toBeVisible();
  await search.fill('mini calender');
  await expect(
    page.getByRole('option', { name: /Mini calendar/i }).first(),
  ).toBeVisible();
  await search.fill('Toaster');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/api\/toaster\/$/);
});

test('global search opens from documentation with the keyboard and restores focus', async ({
  page,
}) => {
  await page.goto('/frameworks/');
  const origin = page.getByRole('link', { name: 'API', exact: true }).first();
  await origin.focus();
  await page.keyboard.press('Control+k');
  const search = page.getByRole('combobox', {
    name: 'Search controls, examples, and guides',
  });
  await expect(search).toBeFocused();
  await search.fill('tree shaking');
  await expect(page.getByRole('option', { name: /Bundle size/ })).toBeVisible();
  await search.press('Escape');
  await expect(search).toBeHidden();
  await expect(origin).toBeFocused();
});

test('global search remains reachable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/buttons/');
  const trigger = page.getByRole('searchbox', { name: 'Search the site' });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(
    page.getByRole('combobox', {
      name: 'Search controls, examples, and guides',
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
