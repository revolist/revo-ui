import { expect, test, type Locator, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { compileAsync } from 'sass-embedded';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
let css: string;
test.beforeAll(async () => {
  const styles = [
    'dropdown/editor-dropdown.style.scss',
    'styles.scss',
    'core/editor-popup.scss',
    'date-time/style.scss',
  ];
  css = (
    await Promise.all(
      styles.map((path) => compileAsync(resolve(root, 'package', path))),
    )
  )
    .map((result) => result.css)
    .join('\n');
});

async function bundle(contents: string) {
  const result = await build({
    stdin: { contents, resolveDir: root, loader: 'tsx' },
    bundle: true,
    write: false,
    format: 'iife',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    loader: { '.scss': 'empty', '.svg': 'text' },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

async function scrolledDialog(page: Page, source: string) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(
    `<style>body { margin: 0; height: 2400px; } dialog { position: fixed; top: 120px; margin: 0 auto; width: 340px; height: 620px; box-sizing: border-box; overflow: auto; } #field { margin-top: 200px; height: 32px; } .spacer { height: 600px; } *, *::before, *::after { animation: none !important; transition: none !important; }</style><dialog><div id="field"></div><div class="spacer"></div><output id="result"></output></dialog>`,
  );
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: await bundle(source) });
  await page.evaluate(() => {
    window.scrollTo(0, 500);
    document.querySelector('dialog')!.showModal();
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(500);
}

async function expectAnchored(trigger: Locator, popup: Locator, gap = 4) {
  await expect(popup).toBeVisible();
  await expect
    .poll(async () => {
      const anchor = (await trigger.boundingBox())!;
      const menu = (await popup.boundingBox())!;
      return Math.min(
        Math.abs(menu.y - anchor.y - anchor.height - gap),
        Math.abs(anchor.y - menu.y - menu.height - gap),
      );
    })
    .toBeLessThanOrEqual(2);
}

for (const [component, topLayer] of [
  ['MultiSelect', true],
  ['MultiSelect', false],
  ['Combobox', true],
  ['Dropdown', true],
] as const) {
  test(`${component} stays beside its trigger after page and dialog scroll (top layer: ${topLayer})`, async ({
    page,
  }) => {
    await scrolledDialog(
      page,
      `
      import { h, render } from 'preact';
      import { MultiSelect, Combobox } from './package/pickers.tsx';
      import { Dropdown } from './package/dropdown/index.tsx';
      render(h(${component}, {
        source: ['Maya Chen', 'Leo Martins', 'Ava Thompson', 'Noah Brooks', 'Nina Patel'].map(label => ({ value: label, label })),
        value: [],
        className: 'rv-combobox',
        config: { ariaLabel: 'Resources', search: true, topLayer: ${topLayer}, portalTarget: document.querySelector('dialog') },
        onChange: value => { document.getElementById('result').textContent = String(value); }
      }), document.getElementById('field'));
    `,
    );
    const trigger = page.getByRole('combobox', { name: 'Resources' });
    const popup = page.locator('.revo-dropdown-menu');
    await trigger.click();
    await expectAnchored(trigger, popup);
    await page.locator('dialog').evaluate((element) => {
      element.scrollTop = 100;
    });
    await expectAnchored(trigger, popup);
    await page.keyboard.press('Escape');
    await trigger.click();
    await expectAnchored(trigger, popup);
    await page.getByRole('option', { name: 'Maya Chen' }).click();
    await expect(page.locator('#result')).toContainText('Maya Chen');
  });
}

for (const kind of ['date', 'time', 'datetime']) {
  test(`${kind} picker and nested calendar dropdowns follow a scrolled dialog`, async ({
    page,
  }) => {
    await scrolledDialog(
      page,
      `
      import { h, render } from 'preact';
      import { DateTimeField } from './package/date-time/field.tsx';
      render(h(DateTimeField, {
        kind: '${kind}', value: '${kind === 'time' ? '15:45' : kind === 'date' ? '2026-01-02' : '2026-01-02T15:45'}',
        picker: { calendar: { captionLayout: 'dropdown' } },
        onValueChange: value => { document.getElementById('result').textContent = value; }
      }), document.getElementById('field'));
    `,
    );
    const trigger = page.locator('#field button');
    const popup = page.locator('.rv-editor-popup');
    await trigger.click();
    // Large date/time compositions may overlap their anchor to fit the viewport.
    const expectInViewport = async () => {
      await expect(popup).toBeVisible();
      await expect
        .poll(async () => {
          const box = (await popup.boundingBox())!;
          return (
            box.y >= 5 &&
            box.y + box.height <= 844 &&
            box.x >= 0 &&
            box.x + box.width <= 390
          );
        })
        .toBe(true);
    };
    await expectInViewport();
    const before = (await popup.boundingBox())!;
    await page.locator('dialog').evaluate((element) => {
      element.scrollTop += 40;
    });
    await expectInViewport();
    if (kind === 'time') await expectAnchored(trigger, popup);
    else {
      for (const name of ['Choose month', 'Choose year']) {
        const caption = popup.getByRole('combobox', { name, exact: true });
        await caption.click();
        const menu = page.locator('.revo-dropdown-menu');
        await expectAnchored(caption, menu);
        await page.keyboard.press('Escape');
      }
    }
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await trigger.click();
    await expectInViewport();
    expect(before.height).toBeGreaterThan(50);
  });
}

for (const overlay of ['popover', 'tooltip']) {
  test(`${overlay} remains anchored after page and dialog scroll`, async ({
    page,
  }) => {
    await scrolledDialog(
      page,
      `
      import { PopoverController, TooltipController } from './package/core/popover-controller.tsx';
      const anchor = document.createElement('button');
      anchor.textContent = 'Show overlay';
      document.getElementById('field').append(anchor);
      if ('${overlay}' === 'popover') {
        const controller = new PopoverController();
        anchor.onclick = () => {
          const content = document.createElement('div');
          content.id = 'overlay';
          content.textContent = 'Overlay content';
          content.style.cssText = 'width:180px;height:60px;background:white';
          controller.open({ anchor, content, appendTo: document.querySelector('dialog') });
        };
      } else {
        const controller = new TooltipController();
        controller.bind(anchor, 'Overlay content', { delay: 0, hideOnScroll: false });
      }
    `,
    );
    const trigger = page.getByRole('button', { name: 'Show overlay' });
    const popup =
      overlay === 'popover'
        ? page.locator('#overlay')
        : page.getByRole('tooltip');
    if (overlay === 'popover') await trigger.click();
    else await trigger.focus();
    const anchored = async () => {
      await expect(popup).toBeVisible();
      await expect
        .poll(async () => {
          const anchor = (await trigger.boundingBox())!;
          const box = (await popup.boundingBox())!;
          return Math.min(
            Math.abs(box.y - anchor.y - anchor.height),
            Math.abs(anchor.y - box.y - box.height),
          );
        })
        .toBeLessThanOrEqual(12);
    };
    await anchored();
    await page.locator('dialog').evaluate((element) => {
      element.scrollTop = 80;
    });
    await anchored();
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
  });
}

test('shared dialog stays centered when opened after page scroll and after scrolling again', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(
    '<style>body { height:2400px; } *, *::before, *::after { animation:none !important; }</style><button id="open">Open dialog</button>',
  );
  await page.addStyleTag({ content: css });
  await page.addScriptTag({
    content: await bundle(`
    import { DialogController } from './package/surfaces.tsx';
    const controller = new DialogController(document);
    document.getElementById('open').onclick = () => {
      const dialog = controller.open({ title: 'Edit event', closeLabel: 'Close' });
      dialog.body.textContent = 'Event details';
    };
  `),
  });
  await page.evaluate(() => {
    window.scrollTo(0, 500);
    document.getElementById('open')!.click();
  });
  const dialog = page.locator('.rv-dialog__surface');
  const centered = async () => {
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!;
        return Math.abs(box.y + box.height / 2 - 422);
      })
      .toBeLessThanOrEqual(2);
  };
  await centered();
  await page.evaluate(() => window.scrollTo(0, 700));
  await centered();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
});

