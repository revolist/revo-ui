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
    await expect(page).toHaveURL(
      /\/components\/menus-and-toolbars\/#example-bulk-file-actions$/,
    );
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
  await expect(page).toHaveURL('/components/history/#example-backup-snapshots');
  await expect(
    page.getByRole('heading', { name: 'History', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open version history' }),
  ).toBeVisible();
  const group = page.getByRole('region', { name: 'Workspace backups' });
  const slider = group.getByRole('slider', { name: 'Browse snapshots' });
  await expect(slider).toHaveValue('8');
  await expect(
    group.getByRole('article').getByText('19.1 GB', { exact: true }),
  ).toBeVisible();
  await group.getByRole('button', { name: 'Previous' }).click();
  await expect(slider).toHaveValue('7');
  await expect(
    group.getByRole('button', { name: 'Restore', exact: true }),
  ).toBeDisabled();
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(group.getByText('Backup BK-036')).toBeVisible();
  await expect(slider).toHaveAttribute(
    'aria-valuetext',
    'Snapshot 1 of 9, Nov 12, Full, 17.6 GB',
  );
  await group.getByRole('button', { name: 'Restore', exact: true }).click();
  const confirmation = page.getByRole('dialog', {
    name: 'Restore this snapshot?',
  });
  await expect(confirmation.getByText('Backup BK-036')).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep current data' }).click();
  await expect(confirmation).toBeHidden();
  await expect(
    group.getByRole('button', { name: 'Restore', exact: true }),
  ).toBeFocused();
  await group.getByRole('button', { name: 'Restore', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Confirm restore' }).click();
  await expect(page.getByText('Restore confirmed for BK-036')).toBeVisible();
});

test('backup ticks share the range geometry and the slider moves the rail in either direction', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.goto('/components/history/#example-backup-snapshots');
  const backup = page.getByRole('region', { name: 'Workspace backups' });
  const rail = backup.locator('[data-part="rail"]');
  const slider = backup.getByRole('slider');
  const motion = () =>
    rail.evaluate((element) => {
      getComputedStyle(element).translate;
      return element.getAnimations()[0]?.effect instanceof KeyframeEffect
        ? (element.getAnimations()[0].effect as KeyframeEffect)
            .getKeyframes()
            .map(({ translate }) => Number.parseFloat(String(translate)))
        : [];
    });
  const finish = () =>
    rail.evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      ),
    );
  await slider.press('ArrowLeft');
  await expect.poll(motion).toEqual([-800, -700]);
  await finish();
  await slider.press('ArrowRight');
  await expect.poll(motion).toEqual([-700, -800]);
  await finish();
  await expect(backup.getByRole('article')).toHaveCount(1);
  await expect(backup.getByRole('article')).toContainText('Backup BK-044');
  const geometry = () =>
    backup.evaluate((element) => {
      const input = element.querySelector('input[type="range"]')!;
      const bounds = input.getBoundingClientRect();
      const halfThumb =
        Number.parseFloat(
          getComputedStyle(input).getPropertyValue('--slider-thumb-size'),
        ) / 2;
      const ticks = [...element.querySelectorAll('.rv-backup-tick')];
      const card = element.getBoundingClientRect();
      return {
        error: Math.max(
          ...ticks.map((tick, i) =>
            Math.abs(
              tick.getBoundingClientRect().x -
                (bounds.x +
                  halfThumb +
                  (i * (bounds.width - 2 * halfThumb)) / (ticks.length - 1)),
            ),
          ),
        ),
        contained: ticks.every((tick) => {
          const label = tick.firstElementChild!;
          const box = label.getBoundingClientRect();
          return (
            getComputedStyle(label).visibility === 'hidden' ||
            (box.left >= card.left && box.right <= card.right)
          );
        }),
      };
    });
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 850 });
    const { error, contained } = await geometry();
    expect(error).toBeLessThan(1);
    expect(contained).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slider.press('Home');
  await expect(rail).toHaveCSS('transition-duration', '0s');
  await expect(backup.getByRole('article')).toContainText('Backup BK-036');
});

test('grid history compares versions and adds a confirmed revision without losing the older entries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/components/history-review/');
  await expect(page).toHaveURL(
    '/components/history/#example-grid-version-history',
  );
  const launcher = page.getByRole('button', { name: 'Open version history' });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'Budget version history' });
  const version = dialog.getByRole('radio', { name: /^Forecast updated/ });
  const versionRow = dialog
    .locator('.rv-history-versions label')
    .filter({ hasText: 'Forecast updated' });
  const avatar = versionRow.locator('[data-part="author"] .avatar-cell');
  await expect(avatar).toHaveAttribute('aria-hidden', 'true');
  await expect(avatar.locator('img')).toHaveJSProperty('complete', true);
  expect(
    await avatar
      .locator('img')
      .evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
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
  const comparedRows = dialog.locator('.rv-history-changes tbody tr');
  await expect(comparedRows.first().locator('td').first()).toHaveCSS(
    'border-block-end-width',
    '1px',
  );
  await expect(comparedRows.last().locator('td').first()).toHaveCSS(
    'border-block-end-width',
    '0px',
  );
  await expect(dialog.getByRole('row', { name: /Budget B4/ })).toContainText(
    '$24,000',
  );
  await expect(dialog.getByRole('row', { name: /Budget B4/ })).toContainText(
    '$26,500',
  );
  const changedCell = dialog.getByRole('row', { name: /Budget B4/ });
  const before = changedCell.locator('del');
  const after = changedCell.locator('ins');
  await expect(before).toHaveCSS('text-decoration-line', 'line-through');
  await expect(after).toHaveCSS('text-decoration-line', 'none');
  for (const value of [before, after]) {
    await expect(value).toHaveCSS('padding-inline-start', '6px');
    const radius = await value.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--rv-ui-radius').trim(),
    );
    await expect(value).toHaveCSS('border-top-left-radius', radius);
  }
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
    ['menus-and-toolbars', '#example-inline-actions-in-rtl .rv-action-bar'],
    ['history', '.rv-backup-history'],
    ['history', '.rv-history-review'],
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
