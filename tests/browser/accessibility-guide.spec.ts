import { createRequire } from 'node:module';
import { test, expect } from './gallery-test';
import { chooseOption } from './choose-option';

const require = createRequire(new URL('../../package.json', import.meta.url));
const axeScript = require.resolve('axe-core/axe.min.js');

for (const width of [320, 800, 1280]) {
  test(`accessibility guide is readable and its examples work at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/accessibility/');
    await expect(page).toHaveTitle(
      'Accessible UI components: a practical guide · Revo UI',
    );
    await expect(page.locator('article h1')).toHaveText(
      'Accessible interfaces, built into everyday work.',
    );
    await expect(
      page
        .getByRole('navigation', { name: 'Library pages' })
        .getByRole('link', { name: 'Docs', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      page
        .getByRole('navigation', { name: 'Library pages' })
        .getByRole('link', { name: 'Accessibility', exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('link', { name: 'Skip to accessibility guide' })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#components')).toBeFocused();
    const contents = page.getByRole('navigation', {
      name: 'Accessibility guide contents',
    });
    await contents
      .getByRole('link', { name: 'Keyboard and focus', exact: true })
      .click();
    await expect(page).toHaveURL(/#keyboard-and-focus$/);
    const open = page.getByRole('button', {
      name: 'Open example dialog',
      exact: true,
    });
    await open.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', {
      name: 'Keyboard navigation example',
    });
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
    await page.keyboard.press('Tab');
    await expect(
      dialog.getByRole('textbox', { name: 'Example note' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(open).toBeFocused();

    await page
      .getByRole('button', { name: 'Create preview', exact: true })
      .click();
    const field = page.getByRole('textbox', {
      name: 'Report name (required)',
      exact: true,
    });
    await expect(field).toBeFocused();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toHaveText(
      'Enter a report name to create the preview.',
    );
    await field.fill('Quarterly budget');
    await page
      .getByRole('button', { name: 'Create preview', exact: true })
      .click();
    await expect(field).not.toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByRole('status').filter({ hasText: 'Preview ready:' }),
    ).toHaveText('Preview ready: Quarterly budget.');
    await page.getByText('Edit timeline events', { exact: true }).click();
    await page.getByRole('button', { name: 'Move later', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Report draft:' }),
    ).toHaveText('Report draft: 9:00–13:00.');

    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const settings = page.getByRole('button', {
        name: 'More gallery options',
        exact: true,
      });
      if (
        (await settings.isVisible()) &&
        (await settings.getAttribute('aria-expanded')) === 'true'
      ) {
        await settings.click();
        if (await settings.isVisible()) {
          await expect(settings).toHaveAttribute('aria-expanded', 'false');
          await expect(page.locator('.gallery-settings-content')).toBeHidden();
        }
        await expect(settings).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('.gallery-settings-content')).toBeHidden();
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: info.outputPath(`accessibility-${theme}-${width}-intro.png`),
        animations: 'disabled',
      });
      await page.screenshot({
        path: info.outputPath(`accessibility-${theme}-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.addScriptTag({ path: axeScript });
      const results = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe;
        return axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
        });
      });
      await info.attach(`${theme}-axe.json`, {
        body: JSON.stringify(results),
        contentType: 'application/json',
      });
      expect(
        results.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
  });
}

test('documentation makes the accessibility guide discoverable', async ({
  page,
}) => {
  await page.goto('/frameworks/');
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation navigation' })
      .getByRole('link', { name: 'Accessibility', exact: true }),
  ).toHaveAttribute('href', '/accessibility/');
  await page
    .getByRole('navigation', { name: 'Documentation navigation' })
    .getByRole('link', { name: 'JavaScript / CDN', exact: true })
    .click();
  await expect(page).toHaveURL(/#browser-cdn$/);
  await expect(
    page.getByRole('heading', {
      name: 'Use JavaScript from a CDN, without a build step',
    }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Read the accessibility guide →', exact: true })
    .click();
  await expect(page).toHaveURL(/\/accessibility\/$/);
  await expect(page.locator('article h1')).toBeVisible();
});
