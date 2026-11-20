import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { chromium } from '@playwright/test';

test('generated part styles stop at nested component roots', async () => {
  const source = await readFile(
    new URL('../package/presets/css.ts', import.meta.url),
    'utf8',
  );
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const { themeToCss } = await import(
    `data:text/javascript,${encodeURIComponent(code)}`
  );
  const css = themeToCss({
    version: 1,
    components: {
      Panel: {
        themed: {
          className: 'themed',
          styles: {
            parts: {
              root: { padding: '11px' },
              label: { color: 'rgb(255, 0, 0)' },
            },
          },
        },
      },
    },
  });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="themed" data-part="root" id="outer">
      <span data-part="label" id="own">Own</span>
      <div data-part="root" id="nested"><span data-part="label" id="nested-label">Nested</span></div>
    </div><div class="themed" data-part="popup"><span data-part="label" id="popup-label">Popup</span></div>`);
    const styles = await page.evaluate(() =>
      Object.fromEntries(
        ['outer', 'own', 'nested', 'nested-label', 'popup-label'].map((id) => {
          const style = getComputedStyle(document.getElementById(id));
          return [id, { padding: style.padding, color: style.color }];
        }),
      ),
    );
    assert.equal(styles.outer.padding, '11px');
    assert.equal(styles.nested.padding, '0px');
    assert.equal(styles.own.color, 'rgb(255, 0, 0)');
    assert.equal(styles['nested-label'].color, 'rgb(0, 0, 0)');
    assert.equal(styles['popup-label'].color, 'rgb(255, 0, 0)');
  } finally {
    await browser.close();
  }
});

test('calendar presets style days inside the composed month grid', async () => {
  const source = await readFile(
    new URL('../package/presets/css.ts', import.meta.url),
    'utf8',
  );
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const { themeToCss } = await import(
    `data:text/javascript,${encodeURIComponent(code)}`
  );
  const css = themeToCss({
    version: 1,
    components: {
      Calendar: {
        custom: {
          className: 'calendar-theme',
          styles: { parts: { day: { color: 'rgb(255, 0, 0)' } } },
        },
      },
    },
  });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="calendar-theme" data-part="picker"><div class="calendar-theme" data-part="root">
      <div data-part="root" data-preset-scope="inherit"><button data-part="day" id="day">12</button></div>
      <div data-part="root"><button data-part="day" id="nested-day">13</button></div>
    </div></div>`);
    assert.equal(
      await page.locator('#day').evaluate((el) => getComputedStyle(el).color),
      'rgb(255, 0, 0)',
    );
    assert.notEqual(
      await page
        .locator('#nested-day')
        .evaluate((el) => getComputedStyle(el).color),
      'rgb(255, 0, 0)',
    );
  } finally {
    await browser.close();
  }
});

test('preset roots, nested controls and composed parts stay scoped', async () => {
  const source = await readFile(
    new URL('../package/presets/css.ts', import.meta.url),
    'utf8',
  );
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const { themeToCss } = await import(
    `data:text/javascript,${encodeURIComponent(code)}`
  );
  const theme = {
    version: 1,
    components: {
      Panel: {
        p: {
          className: 'panel',
          styles: { parts: { track: { color: 'red' } } },
        },
      },
      ChoiceChips: {
        p: {
          className: 'chips',
          styles: { parts: { item: { color: 'red' } } },
        },
      },
      EditorListItem: {
        p: { className: 'row', styles: { parts: { label: { color: 'red' } } } },
      },
      Dropdown: {
        p: {
          className: 'dropdown-theme',
          styles: { root: { padding: '11px', '--brand': 'green' } },
        },
      },
      TextInput: {
        p: {
          className: 'field',
          styles: { parts: { root: { color: 'red' } } },
        },
      },
    },
  };
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${themeToCss(theme)}</style>
      <div class="panel" data-part="root"><button data-part="root"><span data-part="track" id="switch-track">Track</span></button></div>
      <div class="chips" data-part="root"><span data-part="root" data-preset-scope="inherit"><button data-part="item" id="item">Item</button></span></div>
      <div class="row" data-part="root"><span data-part="root" data-preset-scope="inherit"><span data-part="label" id="label">Label</span></span></div>
      <div class="dropdown-theme" data-part="root" id="dropdown"><div class="dropdown-theme" data-part="root" id="nested-dropdown"></div></div><div class="dropdown-theme" data-part="popup" data-preset-surface id="popup"></div>
      <input class="field" data-part="input" id="input">`);
    const style = (id, property) =>
      page
        .locator(`#${id}`)
        .evaluate((el, key) => getComputedStyle(el)[key], property);
    assert.notEqual(await style('switch-track', 'color'), 'rgb(255, 0, 0)');
    assert.equal(await style('item', 'color'), 'rgb(255, 0, 0)');
    assert.equal(await style('label', 'color'), 'rgb(255, 0, 0)');
    assert.equal(await style('dropdown', 'padding'), '11px');
    assert.equal(await style('nested-dropdown', 'padding'), '11px');
    assert.equal(await style('popup', 'padding'), '0px');
    assert.equal(
      await page
        .locator('#popup')
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--brand').trim(),
        ),
      'green',
    );
    assert.equal(await style('input', 'color'), 'rgb(255, 0, 0)');
  } finally {
    await browser.close();
  }
});
