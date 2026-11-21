import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const gallery = '/components/status-and-feedback/';

test('pauses a timed notification on focus and restores focus when dismissed', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(gallery);
  const trigger = page
    .locator('#example-toast-notifications')
    .getByRole('button', { name: 'Success' });
  const notifications = page.getByRole('region', { name: 'Toast examples' });
  await trigger.click();
  const toast = notifications.getByRole('listitem');
  await expect(toast).toContainText('Draft saved');
  await expect(notifications.locator('[aria-live]')).toContainText(
    'Draft saved',
  );
  const close = toast.getByRole('button', { name: 'Dismiss notification' });
  await close.focus();
  await page.clock.runFor(4500);
  await expect(toast).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(toast).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(toast).toHaveCount(1);
  await toast.hover();
  await page.clock.runFor(4500);
  await expect(toast).toHaveCount(1);
  await page.mouse.move(0, 0);
  await page.clock.runFor(4300);
  await expect(toast).toHaveCount(0);
});

test('updates the export toast and shows the Undo result in the fixed viewport', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(gallery);
  const example = page.locator('#example-toast-notifications');
  await example.getByRole('button', { name: 'Export orders' }).click();
  const toast = example.getByRole('listitem');
  await expect(toast).toHaveAttribute('data-tone', 'loading');
  await page.clock.runFor(1300);
  await expect(toast).toHaveCount(1);
  await expect(toast).toHaveAttribute('data-tone', 'success');
  await expect(toast).toContainText('Orders.csv');
  await page.getByRole('button', { name: 'Archive draft' }).click();
  const viewport = page.getByRole('region', { name: 'Archive notifications' });
  await expect(viewport).toHaveCSS('position', 'fixed');
  await page.clock.runFor(5000);
  await viewport.getByRole('button', { name: 'Undo' }).focus();
  await page.keyboard.press('Enter');
  await expect(viewport.getByRole('listitem')).toContainText('Draft restored');
});

for (const theme of ['light', 'dark']) {
  test(`toasts fit at 320px and pass scoped automated accessibility checks in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto(gallery);
    await page.getByRole('button', { name: 'Archive draft' }).click();
    const region = page.getByRole('region', { name: 'Archive notifications' });
    const toast = region.getByRole('listitem');
    await expect(toast).toHaveCSS('animation-duration', '0s');
    const box = await toast.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    expect(
      await region.evaluate(async (element) => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe;
        return (
          await axe.run(element, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
          })
        ).violations.map(({ id }) => id);
      }),
    ).toEqual([]);
  });
}

test('queues extra notifications and keeps focus in the stack after a dismissal', async ({
  page,
}) => {
  await page.goto(gallery);
  const example = page.locator('#example-toast-notifications');
  for (const name of ['Default', 'Success', 'Info', 'Error']) {
    await example.getByRole('button', { name, exact: true }).click();
  }
  const region = page.getByRole('region', { name: 'Toast examples' });
  const toasts = region.getByRole('listitem');
  await expect(toasts).toHaveCount(3);
  await expect(region.locator('[aria-live]')).not.toContainText(
    'Upload failed',
  );
  await toasts
    .first()
    .getByRole('button', { name: 'Dismiss notification' })
    .focus();
  await page.keyboard.press('Escape');
  await expect(toasts).toHaveCount(3);
  await expect(toasts.last()).toContainText('Upload failed');
  await expect(
    toasts.first().getByRole('button', { name: 'Dismiss notification' }),
  ).toBeFocused();
});
