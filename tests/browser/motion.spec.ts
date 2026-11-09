import { chooseOption } from './choose-option';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from './gallery-test';

async function expectMotionStopped(page: import('@playwright/test').Page) {
  // Includes every example, loading indicator, and body-level portal, not just buttons.
  const moving = await page.evaluate(() => {
    const results: string[] = [];
    for (const element of document.querySelectorAll(
      '.catalog *, .rv-dialog-overlay *, .revo-dropdown-menu *',
    )) {
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        const values = [
          ...style.transitionDuration.split(','),
          ...style.animationDuration.split(','),
        ];
        if (values.some((value) => Number.parseFloat(value) > 0))
          results.push(`${element.className}${pseudo ?? ''}`);
      }
    }
    return results;
  });
  expect(moving).toEqual([]);
}

test('motion is subtle, state-only, and can be disabled and restored from the gallery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#components');
  const primary = page.getByRole('button', { name: 'Primary', exact: true });
  expect(
    await primary.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).not.toBe('0s');
  const transitions = await page
    .locator(
      '.rv-timeline-control__bar, .rv-time-grid__cell, .rv-progress-bar__bar',
    )
    .evaluateAll((elements) =>
      elements.map((el) => getComputedStyle(el).transitionProperty),
    );
  expect(transitions.join(' ')).not.toMatch(
    /\b(?:all|width|height|left|right|top|bottom)\b/,
  );
  await page.getByRole('switch', { name: 'Animations', exact: true }).uncheck();
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await primary.hover();
    await expectMotionStopped(page);
  }
  await page
    .getByRole('checkbox', { name: 'Selection', exact: true })
    .uncheck();
  await expect(
    page.getByRole('checkbox', { name: 'Selection', exact: true }),
  ).not.toBeChecked();
  await page.getByRole('switch', { name: 'Animations', exact: true }).check();
  expect(
    await primary.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).not.toBe('0s');
});

test('subtree opt-out follows a dialog and nested dropdown into portals', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#components');
  await page
    .locator('#dialogs-and-floating-surfaces')
    .evaluate((el) => el.setAttribute('data-rv-ui-motion', 'off'));
  const trigger = page.getByRole('button', {
    name: 'Open dialog',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Edit project',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-rv-ui-motion', 'off');
  await expect(dialog).toHaveCSS('animation-name', 'none');
  await dialog.getByRole('combobox', { name: 'Dialog view' }).click();
  const popup = page.locator('.revo-dropdown-menu');
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS('animation-name', 'none');
  await popup.locator('input').focus();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await dialog.focus();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(
    await page
      .getByRole('button', { name: 'Primary', exact: true })
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).not.toBe('0s');
});

test('OS reduced motion wins over system mode and keeps controls and loading indicators visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#components');
  await expectMotionStopped(page);
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Edit project', exact: true }),
  ).toBeVisible();
  await expectMotionStopped(page);
  await page.getByRole('textbox', { name: 'Dialog name', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.rv-spinner').first()).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open dialog', exact: true }),
  ).toBeFocused();
});

test('standalone checkbox, field and rating styles honor both disable mechanisms', async ({
  page,
}) => {
  const require = createRequire(
    new URL('../../package.json', import.meta.url),
  );
  const sass = require('sass-embedded') as typeof import('sass-embedded');
  const css =
    sass.compileString(
      "@use 'checkbox/checkbox'; @use 'styles/control'; .standalone-field { @include control.field; }",
      {
        loadPaths: [
          fileURLToPath(
            new URL('../../package', import.meta.url),
          ),
        ],
      },
    ).css +
    readFileSync(
      new URL(
        import.meta.resolve('@revolist/ui/styles/rating.css'),
        import.meta.url,
      ),
      'utf8',
    );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setContent(
    '<section id="region"><input type="checkbox" class="rv-checkbox" aria-label="Standalone checkbox"><input class="standalone-field" aria-label="Standalone field"><div class="rating-star-container"><span class="star"></span></div></section>',
  );
  await page.addStyleTag({ content: css });
  const durations = () =>
    page
      .locator('.rv-checkbox, .standalone-field, .star')
      .evaluateAll((elements) =>
        elements.map((el) => getComputedStyle(el).transitionDuration),
      );
  expect((await durations()).every((value) => value !== '0s')).toBe(true);
  await page
    .locator('#region')
    .evaluate((el) => el.setAttribute('data-rv-ui-motion', 'off'));
  expect(
    (await durations()).every((value) =>
      value.split(',').every((duration) => Number.parseFloat(duration) === 0),
    ),
  ).toBe(true);
  await page
    .locator('#region')
    .evaluate((el) => el.removeAttribute('data-rv-ui-motion'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    (await durations()).every((value) =>
      value.split(',').every((duration) => Number.parseFloat(duration) === 0),
    ),
  ).toBe(true);
});
