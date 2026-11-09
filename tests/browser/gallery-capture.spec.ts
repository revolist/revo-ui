import { test, expect } from './gallery-test';
import { chooseOption } from './choose-option';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const output = resolve(
  import.meta.dirname,
  '../../.artifacts/visual-audit',
);

test.use({ galleryPdf: true });

test('capture every migrated component family across themes and widths', async ({
  page,
}) => {
  // Four viewport/theme combinations capture every family (84 screenshots today).
  test.setTimeout(180_000);
  await mkdir(output, { recursive: true });
  const captures: {
    file: string;
    family: string;
    theme: string;
    width: number;
    controls: number;
  }[] = [];
  await page.goto('/#components');
  await expect(page.locator('.catalog-section').first()).toBeVisible();
  for (const width of [1440, 390])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme,
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
      theme,
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
