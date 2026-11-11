import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { transformAsync } from '@babel/core-angular';
import linker from '@angular/compiler-cli/linker/babel';
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

for (const framework of ['react', 'vue', 'angular', 'svelte']) {
  for (const extracted of [false, true]) {
    test(`${framework} ${extracted ? 'extracted CSS' : 'automatic styles'} respects strict CSP`, async ({
      page,
    }) => {
      const entry = extracted
        ? `./dist/unstyled/${framework === 'angular' ? 'angular/angular' : framework}.js`
        : `./dist/${framework === 'angular' ? 'angular/angular' : framework}.js`;
      const props = `{label: 'CSP action', visibleLabel: 'CSP action'}`;
      const startup: Record<string, string> = {
        react: `import {createElement} from 'react'; import {createRoot} from 'react-dom/client'; import {SvgButton} from '${entry}'; createRoot(document.getElementById('app')).render(createElement(SvgButton, ${props}));`,
        vue: `import {createApp, h} from 'vue'; import {SvgButton} from '${entry}'; createApp({render: () => h(SvgButton, ${props})}).mount('#app');`,
        angular: `import '@angular/compiler'; import {Component} from '@angular/core'; import {bootstrapApplication} from '@angular/platform-browser'; import {UiComponent} from '${entry}'; class App {props = ${props};} Component({selector:'test-app',standalone:true,imports:[UiComponent],template:'<rv-ui component="SvgButton" [props]="props" />'})(App); export function startApp() { return bootstrapApplication(App); }`,
        svelte: `import {mount} from 'svelte'; import {UiComponent} from '${entry}'; mount(UiComponent,{target:document.getElementById('app'),props:{component:'SvgButton',props:${props}}});`,
      };
      if (framework === 'angular') {
        const fixture = resolve(
          root,
          'test-results/angular-csp',
          extracted ? 'extracted' : 'automatic',
        );
        mkdirSync(fixture, { recursive: true });
        writeFileSync(
          resolve(fixture, 'main.ts'),
          `import {Component} from '@angular/core'; import {bootstrapApplication} from '@angular/platform-browser'; import {UiComponent} from '${resolve(root, entry)}'; @Component({selector:'test-app',standalone:true,imports:[UiComponent],template:'<rv-ui component="SvgButton" [props]="props" />'}) class App {props = ${props};} export function startApp() { return bootstrapApplication(App); }`,
        );
        writeFileSync(
          resolve(fixture, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              target: 'ES2022',
              module: 'ES2022',
              moduleResolution: 'bundler',
              experimentalDecorators: true,
              skipLibCheck: true,
              types: [],
              outDir: 'out',
            },
            angularCompilerOptions: {
              compilationMode: 'full',
              strictTemplates: true,
            },
            files: ['main.ts'],
          }),
        );
        execFileSync(
          process.execPath,
          [
            resolve(
              root,
              'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',
            ),
            '-p',
            resolve(fixture, 'tsconfig.json'),
          ],
          { cwd: root },
        );
        startup.angular = `import { startApp } from ${JSON.stringify(resolve(fixture, 'out/main.js'))}; startApp();`;
      }
      const result = await build({
        stdin: {
          contents: `
          import {configureUiStyles} from './dist/core/component-styles.js';
          ${extracted ? "import './dist/styles/base.css';" : ''}
          configureUiStyles({mode: '${extracted ? 'external' : 'automatic'}', nonce:'ui-style-test'});
          ${startup[framework]}
        `,
          resolveDir: root,
        },
        plugins:
          framework === 'angular'
            ? [
                {
                  name: 'angular-production-linker',
                  setup(build) {
                    build.onLoad({ filter: /\.[cm]?js$/ }, async ({ path }) => {
                      const source = readFileSync(path, 'utf8');
                      if (!source.includes('ɵɵngDeclare')) return;
                      return {
                        contents: (await transformAsync(source, {
                          filename: path,
                          plugins: [[linker, { linkerJitMode: false }]],
                          babelrc: false,
                          configFile: false,
                        }))!.code!,
                        loader: 'js',
                      };
                    });
                  },
                },
              ]
            : [],
        bundle: true,
        write: false,
        outdir: 'out',
        format: 'iife',
        platform: 'browser',
        define: { 'process.env.NODE_ENV': '"production"', ngDevMode: 'false' },
        external: ['pdfjs-dist'],
        logLevel: 'silent',
      });
      const js = result.outputFiles
        .find((file) => file.path.endsWith('.js'))!
        .text.replace(/<\/script/gi, '<\\/script');
      const cssOutput = result.outputFiles.find((file) =>
        file.path.endsWith('.css'),
      )?.text;
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('http://ui-style.test/**', async (route) => {
        if (route.request().url().endsWith('/app.css'))
          return route.fulfill({
            contentType: 'text/css',
            body: cssOutput ?? '',
          });
        await route.fulfill({
          contentType: 'text/html',
          headers: {
            'Content-Security-Policy': `default-src 'none'; script-src 'nonce-ui-script-test'; style-src ${extracted ? "'self'" : "'nonce-ui-style-test'"}; style-src-attr 'unsafe-inline'`,
          },
          body: `<!doctype html><html><head>${extracted ? '<link rel="stylesheet" href="/app.css">' : ''}</head><body><test-app></test-app><div id="app"></div><script nonce="ui-script-test">window.styleViolations=[];document.addEventListener('securitypolicyviolation',e=>window.styleViolations.push(e.violatedDirective));${js}</script></body></html>`,
        });
      });
      await page.goto('http://ui-style.test/');
      const button = page.getByRole('button', {
        name: 'CSP action',
        exact: true,
      });
      try {
        await expect(button).toBeVisible();
      } catch (error) {
        throw new Error(errors.join('\n') + '\n' + String(error));
      }
      await expect(button).toHaveCSS('display', 'inline-flex');
      await button.focus();
      await expect(page.getByRole('tooltip')).toBeVisible();
      if (extracted)
        await expect(
          page.locator(
            'style[data-rv-component-styles],style[data-rv-tooltip-styles]',
          ),
        ).toHaveCount(0);
      else
        expect(
          await page
            .locator('style[data-rv-component-styles="base"]')
            .evaluate((style) => (style as HTMLStyleElement).nonce),
        ).toBe('ui-style-test');
      expect(
        await page.evaluate(() => (window as any).styleViolations),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
