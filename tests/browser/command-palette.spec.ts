import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`command palette searches and executes with focus in the field in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.addInitScript(
      (value) => localStorage.setItem('revo-ui-theme', value),
      theme,
    );
    await page.goto('/components/command-palette/');
    const opener = page.getByRole('button', { name: 'Open commands' });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Commands', exact: true });
    const search = dialog.getByRole('combobox', { name: 'Search commands' });
    await expect(search).toBeFocused();
    await expect(dialog.locator('.rv-dialog__footer')).toBeHidden();
    const title = await dialog
      .getByRole('heading', { name: 'Commands' })
      .boundingBox();
    const close = await dialog
      .getByRole('button', { name: 'Close' })
      .boundingBox();
    expect(
      Math.abs(title!.y + title!.height / 2 - (close!.y + close!.height / 2)),
    ).toBeLessThan(1);
    await expect(opener.locator('kbd.rv-keycap')).toHaveCSS(
      'border-bottom-width',
      '2px',
    );
    const field = await dialog.locator('.rv-search-input').boundingBox();
    const body = await dialog.locator('.rv-dialog__body').boundingBox();
    expect(field!.x - body!.x).toBeGreaterThanOrEqual(4);
    expect(
      body!.x + body!.width - field!.x - field!.width,
    ).toBeGreaterThanOrEqual(4);
    expect(field!.y - body!.y).toBeGreaterThanOrEqual(4);
    await expect(
      dialog.getByRole('group', { name: 'Workspace' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('group', { name: 'Preferences' }),
    ).toBeVisible();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(
      dialog.getByRole('option', { name: /^Open settings/ }),
    ).toHaveAttribute('aria-selected', 'true');
    await search.fill('does not exist');
    await expect(dialog.getByRole('status')).toHaveText('No matching commands');
    await expect(search).toHaveAttribute('aria-expanded', 'false');
    await search.fill('project');
    const item = dialog.getByRole('option', { name: /^Open project/ });
    await expect(item).toHaveAttribute('aria-selected', 'true');
    await expect(item.locator('.rv-command-icon svg')).toBeVisible();
    await expect(item.locator('kbd.rv-keycap')).toHaveText('⌘P');
    await expect(item.locator('kbd.rv-keycap')).toHaveCSS(
      'border-bottom-width',
      '2px',
    );
    await expect(search).toHaveAttribute(
      'aria-activedescendant',
      (await item.getAttribute('id')) ?? '',
    );
    await expect(search).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(
      page.locator('#example-workspace-commands').getByRole('status'),
    ).toHaveText('Open project');
  });
}

test('shows inline, scrollable and RTL command scenarios', async ({ page }) => {
  await page.goto('/components/command-palette/');
  const quick = page.locator('#example-quick-actions');
  const field = quick.getByRole('combobox', { name: 'Search actions' });
  const first = quick.getByRole('option', { name: 'Bookmark this view' });
  const disabled = quick.getByRole('option', { name: 'Archive workspace' });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await field.focus();
  await page.keyboard.press('ArrowUp');
  await expect(
    quick.getByRole('option', { name: 'Create report' }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(quick.getByRole('status').last()).toHaveText(
    'Bookmark this view',
  );
  await expect(field).toBeFocused();

  await page.getByRole('button', { name: 'Browse workspace' }).click();
  const dialog = page.getByRole('dialog', { name: 'Browse workspace' });
  const results = dialog.getByRole('listbox');
  await expect
    .poll(() =>
      results.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    )
    .toBe(true);
  await page.keyboard.press('End');
  await expect(
    dialog.getByRole('option', { name: 'Weekly summary' }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(() => results.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  const rtl = page.locator('#example-right-to-left-commands');
  await expect(rtl.getByRole('listbox')).toHaveCSS('direction', 'rtl');
  const opener = page.getByRole('button', { name: 'Open commands' });
  await page.keyboard.press('Control+k');
  const workspace = page.getByRole('dialog', { name: 'Commands', exact: true });
  await expect(workspace.getByRole('combobox')).toBeFocused();
  await workspace.getByRole('button', { name: 'Close' }).click();
  await expect(opener).toBeFocused();
});
