import { expect, test } from '@playwright/test';
import { build } from 'esbuild';
import { compileAsync } from 'sass-embedded';
import { resolve } from 'node:path';

test('month labels and dividers follow action slots in both directions', async ({ page }) => {
  const root = resolve(import.meta.dirname, '../..');
  const styles = await Promise.all(['time-range-header', 'action-strip'].map((name) => compileAsync(resolve(root, `package/cell-visuals/${name}.style.scss`))));
  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({ content: styles.map((style) => style.css).join('\n') });
  const result = await build({ stdin: { resolveDir: root, loader: 'tsx', contents: `
    import { h, render } from 'preact';
    import { renderTimeRangeHeader } from './package/cell-visuals/time-range-header';
    import { renderActionStrip } from './package/cell-visuals/action-strip';
    render(h('div', {style:{width:'400px'}}, [
      renderTimeRangeHeader(h, ['Jan', 'Feb'], 'around', [25, 75]),
      renderActionStrip(h, {label:'Dates', items:[{label:'a'}, {label:'b'}, {label:'c', dividerBefore:true}, {label:'d'}], onActivate:()=>{}}),
    ]), document.getElementById('root'));
  ` }, bundle: true, write: false, format: 'iife', loader: { '.scss': 'empty' }, logLevel: 'silent' });
  await page.addScriptTag({ content: result.outputFiles[0].text });
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('#root').evaluate((root, value) => root.setAttribute('dir', value), direction);
    const header = page.locator('.rv-time-range-header small');
    const slots = page.locator('.rv-action-strip__item');
    for (let index = 0; index < 2; index++) {
      const label = (await header.nth(index).boundingBox())!;
      const first = (await slots.nth(index * 2).boundingBox())!;
      const second = (await slots.nth(index * 2 + 1).boundingBox())!;
      expect(Math.abs(label.x + label.width / 2 - (first.x + first.width / 2 + second.x + second.width / 2) / 2)).toBeLessThan(1);
    }
    const divider = await slots.nth(2).evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return { start: style.insetInlineStart, border: style.borderInlineStartWidth };
    });
    expect(divider).toEqual({ start: '-2px', border: '1px' });
  }
});
