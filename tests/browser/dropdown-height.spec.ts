import { expect, test, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { compileAsync } from 'sass-embedded';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
let css: string;
test.beforeAll(async () => {
  css = (
    await Promise.all(
      ['dropdown/editor-dropdown.style.scss', 'styles.scss'].map((path) =>
        compileAsync(resolve(root, 'package', path)),
      ),
    )
  )
    .map((result) => result.css)
    .join('\n');
});
async function mount(
  page: Page,
  options: {
    width?: number;
    height?: number;
    maxHeight?: number;
    custom?: boolean;
    selectedValue?: number;
    editable?: boolean;
    cssCap?: number;
    zoom?: number;
    topLayer?: boolean;
    resetBoxSizing?: boolean;
    visualHeight?: number;
    fieldWidth?: number;
    cssWidthCap?: number;
  } = {},
) {
  await page.setViewportSize({
    width: options.width ?? 390,
    height: options.height ?? 1000,
  });
  await page.setContent(
    `<style>${options.resetBoxSizing === false ? '' : '* { box-sizing: border-box; }'} body { margin: 0; } #field { position: absolute; top: 50px; left: 20px; width: 280px; height: 36px; } .revo-dropdown-menu.authored-cap { max-height: 180px; } *, *::before, *::after { animation: none !important; transition: none !important; }</style><div id="field"></div><output></output>`,
  );
  await page.addStyleTag({ content: css });
  if (options.cssCap)
    await page.addStyleTag({
      content: `.revo-dropdown-menu { --rv-dropdown-menu-max-height: ${options.cssCap}px; }`,
    });
  if (options.zoom)
    await page.addStyleTag({
      content: `html { zoom: ${options.zoom}; } body { min-height: 2400px; } #field { width: 130px; left: 10px; top: 15px; }`,
    });
  if (options.fieldWidth)
    await page.addStyleTag({
      content: `#field { width: ${options.fieldWidth}px; }`,
    });
  if (options.cssWidthCap)
    await page.addStyleTag({
      content: `.revo-dropdown-menu { --rv-dropdown-menu-max-width: ${options.cssWidthCap}px; }`,
    });
  const source = options.custom
    ? `
    import { h, render } from 'preact';
    import { DropdownPopup } from './package/dropdown/popup.tsx';
    const trigger = document.getElementById('field');
    render(h(DropdownPopup, { triggerRef: { current: trigger }, popupClassName: 'authored-cap', portalTarget: document.body }, h('div', { style: { minHeight: '900px' } }, 'Tall custom content')), document.createElement('div'));
  `
    : `
    import { h, render } from 'preact';
    import { Combobox, MultiSelect } from './package/pickers.tsx';
    import { useState } from 'preact/hooks';
    function App() {
    const [source,setSource] = useState(Array.from({length:100}, (_,i) => ({value:i,label:'Option '+i})));
    window.appendDropdownOption = () => setSource(current => [...current, {value:current.length,label:'Option '+current.length}]);
    return h(${options.editable ? 'MultiSelect' : 'Combobox'}, { ${options.selectedValue === undefined ? '' : `value:${options.editable ? '[' + options.selectedValue + ']' : options.selectedValue},`} source, config: { ariaLabel:'Options', search:true, topLayer:${!!options.topLayer}, ${options.editable ? 'autocomplete:true,' : ''} ${options.maxHeight === undefined ? '' : `maxHeight:${options.maxHeight},`} }, onChange: value => document.querySelector('output').textContent = String(value) });
    }
    render(h(App), document.getElementById('field'));
  `;
  const result = await build({
    stdin: { contents: source, resolveDir: root, loader: 'tsx' },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    loader: { '.scss': 'empty', '.svg': 'text' },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  await page.addScriptTag({ content: result.outputFiles[0].text });
  if (options.visualHeight)
    await page.evaluate(
      (height) =>
        Object.defineProperty(window.visualViewport!, 'height', {
          configurable: true,
          value: height,
        }),
      options.visualHeight,
    );
  if (!options.custom)
    await page.getByRole('combobox', { name: 'Options', exact: true }).click();
  await expect(page.locator('.revo-dropdown-menu')).toBeVisible();
}
for (const [width, height] of [
  [390, 1000],
  [1280, 900],
]) {
  test(`a long dropdown uses available device height at ${width}x${height}`, async ({
    page,
  }) => {
    await mount(page, { width, height });
    const menu = page.locator('.revo-dropdown-menu');
    await expect
      .poll(async () => (await menu.boundingBox())!.height)
      .toBeGreaterThan(450);
    const box = (await menu.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(height - 5);
    expect(box.height).toBeLessThanOrEqual(640);
  });
}
test('explicit numeric and authored CSS max heights remain effective', async ({
  page,
}) => {
  await mount(page, { maxHeight: 180 });
  expect(
    (await page.locator('.revo-dropdown-menu').boundingBox())!.height,
  ).toBeLessThanOrEqual(180);
  await mount(page, { cssCap: 190 });
  expect(
    (await page.locator('.revo-dropdown-menu').boundingBox())!.height,
  ).toBeLessThanOrEqual(190);
  await mount(page, { custom: true });
  expect(
    (await page.locator('.revo-dropdown-menu').boundingBox())!.height,
  ).toBeLessThanOrEqual(180);
});
test('keyboard bounds, result growth and native option scrolling remain stable', async ({
  page,
}) => {
  await mount(page);
  const menu = page.locator('.revo-dropdown-menu');
  const search = page.getByRole('textbox', {
    name: 'Search options',
    exact: true,
  });
  await search.fill('Option 99');
  await expect(page.getByRole('option')).toHaveCount(1);
  const short = (await menu.boundingBox())!.height;
  await search.fill('');
  await expect
    .poll(async () => (await menu.boundingBox())!.height)
    .toBeGreaterThan(short + 150);
  await page.evaluate(() => {
    Object.defineProperties(window.visualViewport!, {
      height: { configurable: true, value: 350 },
      offsetTop: { configurable: true, value: 20 },
    });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => {
      const box = (await menu.boundingBox())!;
      return box.y + box.height;
    })
    .toBeLessThanOrEqual(365);
  const list = page.locator('.dropdown-options');
  await list.evaluate((element) => (element.scrollTop = 700));
  const baseline = await menu.boundingBox();
  const samples = await page.evaluate(async () => {
    const menu = document.querySelector<HTMLElement>('.revo-dropdown-menu')!;
    const list = document.querySelector<HTMLElement>('.dropdown-options')!;
    const samples = [];
    for (let i = 0; i < 12; i++) {
      await new Promise(requestAnimationFrame);
      const box = menu.getBoundingClientRect();
      samples.push({
        top: box.top,
        height: box.height,
        scroll: list.scrollTop,
      });
    }
    return samples;
  });
  for (const sample of samples) {
    expect(sample.top).toBeCloseTo(baseline!.y, 0);
    expect(sample.height).toBeCloseTo(baseline!.height, 0);
    expect(sample.scroll).toBe(700);
  }
  await page.getByRole('option', { name: 'Option 99', exact: true }).click();
  await expect(page.locator('output')).toHaveText('99');
});

for (const editable of [false, true]) {
  test(`initial selected active option is visible on open (editable: ${editable})`, async ({
    page,
  }) => {
    await mount(page, { selectedValue: 90, editable });
    await expect
      .poll(async () =>
        page
          .getByRole('option', { name: 'Option 90', exact: true })
          .evaluate((option) => {
            const list = option
              .closest('.dropdown-options')!
              .getBoundingClientRect();
            const row = option.getBoundingClientRect();
            return row.top >= list.top && row.bottom <= list.bottom;
          }),
      )
      .toBe(true);
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(async () =>
        page
          .getByRole('option', { name: 'Option 91', exact: true })
          .evaluate((option) => {
            const list = option
              .closest('.dropdown-options')!
              .getBoundingClientRect();
            const row = option.getBoundingClientRect();
            return row.top >= list.top && row.bottom <= list.bottom;
          }),
      )
      .toBe(true);
  });
}

for (const withoutZoomAPI of [false, true]) {
  for (const topLayer of [false, true]) {
    test(`CSS zoom keeps the painted popup anchored inside the viewport (top layer: ${topLayer}, missing zoom API: ${withoutZoomAPI})`, async ({
      page,
    }) => {
      if (withoutZoomAPI)
        await page.evaluate(() =>
          Object.defineProperty(Element.prototype, 'currentCSSZoom', {
            configurable: true,
            value: undefined,
          }),
        );
      await mount(page, { width: 320, height: 800, zoom: 2, topLayer });
      const popup = page.locator('.revo-dropdown-menu');
      await expect
        .poll(async () => (await popup.boundingBox())!.width)
        .toBeLessThanOrEqual(310);
      const expectGeometry = async () => {
        const menu = (await popup.boundingBox())!;
        const trigger = (await page
          .getByRole('combobox', { name: 'Options', exact: true })
          .boundingBox())!;
        expect(menu.x).toBeGreaterThanOrEqual(5);
        expect(menu.x + menu.width).toBeLessThanOrEqual(315);
        expect(menu.y).toBeCloseTo(trigger.y + trigger.height + 4, 0);
        expect(menu.y + menu.height).toBeLessThanOrEqual(795);
      };
      await expectGeometry();
      await page.evaluate(() => window.scrollBy(0, 20));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(20);
      await expect(async () => await expectGeometry()).toPass();
    });
  }
}

test('a host without a global box-sizing reset respects caps and keyboard bounds', async ({
  page,
}) => {
  await mount(page, { maxHeight: 180, resetBoxSizing: false });
  const popup = page.locator('.revo-dropdown-menu');
  await expect
    .poll(async () => (await popup.boundingBox())!.height)
    .toBeLessThanOrEqual(180);
  await mount(page, { resetBoxSizing: false });
  await page.evaluate(() => {
    Object.defineProperties(window.visualViewport!, {
      height: { configurable: true, value: 240 },
      offsetTop: { configurable: true, value: 20 },
    });
    window.visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect
    .poll(async () => {
      const box = (await popup.boundingBox())!;
      return box.y + box.height;
    })
    .toBeLessThanOrEqual(255);
});

test('appending results preserves native list scroll under keyboard constraints', async ({
  page,
}) => {
  await mount(page, { width: 320, height: 800, visualHeight: 220 });
  const list = page.locator('.dropdown-options');
  await list.evaluate((element) => (element.scrollTop = element.scrollHeight));
  const before = await list.evaluate((element) => element.scrollTop);
  for (let count = 101; count <= 103; count++) {
    await page.evaluate(() =>
      (
        window as unknown as { appendDropdownOption: () => void }
      ).appendDropdownOption(),
    );
    await expect(page.getByRole('option')).toHaveCount(count);
    await page.evaluate(async () => {
      for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    });
    expect(await list.evaluate((element) => element.scrollTop)).toBe(before);
  }
});

test('editable popup matches a wide field while respecting explicit CSS and viewport width caps', async ({
  page,
}) => {
  await mount(page, { width: 390, editable: true, fieldWidth: 340 });
  const popup = page.locator('.revo-dropdown-menu');
  await expect.poll(async () => (await popup.boundingBox())!.width).toBe(340);
  await mount(page, {
    width: 390,
    editable: true,
    fieldWidth: 340,
    cssWidthCap: 260,
  });
  expect((await popup.boundingBox())!.width).toBe(260);
  await mount(page, { width: 320, editable: true, fieldWidth: 340 });
  const box = (await popup.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(310);
  expect(box.x + box.width).toBeLessThanOrEqual(315);
});
