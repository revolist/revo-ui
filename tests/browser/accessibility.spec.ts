import { chooseOption } from './choose-option';
import { createRequire } from 'node:module';
import { test, expect } from './gallery-test';

const require = createRequire(
  new URL('../../package.json', import.meta.url),
);
const axeScript = require.resolve('axe-core/axe.min.js');

for (const width of [1280, 390])
  for (const theme of ['light', 'dark']) {
    test(`WCAG automated checks: ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/?page=colors']) {
        await page.goto(path);
        await chooseOption(
          page.getByRole('button', { name: 'Theme', exact: true }),
          theme === 'light' ? 'Light' : 'Dark',
        );
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
        await info.attach(
          `${path === '/' ? 'components' : 'colors'}-axe.json`,
          {
            body: JSON.stringify(results, null, 2),
            contentType: 'application/json',
          },
        );
        expect(
          results.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
        ).toEqual([]);
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
