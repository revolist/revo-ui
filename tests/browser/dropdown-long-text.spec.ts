import { expect, test, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { compileAsync } from 'sass-embedded';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const token = 'VeryLongUnbrokenIdentifier'.repeat(16);
const sentence =
  'Long readable option with descriptive details وصف تفصيلي طويل للخيار '.repeat(
    24,
  );
let css: string;
test.beforeAll(async () => {
  css = (
    await Promise.all(
      [
        'dropdown/editor-dropdown.style.scss',
        'styles.scss',
        'buttons/remove-button.style.scss',
      ].map((path) => compileAsync(resolve(root, 'package', path))),
    )
  )
    .map((result) => result.css)
    .join('\n');
});
async function mount(
  page: Page,
  mode: 'single' | 'multiple' | 'tags',
  width: number,
  custom = false,
  rtl = false,
  dark = false,
) {
  await page.setViewportSize({ width, height: 800 });
  await page.setContent(
    '<style>body{margin:16px;font-family:system-ui,sans-serif;background:var(--rv-ui-canvas);color:var(--rv-ui-text)}#field{width:100%;max-width:340px;height:36px}*,*::before,*::after{box-sizing:border-box;animation:none!important;transition:none!important}</style><div id="field"></div><output id="result" hidden></output>',
  );
  await page.evaluate((rtl) => {
    document.documentElement.dir = 'ltr';
    document.getElementById('field')!.dir = rtl ? 'rtl' : 'ltr';
  }, rtl);
  await page.evaluate(
    (dark) =>
      document.documentElement.setAttribute(
        'data-theme',
        dark ? 'dark' : 'light',
      ),
    dark,
  );
  await page.addStyleTag({ content: css });
  const source = `
    import { h, render } from 'preact';
    import { useState } from 'preact/hooks';
    import { Dropdown } from './package/dropdown/index.tsx';
    const options = ${JSON.stringify([
      { value: 'token', label: token },
      { value: 'sentence', label: sentence },
    ])};
    function App() {
      const [value, setValue] = useState(${mode === 'single' ? "'token'" : "['token']"});
      return h(Dropdown, { source: options, value, ${custom ? "renderValue: (h, option) => h('span', { className: 'custom-value' }, [h('span', {}, '● '), option.label])," : ''} className: '${mode === 'single' ? 'rv-select' : 'rv-multi-select'}',
        config: { ariaLabel: 'Long labels', multiSelect: ${mode !== 'single'}, ${mode === 'tags' ? 'tags: label => ({ value: label, label }),' : ''} },
        onChange: next => { setValue(next); document.getElementById('result').textContent = JSON.stringify(next); }
      });
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
}
for (const width of [280, 320, 390, 1280]) {
  for (const mode of ['single', 'multiple', 'tags'] as const) {
    test(`${mode} long labels preserve bounded controls and readable options at ${width}px`, async ({
      page,
    }, info) => {
      await mount(page, mode, width);
      const trigger = page.locator('.dropdown-trigger');
      const triggerBounds = (await trigger.boundingBox())!;
      expect(triggerBounds.width).toBeLessThanOrEqual(width - 32);
      expect(triggerBounds.height).toBeLessThanOrEqual(70);
      if (mode === 'single') {
        const label = page.locator('.selected-value > span');
        await expect(label).toHaveCount(1);
        await expect(label).toHaveText(token);
        await expect(label).toHaveCSS('text-overflow', 'ellipsis');
        expect(
          await label.evaluate(
            (element) => element.scrollWidth - element.clientWidth,
          ),
        ).toBeGreaterThan(0);
        expect((await label.boundingBox())!.width).toBeLessThan(
          triggerBounds.width,
        );
      }
      if (mode !== 'single') {
        const remove = page.getByRole('button', {
          name: `Remove ${token}`,
          exact: true,
        });
        const box = (await remove.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(triggerBounds.x);
        expect(box.x + box.width).toBeLessThanOrEqual(
          triggerBounds.x + triggerBounds.width,
        );
        await expect(remove).toBeVisible();
      }
      if (mode === 'tags') {
        const input = page.getByRole('combobox', { name: 'Long labels' });
        expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(40);
        await input.fill('test custom tag');
        await expect(page.locator('[data-create-option=true]')).toBeVisible();
        await input.press('Enter');
        await expect(page.locator('#result')).toContainText('test custom tag');
        const createdChip = page
          .getByRole('button', { name: 'Remove test custom tag', exact: true })
          .locator('..');
        expect((await createdChip.boundingBox())!.width).toBeGreaterThanOrEqual(
          80,
        );
        await expect(
          page.getByRole('button', {
            name: 'Remove test custom tag',
            exact: true,
          }),
        ).toBeVisible();
        await input.fill('');
      } else await trigger.click();
      const popup = page.locator('.revo-dropdown-menu');
      await expect(popup).toBeVisible();
      for (const label of [token, sentence]) {
        const option = page.getByRole('option', { name: label, exact: true });
        await expect(option).toBeAttached();
        if (mode !== 'single') {
          const checkbox = option.locator('input[type=checkbox]');
          const label = option.locator('.option-content > span');
          expect(
            Math.abs(
              (await checkbox.boundingBox())!.y -
                (await label.boundingBox())!.y,
            ),
          ).toBeLessThanOrEqual(5);
        }
        const overflow = await option.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        const rect = (await option.boundingBox())!;
        expect(rect.width).toBeLessThanOrEqual(width - 10);
      }
      expect(
        await popup.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (
        info.project.name === 'chromium' &&
        (width === 320 || (width === 1280 && mode === 'tags'))
      ) {
        await page.mouse.move(width - 2, 798);
        await page.screenshot({
          path: info.outputPath(`long-labels-${mode}-${width}.png`),
        });
      }
      await page.keyboard.press('Escape');
      if (mode !== 'single') {
        await page
          .getByRole('button', { name: `Remove ${token}`, exact: true })
          .click();
        await expect(page.locator('#result')).not.toContainText('token');
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    });
  }
}

test('RTL custom-rendered tags preserve removal, editing and oversized option scrolling', async ({
  page,
}, info) => {
  await mount(page, 'tags', 320, true, true);
  const trigger = page.locator('.dropdown-trigger');
  const remove = page.getByRole('button', {
    name: `Remove ${token}`,
    exact: true,
  });
  await expect(page.locator('.custom-value')).toHaveText(`● ${token}`);
  const field = (await trigger.boundingBox())!;
  const button = (await remove.boundingBox())!;
  expect(button.x).toBeGreaterThanOrEqual(field.x);
  expect(button.x + button.width).toBeLessThanOrEqual(field.x + field.width);
  const input = page.getByRole('combobox', { name: 'Long labels' });
  await input.fill('תגית מותאמת אישית');
  const creation = page.locator('[data-create-option=true]');
  await expect(creation).toBeVisible();
  await input.press('Enter');
  await expect(page.locator('#result')).toContainText('תגית מותאמת אישית');
  await input.fill('');
  const option = page.getByRole('option', { name: sentence, exact: true });
  const list = page.locator('.dropdown-options');
  await expect(page.locator('.revo-dropdown-menu')).toHaveCSS(
    'direction',
    'rtl',
  );
  await expect(page.locator('body')).toHaveCSS('direction', 'ltr');
  await expect(option).toBeAttached();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute(
    'aria-activedescendant',
    (await option.getAttribute('id')) ?? '',
  );
  await expect
    .poll(async () => {
      const active = (await option.boundingBox())!;
      const visible = (await list.boundingBox())!;
      return Math.abs(active.y - visible.y);
    })
    .toBeLessThanOrEqual(2);
  expect((await option.boundingBox())!.height).toBeGreaterThan(
    (await list.boundingBox())!.height,
  );
  await expect
    .poll(() =>
      list.evaluate((element) => element.scrollHeight - element.clientHeight),
    )
    .toBeGreaterThan(100);
  if (info.project.name === 'chromium') {
    await page.mouse.move(318, 798);
    await page.screenshot({
      path: info.outputPath('long-labels-rtl-custom-tags-320.png'),
    });
  }
  await list.evaluate((element) => (element.scrollTop = element.scrollHeight));
  const listBounds = (await list.boundingBox())!;
  const optionBounds = (await option.boundingBox())!;
  expect(optionBounds.y + optionBounds.height).toBeLessThanOrEqual(
    listBounds.y + listBounds.height + 2,
  );
  expect(
    await option.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await remove.focus();
  await remove.press('Enter');
  await expect(page.locator('#result')).not.toContainText('token');
});

test('dark mobile tags keep overflowing chips reachable and preserve the editable input', async ({
  page,
}, info) => {
  await mount(page, 'tags', 320, false, false, true);
  const input = page.getByRole('combobox', { name: 'Long labels' });
  for (const label of [
    'Readable skill',
    'Another long selected skill',
    'Last selected skill',
  ]) {
    await input.fill(label);
    await expect(page.locator('[data-create-option=true]')).toBeVisible();
    await input.press('Enter');
    await expect(page.locator('#result')).toContainText(label);
  }
  const chips = page.locator('.selected-values');
  expect(
    await chips.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    ),
  ).toBeGreaterThan(80);
  const lastRemove = page.getByRole('button', {
    name: 'Remove Last selected skill',
    exact: true,
  });
  await lastRemove.focus();
  const viewport = (await chips.boundingBox())!;
  const last = (await lastRemove.boundingBox())!;
  expect(last.x).toBeGreaterThanOrEqual(viewport.x);
  expect(last.x + last.width).toBeLessThanOrEqual(
    viewport.x + viewport.width + 1,
  );
  expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(40);
  await input.fill('A very long new skill to edit');
  await expect(input).toHaveValue('A very long new skill to edit');
  await expect(page.locator('[data-create-option=true]')).toBeVisible();
  if (info.project.name === 'chromium') {
    await page.mouse.move(318, 798);
    await page.screenshot({
      path: info.outputPath('long-labels-dark-tags-320.png'),
    });
  }
  await input.press('Escape');
  await lastRemove.focus();
  await lastRemove.press('Enter');
  await expect(page.locator('#result')).not.toContainText(
    'Last selected skill',
  );
});
