import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

for (const theme of ['light', 'dark']) {
  test(`bulk action bar preserves focus and supports keyboard dismissal in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto('/components/action-bar/');
    const file = page.getByRole('checkbox', { name: 'Forecast.xlsx' });
    const bar = page.getByRole('toolbar', {
      name: 'Actions for selected files',
    });
    await expect(bar).toBeHidden();
    await file.focus();
    await page.keyboard.press('Space');
    await expect(file).toBeFocused();
    await expect(bar).toBeVisible();
    await expect(
      page.getByText('1 file selected', { exact: true }).first(),
    ).toBeAttached();
    const download = bar.getByRole('button', { name: 'Download' });
    await download.focus();
    await page.keyboard.press('ArrowRight');
    await expect(bar.getByRole('button', { name: 'Archive' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(
      bar.getByRole('button', { name: 'Clear file selection' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(bar).toBeHidden();
    await expect(file).not.toBeChecked();
    await expect(file).toBeFocused();
    await file.check();
    await bar.getByRole('button', { name: 'Archive' }).click();
    await expect(
      page.getByText('Archived selected files', { exact: true }),
    ).toBeVisible();
    await expect(bar).toBeHidden();
  });
}

test('backup navigation keeps the card, slider and confirmation in sync', async ({
  page,
}) => {
  await page.goto('/components/backup-history/');
  const group = page.getByRole('region', { name: 'Workspace backups' });
  const slider = group.getByRole('slider', { name: 'Browse snapshots' });
  await expect(slider).toHaveValue('3');
  await expect(group.getByText('19.1 GB')).toBeVisible();
  await group.getByRole('button', { name: 'Previous snapshot' }).click();
  await expect(slider).toHaveValue('2');
  await expect(
    group.getByRole('button', { name: 'Restore snapshot' }),
  ).toBeDisabled();
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(group.getByText('Backup BK-041')).toBeVisible();
  await expect(slider).toHaveAttribute(
    'aria-valuetext',
    'Snapshot 1 of 4, Nov 17',
  );
  await group.getByRole('button', { name: 'Restore snapshot' }).click();
  const confirmation = page.getByRole('dialog', {
    name: 'Restore this snapshot?',
  });
  await expect(confirmation.getByText('Backup BK-041')).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep current data' }).click();
  await expect(confirmation).toBeHidden();
  await expect(
    group.getByRole('button', { name: 'Restore snapshot' }),
  ).toBeFocused();
  await group.getByRole('button', { name: 'Restore snapshot' }).click();
  await confirmation.getByRole('button', { name: 'Confirm restore' }).click();
  await expect(page.getByText('Restore confirmed for BK-041')).toBeVisible();
});

test('grid history compares versions and adds a confirmed revision without losing the older entries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/components/history-review/');
  const launcher = page.getByRole('button', { name: 'Open version history' });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'Budget version history' });
  const version = dialog.getByRole('radio', { name: /^Forecast updated/ });
  const versionRow = dialog
    .locator('.rv-history-versions label')
    .filter({ hasText: 'Forecast updated' });
  await versionRow.click();
  await expect(version).toBeChecked();
  await expect(versionRow).not.toHaveCSS(
    'border-inline-start-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(versionRow.getByText('Forecast updated')).toHaveCSS(
    'font-weight',
    '500',
  );
  await version.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    dialog.getByRole('radio', { name: /Initial budget/ }),
  ).toBeChecked();
  await page.keyboard.press('ArrowUp');
  await expect(version).toBeChecked();
  await expect(dialog.getByText('2 cells changed')).toBeVisible();
  await expect(dialog.getByRole('row', { name: /Budget B4/ })).toContainText(
    '$24,000',
  );
  await expect(dialog.getByRole('row', { name: /Budget B4/ })).toContainText(
    '$26,500',
  );
  const comparison = dialog.getByRole('group', { name: 'Compare with' });
  await expect(dialog.getByText('Compare with', { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole('table', { name: 'Cell changes' }),
  ).toBeVisible();
  const latest = comparison.getByRole('button', { name: 'Latest' });
  await latest.click();
  await expect(latest).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.getByRole('row', { name: /Budget D4/ })).toContainText(
    'Empty',
  );
  await dialog.getByRole('button', { name: 'Restore version' }).click();
  const confirmation = page.getByRole('dialog', {
    name: 'Restore this version?',
  });
  await page.keyboard.press('Escape');
  await expect(confirmation).toBeHidden();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Restore version' }).click();
  await confirmation.getByRole('button', { name: 'Confirm restore' }).click();
  await expect(
    dialog.getByRole('radio', { name: /Restored from Forecast updated/ }),
  ).toBeChecked();
  await expect(
    dialog.getByRole('radio', { name: /^Restored from Forecast updated/ }),
  ).toBeFocused();
  await expect(version).toBeVisible();
  await expect(
    dialog.getByRole('radio', { name: /Initial budget/ }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Close history' }).click();
  await expect(launcher).toBeFocused();
  await page.setViewportSize({ width: 1100, height: 800 });
  await launcher.click();
  const surface = await dialog.locator('.rv-dialog__surface').boundingBox();
  expect(surface!.width).toBeGreaterThan(750);
  await comparison.getByRole('button', { name: 'Previous' }).click();
  const switchBox = (await comparison.boundingBox())!;
  const labelBox = (await dialog
    .getByText('Compare with', { exact: true })
    .boundingBox())!;
  const tableBox = (await dialog
    .getByRole('table', { name: 'Cell changes' })
    .boundingBox())!;
  expect(switchBox.width).toBeLessThan(tableBox.width / 2);
  expect(
    Math.abs(
      switchBox.y + switchBox.height / 2 - labelBox.y - labelBox.height / 2,
    ),
  ).toBeLessThan(1);
  expect(switchBox.x).toBeGreaterThan(labelBox.x + labelBox.width);
  const edits = page.getByRole('region', { name: 'Comment edit history' });
  await page.keyboard.press('Escape');
  await expect(
    edits.getByText('Compare edits with', { exact: true }),
  ).toBeVisible();
  await expect(
    edits.getByRole('button', { name: 'Earlier edit' }),
  ).toBeVisible();
  await expect(
    edits.getByRole('button', { name: 'Latest edit' }),
  ).toBeVisible();
});

test('new history and action examples have no scoped WCAG A or AA axe violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, selector] of [
    ['action-bar', '#example-inline-actions-in-rtl .rv-action-bar'],
    ['backup-history', '.rv-backup-history'],
    ['history-review', '.rv-history-review'],
  ]) {
    await page.addInitScript(() =>
      localStorage.setItem('revo-ui-theme', 'dark'),
    );
    await page.goto(`/components/${route}/`);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page
      .locator(selector)
      .first()
      .evaluate(async (element) => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe;
        const result = await axe.run(element, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
        });
        return result.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map((node) => node.target),
        }));
      });
    expect(violations).toEqual([]);
  }
});