for (const [topLayer, motion] of [
  [true, false],
  [false, false],
  [true, true],
  [false, true],
] as const) {
  test(`dropdown first visible frame already has its settled position (top layer: ${topLayer}, motion: ${motion})`, async ({
    page,
  }) => {
    await scrolledDialog(
      page,
      `
      import { h, render } from 'preact';
      import { MultiSelect } from './package/pickers.tsx';
      render(h(MultiSelect, {
        source: Array.from({length: 12}, (_, index) => ({ value: index, label: 'Resource ' + index })),
        value: [],
        config: { ariaLabel: 'Resources', topLayer: ${topLayer}, maxHeight: 360, portalTarget: document.querySelector('dialog') },
        onChange: () => {}
      }), document.getElementById('field'));
      document.getElementById('field').style.marginTop = '420px';
    `,
    );
    if (motion) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page
        .locator('style')
        .first()
        .evaluate((style) => {
          style.textContent = style.textContent!.replace(
            '*, *::before, *::after { animation: none !important; transition: none !important; }',
            '',
          );
        });
    }
    const trigger = page.getByRole('combobox', { name: 'Resources' });
    await trigger.evaluate((element) => {
      element.addEventListener(
        'click',
        () => {
          (window as any).openingFrames = new Promise((resolve) => {
            const visible: { left: number; top: number; opacity: number }[] =
              [];
            let frames = 0;
            const sample = () => {
              const popup = document.querySelector<HTMLElement>(
                '.revo-dropdown-menu',
              );
              if (popup) {
                const style = getComputedStyle(popup);
                if (
                  style.display !== 'none' &&
                  style.visibility === 'visible' &&
                  Number(style.opacity) > 0
                ) {
                  const rect = popup.getBoundingClientRect();
                  visible.push({
                    left: rect.left,
                    top: rect.top,
                    opacity: Number(style.opacity),
                  });
                }
              }
              if (++frames < 20) requestAnimationFrame(sample);
              else resolve(visible);
            };
            requestAnimationFrame(sample);
          });
        },
        { capture: true, once: true },
      );
    });
    await trigger.click();
    const frames = (await page.evaluate(
      () => (window as any).openingFrames,
    )) as { left: number; top: number; opacity: number }[];
    expect(frames.length).toBeGreaterThan(2);
    if (motion) expect(frames.some((frame) => frame.opacity < 0.99)).toBe(true);
    const settled = frames.at(-1)!;
    expect(settled.top).toBeGreaterThan(100);
    expect(
      Math.max(...frames.map((frame) => Math.abs(frame.top - settled.top))),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.max(...frames.map((frame) => Math.abs(frame.left - settled.left))),
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.revo-dropdown-menu')).toHaveCount(0);
  });
}
