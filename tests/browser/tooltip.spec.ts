import { expect, test } from '@playwright/test';
for (const width of [390, 1280])
  test(`one tooltip presentation escapes clipping at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/tests/browser/fixtures/tooltip/index.html');
    const hints = page.locator('.rv-tooltip:visible');
    const style = async () =>
      hints.evaluate((el) => {
        const css = getComputedStyle(el);
        return [
          css.backgroundColor,
          css.color,
          css.padding,
          css.borderRadius,
          css.fontSize,
          css.boxShadow,
        ];
      });
    await page.getByRole('button', { name: 'Bold', exact: true }).hover();
    await expect(hints).toHaveCount(1);
    await expect(hints).toHaveText('Bold');
    const expected = await style();
    for (const [label, text] of [
      ['Clear formatting', 'Clear formatting'],
      ['Help', 'Formatting help'],
    ]) {
      await page.getByRole('button', { name: label, exact: true }).hover();
      await expect(hints).toHaveCount(1);
      await expect(hints).toHaveText(text);
      expect(await style()).toEqual(expected);
      expect(await hints.evaluate((el) => el.matches(':popover-open'))).toBe(
        true,
      );
      const box = await hints.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    await page.keyboard.press('Escape');
    await expect(hints).toHaveCount(0);
    await page.getByRole('listitem').focus();
    await expect(hints).toHaveCount(1);
    await expect(hints).toContainText('2 items');
    expect(await style()).toEqual(expected);
    await page.keyboard.press('Escape');
    await expect(hints).toHaveCount(0);
  });

test('selection lists reveal clipped names, including rich templates, and preserve selection', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html');
  const longName =
    'Workflow automation for the quarterly international planning review';
  const hints = page.locator('.rv-tooltip:visible');
  const option = page
    .getByRole('listbox', { name: 'Task choices' })
    .getByRole('option', { name: longName });
  await option.hover();
  await expect(hints).toHaveText(longName);
  await expect(option).toHaveAttribute(
    'aria-describedby',
    (await hints.getAttribute('id')) as string,
  );
  await page.keyboard.press('Escape');
  await expect(hints).toHaveCount(0);
  await expect(option).not.toHaveAttribute('aria-describedby');
  await option.focus();
  await expect(hints).toHaveText(longName);
  await page.getByRole('option', { name: 'Short', exact: true }).hover();
  await expect(hints).toHaveCount(0);
  await page.locator('.rich-label').hover();
  await expect(hints).toHaveText(longName);
  await page.locator('.filter-list-option input').check();
  await expect(page.locator('.filter-list-option input')).toBeChecked();
  await page.getByRole('combobox', { name: 'Department' }).click();
  await page.locator('.dropdown-option').filter({ hasText: longName }).hover();
  await expect(hints).toHaveText(longName);
  await page.keyboard.press('Escape');
  await expect(hints).toHaveCount(0);
  // The first Escape dismisses the tooltip; the next closes its dropdown.
  await page.keyboard.press('Escape');
  await expect(page.locator('.dropdown-option')).not.toBeVisible();
  await page.locator('.rv-resource-picker__details strong').hover();
  await expect(hints).toHaveText(longName);
});

test('resource dropdown reveals clipped active names while focus stays in search', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html');
  await page
    .getByRole('combobox', { name: 'Dropdown owners', exact: true })
    .click();
  const search = page.getByRole('searchbox', {
    name: 'Search dropdown owners',
    exact: true,
  });
  await expect(search).toBeFocused();
  const hints = page.locator('.rv-tooltip:visible');
  const longName =
    'Workflow automation for the quarterly international planning review';
  await search.press('ArrowDown');
  await expect(hints).toHaveText(`Second ${longName}`);
  await expect(search).toBeFocused();
  await search.press('ArrowUp');
  await expect(hints).toHaveText(longName);
  await search.press('Escape');
  await expect(hints).toHaveCount(0);
});

for (const name of ['Bold', 'Clear formatting', 'Help']) {
  test(`hover hint stays readable while crossing to its surface: ${name}`, async ({
    page,
  }) => {
    await page.goto('/tests/browser/fixtures/tooltip/index.html?hints');
    const trigger = page.getByRole('button', { name, exact: true });
    const tooltip = page.locator('.rv-tooltip:visible');
    await trigger.hover();
    await expect(tooltip).toHaveCount(1);
    const from = (await trigger.boundingBox())!;
    const to = (await tooltip.boundingBox())!;
    // Pause over the gap: a fixed hide timeout must not cut off slow travel.
    await page.mouse.move(
      from.x + from.width / 2,
      (from.y + to.y + to.height) / 2,
    );
    await page.waitForTimeout(400);
    await expect(tooltip).toHaveCount(1);
    await tooltip.hover();
    await page.waitForTimeout(400);
    await expect(tooltip).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.mouse.move(1000, 650);
    await trigger.hover();
    await expect(tooltip).toHaveCount(1);
    await tooltip.hover();
    await page.mouse.move(1000, 650);
    await expect(tooltip).toHaveCount(0);
  });
}

test('timeline boundary and milestone handles remain fully reachable and draggable', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?timeline');
  const track = page.getByRole('group', {
    name: 'Boundary timeline preview',
    exact: true,
  });
  await track.scrollIntoViewIfNeeded();
  const bounds = (await track.boundingBox())!;
  for (const handle of await track.getByRole('slider').all()) {
    const box = (await handle.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(bounds.x);
    expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(
      await handle.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    ).toBe(true);
  }
  const end = track.getByRole('slider', {
    name: 'Resize end of Right edge',
    exact: true,
  });
  const box = (await end.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + bounds.width / 24,
    box.y + box.height / 2,
    { steps: 3 },
  );
  await page.mouse.up();
  await expect(end).toHaveAttribute('aria-valuenow', '24');
});

test('keyboard tooltip survives focus scrolling and follows its trigger', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html');
  await page.addStyleTag({ content: 'body { min-height: 1400px; }' });
  const trigger = page.getByRole('button', { name: 'Bold', exact: true });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip', { name: 'Bold', exact: true });
  await expect(tooltip).toBeVisible();
  const initialTop = (await tooltip.boundingBox())!.y;
  await page.evaluate(() => window.scrollTo(0, 20));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(20);
  await expect(tooltip).toBeVisible();
  await expect
    .poll(async () => (await tooltip.boundingBox())?.y)
    .not.toBe(initialTop);
  await expect(trigger).toBeFocused();
  await trigger.press('Tab');
  await expect(tooltip).toHaveCount(0);
});

test('expanded tooltip placement, rich content, native click and controlled state', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  const popup = page.getByRole('tooltip');
  const trigger = page.getByRole('button', {
    name: 'Positioned help',
    exact: true,
  });
  await trigger.focus();
  await expect(popup.locator('strong')).toHaveText('Rich placement details');
  await expect(popup).toHaveAttribute('data-side', 'right');
  await expect(popup).toHaveAttribute('data-arrow', 'true');
  const anchor = (await trigger.boundingBox())!;
  const bounds = (await popup.boundingBox())!;
  expect(Math.abs(bounds.x - (anchor.x + anchor.width + 16))).toBeLessThan(1);
  expect(Math.abs(bounds.y - anchor.y)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  for (const [name, content, count] of [
    ['Click help', 'Click details', '1'],
    ['Hook help', 'Hook click details', '3'],
  ]) {
    const button = page.getByRole('button', { name, exact: true });
    await button.focus();
    await button.press('Enter');
    await expect(popup).toHaveText(content);
    await expect(page.getByRole('status', { name: 'Clicks' })).toHaveText(
      count,
    );
    await button.press('Space');
    await expect(popup).toHaveCount(0);
  }
  const controlled = page.getByRole('button', {
    name: 'Controlled help',
    exact: true,
  });
  await controlled.focus();
  await expect(popup).toHaveText('Controlled details');
  await expect(page.getByRole('status', { name: 'Open' })).toHaveText('true');
  await controlled.press('Escape');
  await expect(page.getByRole('status', { name: 'Open' })).toHaveText('false');
  await expect(popup).toHaveCount(0);
});

test('async results survive parent updates and delegated dynamic targets use one rich surface', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  const popup = page.getByRole('tooltip');
  await page.getByRole('button', { name: 'Async help', exact: true }).focus();
  await expect(popup).toHaveText('Loading details');
  await expect(popup).toHaveText('Loaded details');
  await expect(page.getByRole('status', { name: 'Loads' })).toHaveText('1');
  await expect(popup).toHaveText('Loaded details');
  await page
    .getByRole('button', { name: 'Toggle failure', exact: true })
    .click();
  await page.getByRole('button', { name: 'Async help', exact: true }).focus();
  await expect(popup).toHaveText('Details unavailable');
  await expect(page.getByRole('status', { name: 'Loads' })).toHaveText('2');
  await page
    .getByRole('button', { name: 'Add delegated trigger', exact: true })
    .click();
  const second = page.getByRole('button', { name: 'Delegated 2', exact: true });
  await second.click();
  await expect(popup.locator('strong')).toHaveText('Item 2 details');
  await expect(second).toHaveAttribute(
    'aria-describedby',
    (await popup.getAttribute('id'))!,
  );
  await expect(
    page.getByRole('button', { name: 'Delegated 1', exact: true }),
  ).not.toHaveAttribute('aria-describedby');
  await second.press('Escape');
  await expect(popup).toHaveCount(0);
});

test('manual hook opens an untouched trigger without moving focus', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  const trigger = page.getByRole('button', {
    name: 'Untouched manual help',
    exact: true,
  });
  const show = page.getByRole('button', {
    name: 'Show manual hint',
    exact: true,
  });
  await show.click();
  const popup = page.getByRole('tooltip', {
    name: 'Untouched manual details',
    exact: true,
  });
  await expect(popup).toBeVisible();
  await expect(trigger).toHaveAttribute(
    'aria-describedby',
    (await popup.getAttribute('id'))!,
  );
  await expect(show).toBeFocused();
  await show.press('Escape');
  await expect(popup).toHaveCount(0);
});

test('visible controlled surface reopens when enabled without changing its anchor or visibility', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  const trigger = page.getByRole('button', {
    name: 'Controlled surface anchor',
    exact: true,
  });
  const toggle = page.getByRole('button', {
    name: 'Toggle surface disabled',
    exact: true,
  });
  const popup = page.getByRole('tooltip', {
    name: 'Controlled surface details',
    exact: true,
  });
  await expect(popup).toHaveCount(0);
  for (let cycle = 0; cycle < 2; cycle++) {
    await toggle.click();
    await expect(popup).toBeVisible();
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      'api-control-surface',
    );
    await toggle.click();
    await expect(popup).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  }
});

test('arrow tooltip keeps overflowing content inside its bounded scroll area', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  await page
    .getByRole('button', { name: 'Overflow help', exact: true })
    .focus();
  const popup = page.getByRole('tooltip');
  await expect(popup).toBeVisible();
  const geometry = await popup.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('.rv-tooltip__content')!;
    const outer = element.getBoundingClientRect(),
      inner = content.getBoundingClientRect();
    return {
      height: outer.height,
      inside: inner.bottom <= outer.bottom && inner.top >= outer.top,
      scrollable: content.scrollHeight > content.clientHeight,
    };
  });
  expect(geometry.height).toBeLessThanOrEqual(80);
  expect(geometry.inside).toBe(true);
  expect(geometry.scrollable).toBe(true);
});

test('native form, disclosure and editable triggers receive their own descriptions', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  const controls = [
    [
      page.getByRole('textbox', { name: 'Native textarea', exact: true }),
      'Textarea details',
    ],
    [
      page.getByRole('combobox', { name: 'Native select', exact: true }),
      'Select details',
    ],
    [
      page.locator('summary').filter({ hasText: 'Native summary' }),
      'Summary details',
    ],
    [
      page.getByRole('textbox', { name: 'Native editable', exact: true }),
      'Editable details',
    ],
  ] as const;
  for (const [trigger, text] of controls) {
    await trigger.focus();
    const popup = page.getByRole('tooltip', { name: text, exact: true });
    await expect(popup).toBeVisible();
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      (await popup.getAttribute('id'))!,
    );
    await trigger.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  }
});

test('numeric JSX styles apply pixel lengths without corrupting unitless values', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?api');
  await page.getByRole('button', { name: 'Styled help', exact: true }).focus();
  const popup = page.getByRole('tooltip', {
    name: 'Styled details',
    exact: true,
  });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS('padding', '12px');
  await expect(popup).toHaveCSS('font-size', '14px');
  await expect(popup).toHaveCSS('line-height', '21px');
  await expect(popup).toHaveCSS('opacity', '0.9');
  await expect(popup).toHaveCSS('z-index', '1234');
  expect(
    await popup.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--custom-value'),
    ),
  ).toBe('3');
});

test('controlled exit completes when onHide rerenders its parent', async ({
  page,
}) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?exit-transition');
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveAttribute('data-state', 'open');
  await page
    .getByRole('button', { name: 'Close animated hint', exact: true })
    .click();
  await expect(page.getByRole('status', { name: 'Hide requests' })).toHaveText(
    '1',
  );
  await expect(tooltip).toBeHidden();
  await expect(
    page.getByRole('status', { name: 'Exit completions' }),
  ).toHaveText('1');
});

test('decorated icon controls expose one tooltip label', async ({ page }) => {
  await page.goto('/tests/browser/fixtures/tooltip/index.html?decorated-icon');
  await page.getByRole('button', { name: 'Linked views', exact: true }).hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Linked views');
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
});
