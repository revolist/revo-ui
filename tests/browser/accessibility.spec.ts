import { chooseOption } from './choose-option';
import { createRequire } from 'node:module';
import { test, expect, type Page } from './gallery-test';
import type { TestInfo } from '@playwright/test';

const require = createRequire(new URL('../../package.json', import.meta.url));
const axeScript = require.resolve('axe-core/axe.min.js');

async function scan(page: Page, info: TestInfo, label: string, scope?: string) {
  // Finish finite entrance/theme motion, including suspended offscreen controls.
  // Motion behavior has separate tests; these scans inspect the settled state.
  await page.screenshot({
    path: info.outputPath(`${label}.png`),
    animations: 'disabled',
  });
  await page.addScriptTag({ path: axeScript });
  const results = await page.evaluate(async (scope) => {
    const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
    return axe.run(scope ? document.querySelector(scope)! : document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
  }, scope);
  await info.attach(`${label}-axe.json`, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

for (const width of [1280, 390])
  for (const theme of ['light', 'dark']) {
    test(`WCAG automated checks: ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/#components', '/?page=colors']) {
        await page.goto(path);
        await chooseOption(
          page.getByRole('button', { name: 'Theme', exact: true }),
          theme === 'light' ? 'Light' : 'Dark',
        );
        await scan(
          page,
          info,
          path === '/#components' ? 'components' : 'colors',
        );
      }
    });
  }

test('keyboard focus remains visible in forced colors with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/components/buttons/');
  await page.keyboard.press('Tab');
  const button = page.getByRole('button', { name: 'Solid', exact: true });
  await button.focus();
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button).toHaveCSS('outline-width', '2px');
});

test('header content reflows without overlap at 320 CSS pixels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#components');
  const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
  const options = page.getByRole('button', {
    name: 'More gallery options',
    exact: true,
  });
  await expect(options).toBeVisible();
  await expect(options).toHaveAttribute('aria-expanded', 'false');
  const toolbar = page.getByRole('toolbar', { name: 'Gallery settings' });
  await expect(toolbar).toBeHidden();
  const settings = (await options.boundingBox())!;
  const brand = (await page.locator('.catalog-title').boundingBox())!;
  const pages = (await page
    .getByRole('navigation', { name: 'Library pages' })
    .boundingBox())!;
  for (const primary of [title, brand])
    for (const other of [settings, pages]) {
      expect(
        primary.y + primary.height <= other.y ||
          other.y + other.height <= primary.y ||
          primary.x + primary.width <= other.x ||
          other.x + other.width <= primary.x,
      ).toBe(true);
    }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await options.click();
  await expect(toolbar).toBeVisible();
  const popup = (await page
    .locator('.gallery-settings-content')
    .boundingBox())!;
  expect(popup.x).toBeGreaterThanOrEqual(0);
  expect(popup.x + popup.width).toBeLessThanOrEqual(320);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const theme of ['light', 'dark']) {
  test(`open and invalid component states have no automated WCAG violations: ${theme}`, async ({
    page,
  }, info) => {
    test.setTimeout(90_000);
    await page.goto('/components/dialogs-and-floating-surfaces/');
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await page
      .getByRole('button', { name: 'Open dialog', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Edit project', exact: true }),
    ).toBeVisible();
    await scan(page, info, 'dialog');
    await page
      .getByRole('combobox', { name: 'Dialog view', exact: true })
      .click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await scan(page, info, 'nested-dropdown', '.revo-dropdown-menu');
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Open nested confirmation', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Confirm changes', exact: true }),
    ).toBeVisible();
    await scan(page, info, 'nested-confirmation');
    await page.goto('/components/remote-lookup-field/');
    await page.getByRole('button', { name: 'Select linked record' }).click();
    await page.getByRole('combobox', { name: 'Linked records' }).press('Enter');
    await page
      .getByRole('textbox', { name: 'Search options' })
      .fill('no matching target');
    await expect(
      page.getByText('No results found', { exact: true }),
    ).toBeVisible();
    await scan(page, info, 'empty-lookup', '.revo-dropdown-menu');
    await page.keyboard.press('Escape');
    await scan(page, info, 'lookup-editor');
    await page.goto('/components/calendar-and-dates/');
    const card = page.locator('.catalog-example').filter({
      has: page.getByRole('heading', { name: 'Range calendar', exact: true }),
    });
    await card
      .locator(
        'button[data-calendar-date="2026-10-10"]:not([aria-hidden="true"])',
      )
      .click();
    await card
      .locator(
        'button[data-calendar-date="2026-10-11"]:not([aria-hidden="true"])',
      )
      .hover();
    await expect(card.getByRole('status')).toHaveText(
      'This date cannot be selected.',
    );
    await scan(page, info, 'invalid-date-range');
  });
}

test('all specimens reflow at 320px with WCAG text spacing', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#components');
  await page.addStyleTag({
    content:
      '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath('text-spacing-320.png'),
    fullPage: true,
  });
});
