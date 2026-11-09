import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const output = resolve(
  import.meta.dirname,
  '../../.artifacts/visual-audit',
);

test('capture every migrated component family across themes and widths', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await mkdir(output, { recursive: true });
  const captures: {
    file: string;
    family: string;
    theme: string;
    width: number;
    controls: number;
  }[] = [];
  await page.goto('/#components');
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      for (const section of await page.locator('.catalog-section').all()) {
        const id = (await section.getAttribute('id'))!;
        const family = await section
          .locator('.catalog-section-heading h2')
          .innerText();
        const file = `${width}-${theme}-${id}.png`;
        await section.screenshot({
          path: resolve(output, file),
          animations: 'disabled',
          style:
            '.catalog-topbar, .catalog-skip { visibility: hidden !important; }',
        });
        const overflow = await section.evaluate((node) =>
          [...node.querySelectorAll<HTMLElement>('.catalog-example')]
            .map((card) => ({
              title: card.querySelector('h3')?.textContent,
              scroll: card.scrollWidth,
              width: card.clientWidth,
            }))
            .filter((card) => card.scroll > card.width + 1),
        );
        expect(overflow, `${width} ${theme} ${family}`).toEqual([]);
        captures.push({
          file,
          family,
          theme,
          width,
          controls: await section.locator('.catalog-example').count(),
        });
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
  await writeFile(
    resolve(output, 'gallery-manifest.json'),
    JSON.stringify(captures, null, 2),
  );
  await writeFile(
    resolve(output, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Shared UI migration visual audit</title><style>body{font:14px system-ui;background:#eee;color:#222;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}article{background:white;padding:16px;border-radius:12px}img{width:100%;height:auto}h1{font-size:24px}</style><h1>Shared UI migration visual audit · 24 October 2026</h1><p>Current-run rendered evidence. Each family includes all its component cards. Open product/overlay evidence is recorded separately.</p><main>${captures.map((c) => `<article><h2>${c.family}</h2><p>${c.theme} · ${c.width}px · ${c.controls} cards</p><a href="${c.file}"><img loading="lazy" src="${c.file}" alt="${c.family}, ${c.theme}, ${c.width}px"></a></article>`).join('')}</main>`,
  );
});

test('migrated controls retain readable content and disabled cues in compact cards', async ({
  page,
}) => {
  await page.goto('/#components');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  await expect(
    page.locator('.rv-resource-picker__details em').first(),
  ).toHaveCSS('color', 'rgb(163, 163, 163)');
  const tag = page.locator('.rv-multi-select .selected-tag');
  const contrast = await tag.evaluate((node) => {
    const c = getComputedStyle(node);
    const luminance = (value: string) =>
      value
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const a = luminance(c.color),
      b = luminance(c.backgroundColor);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect
    .soft(contrast, 'multi-select tag text contrast')
    .toBeGreaterThanOrEqual(4.5);
  const dateInputs = page.locator('.rv-date-range-picker input');
  for (const input of await dateInputs.all())
    expect
      .soft(
        (await input.boundingBox())!.width,
        'native date text and calendar indicator fit',
      )
      .toBeGreaterThanOrEqual(170);
  const clipped = await page
    .locator('.rv-time-grid__hour')
    .evaluateAll(
      (nodes) =>
        nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).length,
    );
  expect.soft(clipped, 'hour labels are not clipped').toBe(0);
  const disabledRadio = page
    .getByRole('group', { name: 'View', exact: true })
    .getByRole('radio', { name: 'Calendar', exact: true });
  expect
    .soft(
      await disabledRadio
        .locator('..')
        .evaluate((node) => Number(getComputedStyle(node).opacity)),
      'disabled choice label is visually muted',
    )
    .toBeLessThan(1);
  await expect
    .soft(page.locator('.rv-pagination-panel > span').last())
    .toHaveCSS('white-space', 'nowrap');
  const form = page.locator('#inputs-and-forms .catalog-example').first();
  const field = await form.locator('.rv-field').boundingBox();
  const content = await form.locator('.catalog-specimen').evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      width:
        node.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
    };
  });
  expect
    .soft(field!.width / content!.width, 'field fills its card content')
    .toBeGreaterThan(0.95);
});

test('capture open picker and overlay states in both themes', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await mkdir(resolve(output, 'overlays'), { recursive: true });
  await page.goto('/#components');
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({
      width: theme === 'light' ? 1280 : 390,
      height: 900,
    });
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    const capture = async (name: string) =>
      page.screenshot({
        path: resolve(output, 'overlays', `${theme}-${name}.png`),
        animations: 'disabled',
      });
    await page
      .getByRole('combobox', { name: 'Searchable view', exact: true })
      .click();
    await expect(page.locator('.revo-dropdown-menu')).toBeVisible();
    await capture('combobox');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^Accent:/ }).click();
    await expect(
      page.getByRole('radiogroup', { name: 'Accent' }),
    ).toBeVisible();
    if (theme === 'dark')
      await expect(page.locator('.rv-format-color-picker__popover')).toHaveCSS(
        'background-color',
        'rgb(38, 38, 38)',
      );
    await capture('color-picker');
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Choose due date', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Due date', exact: true }),
    ).toBeVisible();
    await capture('date-picker');
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Choose date range', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Project dates', exact: true }),
    ).toBeVisible();
    await capture('date-range');
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Open dialog', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Edit project', exact: true }),
    ).toBeVisible();
    if (theme === 'dark') {
      await expect(
        page
          .getByRole('dialog', { name: 'Edit project', exact: true })
          .locator('.rv-dialog__surface'),
      ).toHaveCSS('background-color', 'rgb(38, 38, 38)');
      await expect(
        page.getByRole('dialog', { name: 'Edit project', exact: true }),
      ).toHaveCSS('color', 'rgb(245, 245, 245)');
    }
    await capture('dialog');
    await page
      .getByRole('button', { name: 'Open nested confirmation' })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Confirm changes' }),
    ).toBeVisible();
    await capture('nested-confirmation');
    await page
      .getByRole('dialog', { name: 'Confirm changes', exact: true })
      .getByRole('button', { name: 'Cancel', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Confirm changes', exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('dialog', { name: 'Edit project', exact: true })
      .getByRole('button', { name: 'Close editor', exact: true })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Edit project', exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Open popover', exact: true })
      .click();
    await expect(
      page.getByRole('textbox', { name: 'Popover input' }),
    ).toBeVisible();
    await capture('popover');
    await page.keyboard.press('Escape');
  }
});

test('accent text and native range controls adapt to dark surfaces', async ({
  page,
}) => {
  await page.goto('/#components');
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  for (const selector of [
    '.rv-option-button[aria-pressed="true"]',
    '.brush-range__selection',
  ]) {
    const contrast = () =>
      page.locator(selector).evaluate((node) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        const lum = (color: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const rgb = [...ctx.getImageData(0, 0, 1, 1).data]
            .slice(0, 3)
            .map((v) => {
              v /= 255;
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            });
          return rgb.reduce(
            (sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i],
            0,
          );
        };
        const a = lum(getComputedStyle(node).color),
          b = lum(
            getComputedStyle(node.closest('.catalog-example')!).backgroundColor,
          );
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    await expect
      .poll(contrast, { message: selector })
      .toBeGreaterThanOrEqual(4.5);
  }
  await expect
    .soft(page.getByRole('slider', { name: 'Compact slider', exact: true }))
    .toHaveCSS('color-scheme', 'dark');
});
