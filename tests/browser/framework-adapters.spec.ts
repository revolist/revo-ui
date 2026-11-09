import { chooseOption } from './choose-option';
import { expect, test } from '@playwright/test';

test('Vue controls preserve keyboard selection, dialog slots and overlay cleanup', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#components');
  const dropdown = page.getByRole('combobox', { name: 'Status', exact: true });
  await dropdown.focus();
  await dropdown.press('ArrowDown');
  await expect(
    page.getByRole('listbox').getByRole('option', { name: 'Beta' }),
  ).toBeVisible();
  await page.getByRole('listbox').getByRole('option', { name: 'Beta' }).click();
  await expect(page.locator('#status')).toHaveText('b');
  await chooseOption(
    page.getByLabel('Secondary status', { exact: true }),
    'Alpha',
  );
  await expect(page.locator('#status')).toHaveText('a');
  await page.getByRole('button', { name: 'Open editor' }).click();
  await expect(page.getByRole('dialog', { name: 'Editor' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Dialog name' }).fill('A Vue slot');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await expect(
    page.getByRole('grid', { name: 'October 2026 Calendar' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Toggle components' }).click();
  await expect(page.getByRole('grid')).toHaveCount(0);
  await expect(page.getByRole('listbox')).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const framework of ['React', 'Angular', 'Svelte']) {
  test(`${framework} controls bridge custom content and dispose overlays`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/#components');
    const section = page.getByRole('region', { name: `${framework} adapters` });
    const dropdown = section.getByRole('combobox', {
      name: `${framework} status`,
      exact: true,
    });
    await dropdown.focus();
    await dropdown.press('ArrowDown');
    await page
      .getByRole('listbox')
      .getByRole('option', { name: 'Beta' })
      .click();
    await expect(section.locator('output').first()).toHaveText('b');
    if (framework !== 'Angular') {
      await chooseOption(
        section.getByLabel(`${framework} secondary status`),
        'Alpha',
      );
      await expect(section.locator('output').first()).toHaveText('a');
    }
    await section
      .getByRole('button', { name: `Open ${framework} editor` })
      .click();
    const dialog = page.getByRole('dialog', { name: `${framework} editor` });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole('textbox', { name: `${framework} dialog name` })
      .fill('Framework content');
    await dialog.getByRole('button', { name: `Done ${framework}` }).click();
    await expect(dialog).toHaveCount(0);
    await dropdown.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await section.getByRole('button', { name: `Toggle ${framework}` }).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('Vue prop updates retain slot drafts and focus', async ({ page }) => {
  await page.goto('/#components');
  const draft = page.getByRole('textbox', { name: 'Vue slot draft' });
  await draft.focus();
  await draft.pressSequentially('Keep this draft');
  await expect(draft).toHaveValue('Keep this draft');
  await expect(draft).toBeFocused();
});

for (const framework of ['Vue', 'React', 'Angular', 'Svelte']) {
  test(`${framework} tooltip describes its framework-owned keyboard trigger`, async ({
    page,
  }) => {
    await page.goto('/#components');
    const trigger = page.getByRole('button', {
      name: `${framework} help`,
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const tooltip = page.getByRole('tooltip', {
      name: `${framework} tooltip details`,
    });
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      (await tooltip.getAttribute('id')) as string,
    );
    await trigger.press('Tab');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  });
}

test('Angular prop updates retain slot input drafts and focus', async ({
  page,
}) => {
  await page.goto('/#components');
  const draft = page.getByRole('textbox', { name: 'Angular slot draft' });
  await draft.focus();
  await draft.pressSequentially('Keep this draft');
  await expect(draft).toHaveValue('Keep this draft');
  await expect(draft).toBeFocused();
});
for (const framework of ['Angular', 'Svelte']) {
  test(`${framework} search input forwards its primary model callback`, async ({
    page,
  }) => {
    await page.goto('/#components');
    const query = page.getByRole('searchbox', {
      name: `${framework} search query`,
    });
    await query.fill('Find records');
    await expect(
      page.locator(`[data-${framework.toLowerCase()}-search]`),
    ).toHaveText('Find records');
    await page
      .getByRole('button', { name: `Clear ${framework} search` })
      .click();
    await expect(query).toHaveValue('');
  });
}

test('React configurator content props render and dispatch React events', async ({
  page,
}) => {
  await page.goto('/#components');
  const section = page.getByRole('region', { name: 'React adapters' });
  await expect(
    section.getByText('React configurator heading', { exact: true }),
  ).toBeVisible();
  await expect(
    section.getByText('No React fields', { exact: true }),
  ).toBeVisible();
  await section
    .getByRole('button', { name: 'Add React field', exact: true })
    .click();
  await expect(section.locator('[data-react-value]')).toHaveText('b');
});

test('Vue conditional slots appear and disappear without attribute changes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#components');
  const action = page.getByRole('button', {
    name: 'Conditional Vue action',
    exact: true,
  });
  await expect(action).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Toggle Vue content', exact: true })
    .click();
  await action.click();
  await expect(page.locator('[data-vue-slot-clicks]')).toHaveText('1');
  await page
    .getByRole('button', { name: 'Toggle Vue content', exact: true })
    .click();
  await expect(action).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Toggle Vue footer', exact: true })
    .click();
  await page.getByRole('button', { name: 'Open editor', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editor', exact: true });
  await expect(
    dialog.getByRole('button', { name: 'Done', exact: true }),
  ).toHaveCount(0);
  await dialog
    .getByRole('textbox', { name: 'Dialog name' })
    .fill('Still mounted');
  // The external toggle is blocked by the modal; close before restoring it.
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page
    .getByRole('button', { name: 'Toggle Vue footer', exact: true })
    .click();
  await page.getByRole('button', { name: 'Open editor', exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: 'Done', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('Vue popover supports independent and reactive dismissal policies', async ({
  page,
}) => {
  await page.goto('/#components');
  const trigger = page.getByRole('button', {
    name: 'Toggle Vue popover',
    exact: true,
  });
  const popup = page.getByRole('dialog', { name: 'Vue popover', exact: true });
  const close = popup.getByRole('button', { name: 'Close Vue popover' });
  const outside = page.getByRole('checkbox', {
    name: 'Close popover on outside',
  });
  const escape = page.getByRole('checkbox', {
    name: 'Close popover on Escape',
  });
  await outside.uncheck();
  await escape.uncheck();
  await trigger.click();
  await expect(popup).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(popup).toBeVisible();
  await page.locator('#status').click();
  await expect(popup).toBeVisible();
  // Updating the policy while open must take effect without invoking onClose.
  await escape.check();
  await expect(popup).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(popup).toBeVisible();
  await escape.uncheck();
  await outside.check();
  await expect(popup).toBeVisible();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(popup).toBeVisible();
  await page.locator('#status').click();
  await expect(popup).toBeHidden();
  await outside.uncheck();
  await trigger.click();
  await close.click();
  await expect(popup).toBeHidden();
});

test('Vue popover retains input focus and selection when dismissal policy changes', async ({
  page,
}) => {
  await page.goto('/#components');
  await page
    .getByRole('button', { name: 'Toggle Vue popover', exact: true })
    .click();
  const draft = page.getByRole('textbox', {
    name: 'Popover draft',
    exact: true,
  });
  await draft.fill('draft');
  await expect(
    page.getByRole('checkbox', { name: 'Close popover on outside' }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Close popover on Escape' }),
  ).not.toBeChecked();
  await expect(draft).toBeFocused();
  await draft.press('ArrowLeft');
  await page.keyboard.type('!');
  await expect(draft).toHaveValue('draf!t');
  await page.keyboard.press('Escape');
  await expect(draft).toBeFocused();
  await expect(draft).toBeVisible();
});
