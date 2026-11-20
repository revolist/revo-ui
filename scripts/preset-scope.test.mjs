import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { chromium } from '@playwright/test';

test('generated part styles stop at nested component roots', async () => {
  const source = await readFile(new URL('../package/presets/css.ts', import.meta.url), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  const { themeToCss } = await import(`data:text/javascript,${encodeURIComponent(code)}`);
  const css = themeToCss({ version: 1, components: { Panel: { themed: {
    className: 'themed', styles: { parts: {
      root: { padding: '11px' }, label: { color: 'rgb(255, 0, 0)' },
    } },
  } } } });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="themed" data-part="root" id="outer">
      <span data-part="label" id="own">Own</span>
      <div data-part="root" id="nested"><span data-part="label" id="nested-label">Nested</span></div>
    </div>`);
    const styles = await page.evaluate(() => Object.fromEntries(
      ['outer', 'own', 'nested', 'nested-label'].map((id) => {
        const style = getComputedStyle(document.getElementById(id));
        return [id, { padding: style.padding, color: style.color }];
      }),
    ));
    assert.equal(styles.outer.padding, '11px');
    assert.equal(styles.nested.padding, '0px');
    assert.equal(styles.own.color, 'rgb(255, 0, 0)');
    assert.equal(styles['nested-label'].color, 'rgb(0, 0, 0)');
  } finally {
    await browser.close();
  }
});
