import { expect, test } from '@playwright/test';
import { compileAsync } from 'sass-embedded';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '../..');

test('published React imports install only their required styles without a CSS import', async ({
  page,
}) => {
  const result = await build({
    stdin: {
      contents: `
        import {createElement, StrictMode} from 'react';
        import {createRoot} from 'react-dom/client';
        import {flushSync} from 'react-dom';
        import {SvgButton, Calendar} from './dist/react.js';
        const root = createRoot(document.getElementById('app'));
        globalThis.show = (calendar) => flushSync(() => root.render(createElement(StrictMode, null,
          createElement(SvgButton, {label: 'Save', visibleLabel: 'Save'}),
          createElement(SvgButton, {label: 'Other'}),
          calendar && createElement(Calendar, {month: '2026-11-01', focusedDate: '2026-11-11'})
        )));
        globalThis.show(false);
      `,
      resolveDir: root,
    },
    bundle: true,
    write: false,
    format: 'iife',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: ['pdfjs-dist'],
    logLevel: 'silent',
  });
  await page.setContent(
    '<style>*, *::before, *::after { transition: none !important; animation: none !important; }</style><div id="app"></div>',
  );
  await page.addScriptTag({ content: result.outputFiles[0].text });
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('style[data-rv-component-styles="base"]'),
  ).toHaveCount(1);
  await expect(page.locator('style[data-rv-component-styles]')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toHaveCSS('display', 'inline-flex');
  await page.evaluate(() => (globalThis as any).show(true));
  await expect(page.getByRole('grid')).toBeVisible();
  await expect(
    page.locator('style[data-rv-component-styles="calendar"]'),
  ).toHaveCount(1);
  await expect(page.locator('style[data-rv-component-styles]')).toHaveCount(2);
  for (const width of [480, 1200]) {
    await page.setViewportSize({ width, height: 800 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      const before = await page
        .locator('.revo-calendar__day')
        .first()
        .evaluate((node) => {
          const style = getComputedStyle(node);
          return [
            style.display,
            style.backgroundColor,
            style.color,
            style.padding,
            style.borderRadius,
          ];
        });
      const aggregate = await page.addStyleTag({ content: css });
      const after = await page
        .locator('.revo-calendar__day')
        .first()
        .evaluate((node) => {
          const style = getComputedStyle(node);
          return [
            style.display,
            style.backgroundColor,
            style.color,
            style.padding,
            style.borderRadius,
          ];
        });
      expect(before).toEqual(after);
      await aggregate.evaluate((node) => node.remove());
    }
  }
  await page.evaluate(() => (globalThis as any).show(false));
  await page.getByRole('button', { name: 'Save', exact: true }).focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
});
let css: string;
test.beforeAll(async () => {
  css = (await compileAsync(resolve(root, 'package/styles.scss'))).css;
});

test('resize handle keeps keyboard focus visible in forced colors', async ({
  page,
}) => {
  await page.setContent(
    '<div class="rv-resize-handle" role="separator" aria-label="Panel width" tabindex="0"></div>',
  );
  await page.addStyleTag({ content: css });
  await page.keyboard.press('Tab');
  const handle = page.getByRole('separator', { name: 'Panel width' });
  await expect(handle).toBeFocused();
  await expect(handle).toHaveCSS('outline-style', 'none');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(handle).toHaveCSS('outline-style', 'solid');
  await expect(handle).toHaveCSS('outline-width', '2px');
});

test('common UI styles alone provide the clean Fields surface', async ({
  page,
}) => {
  await page.setContent(`<div class="rv-configurator-panel rv-configurator-panel--standalone" style="width:240px">
    <revo-grid theme="compact" class="rv-configurator-fields-grid" style="height:36px">
      <revogr-data><div class="rgRow" style="display:flex;height:36px">
        <div class="rgCell disabled" style="width:26px"><span class="rv-configurator-field-drag" draggable="true"><span class="rv-configurator-drag-handle"></span></span></div>
        <div class="rgCell disabled" style="flex:1">Country</div>
        <div class="rgCell disabled" style="width:56px"><div class="rv-configurator-field-actions">Actions</div></div>
      </div></revogr-data>
    </revo-grid></div>`);
  // Representative host defaults must be overridden by UI, without product CSS.
  await page.addStyleTag({
    content:
      'revo-grid .rgRow{box-shadow:0 -1px #ccc inset} revo-grid .rgCell{padding:0 15px;border-bottom:1px solid #ccc;background:#eee} revo-grid:is([theme=compact],[theme=darkCompact]) revogr-data .rgCell.disabled{box-shadow:0 -1px #ccc inset}',
  });
  await page.addStyleTag({ content: css });
  for (const theme of ['light', 'dark']) {
    await page.locator('.rv-configurator-panel').evaluate((element, theme) => {
      element.setAttribute('data-theme', theme);
    }, theme);
    const surface = await page.locator('revo-grid').evaluate((grid) => {
      const row = grid.querySelector<HTMLElement>('.rgRow')!;
      const cells = [...row.querySelectorAll<HTMLElement>('.rgCell')];
      const grip = row
        .querySelector<HTMLElement>('.rv-configurator-drag-handle')!
        .getBoundingClientRect();
      const bounds = row.getBoundingClientRect();
      return {
        borderless:
          getComputedStyle(row).boxShadow === 'none' &&
          cells.every(
            (cell) =>
              getComputedStyle(cell).borderBottomWidth === '0px' &&
              getComputedStyle(cell).boxShadow === 'none',
          ),
        spacing: cells.every(
          (cell) => getComputedStyle(cell).paddingInlineStart === '0px',
        ),
        centered:
          Math.abs(
            grip.top + grip.height / 2 - bounds.top - bounds.height / 2,
          ) < 1,
        fits: grid.scrollWidth <= grid.clientWidth,
      };
    });
    expect(surface).toEqual({
      borderless: true,
      spacing: true,
      centered: true,
      fits: true,
    });
  }
});

test('opt-in base, calendar and dialog CSS preserve aggregate control presentation across themes', async ({
  page,
}) => {
  const { readFileSync } = await import('node:fs');
  const aggregate = readFileSync(resolve(root, 'dist/styles.css'), 'utf8');
  const modular = ['base', 'calendar', 'dialogs']
    .map((name) =>
      readFileSync(resolve(root, `dist/styles/${name}.css`), 'utf8'),
    )
    .join('\n');
  const selectors = [
    '.rv-btn-primary',
    '.rv-control',
    '.rv-checkbox',
    '.revo-calendar__day',
    '.rv-dialog__surface',
  ];
  const properties = [
    'display',
    'color',
    'background-color',
    'border-top-color',
    'border-top-width',
    'border-radius',
    'padding',
    'height',
    'font-size',
  ];
  for (const width of [480, 1200]) {
    await page.setViewportSize({ width, height: 800 });
    for (const theme of ['light', 'dark']) {
      const html = `<div data-theme="${theme}">
        <button class="rv-btn rv-btn-primary">Save</button>
        <input class="rv-control" aria-label="Name" value="Revo UI">
        <input class="rv-checkbox" type="checkbox" aria-label="Enabled" checked>
        <div class="revo-calendar"><button class="revo-calendar__day">15</button></div>
        <dialog open class="rv-dialog"><form class="rv-dialog__surface"><div class="rv-dialog__body">Details</div></form></dialog>
      </div>`;
      const capture = async (styles: string) => {
        await page.setContent(html);
        await page.addStyleTag({
          content:
            styles +
            '\n*, *::before, *::after { transition: none !important; animation: none !important; }',
        });
        return page.evaluate(
          ({ selectors, properties }) =>
            selectors.map((selector) => {
              const style = getComputedStyle(document.querySelector(selector)!);
              return Object.fromEntries(
                properties.map((property) => [
                  property,
                  style.getPropertyValue(property),
                ]),
              );
            }),
          { selectors, properties },
        );
      };
      expect(await capture(modular), `${width}px ${theme}`).toEqual(
        await capture(aggregate),
      );
    }
  }
});
