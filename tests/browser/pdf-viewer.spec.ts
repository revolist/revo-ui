import { chooseOption } from './choose-option';
import { createRequire } from 'node:module';

test.use({ gallerySections: ['pdf-viewer'], galleryPdf: true });
import { expect, test } from './gallery-test';
import { readFile } from 'node:fs/promises';

const primary = (page: import('@playwright/test').Page) =>
  page.locator('#pdf-viewer .rv-pdf-viewer').first();

test('renders PDF text, navigates pages, zooms, rotates and finds text', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(
    viewer.locator('.page[data-page-number="1"] canvas').first(),
  ).toBeVisible();
  await expect(viewer.locator('.textLayer')).toContainText([
    'A clearer view of your data',
  ]);
  await expect(viewer.locator('nav.rv-pagination')).toHaveCount(1);
  await expect(
    viewer.getByRole('button', { name: 'First page', exact: true }),
  ).toHaveCount(0);
  await expect(
    viewer.getByRole('button', { name: 'Last page', exact: true }),
  ).toHaveCount(0);
  await expect(
    viewer.getByRole('spinbutton', { name: 'Page', exact: true }),
  ).toHaveValue('1');
  await expect(
    viewer.getByRole('combobox', { name: 'Zoom', exact: true }),
  ).toHaveCSS('background-image', 'none');
  await viewer.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(
    viewer.getByRole('spinbutton', { name: 'Page', exact: true }),
  ).toHaveValue('2');
  await expect(
    viewer.locator('.page[data-page-number="2"] canvas').first(),
  ).toBeVisible();
  await chooseOption(
    viewer.getByRole('combobox', { name: 'Zoom', exact: true }),
    '150%',
  );
  await expect(viewer.locator('.page[data-page-number="2"]')).toHaveCSS(
    'width',
    '1224px',
  );
  await viewer.getByRole('button', { name: 'Rotate clockwise' }).click();
  await expect(viewer.locator('.page[data-page-number="2"]')).toHaveCSS(
    'width',
    '1584px',
  );
  await chooseOption(
    viewer.getByRole('combobox', { name: 'Zoom', exact: true }),
    'Fit page',
  );
  await viewer
    .getByRole('button', { name: 'Find in document', exact: true })
    .click();
  const input = viewer.getByRole('searchbox', {
    name: 'Find in document',
    exact: true,
  });
  await input.fill('RevoGrid');
  await expect(viewer.locator('.rv-pdf-viewer__matches')).toContainText(
    'matches',
  );
  await expect(viewer.locator('.highlight.selected').first()).toBeVisible();
  const before = await viewer.locator('.rv-pdf-viewer__matches').innerText();
  await viewer.getByRole('button', { name: 'Next match' }).click();
  await expect(viewer.locator('.rv-pdf-viewer__matches')).not.toHaveText(
    before,
  );
  await input.fill('no-such-text-12345');
  await expect(viewer.locator('.rv-pdf-viewer__matches')).toHaveText(
    'No matches',
  );
  await input.press('Escape');
  await expect(input).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('downloads original bytes, opens local PDFs, and recovers after an invalid file', async ({
  page,
}) => {
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  const downloadButton = viewer.getByRole('button', { name: 'Download PDF' });
  await expect(downloadButton).toBeEnabled();
  const downloadEvent = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('revogrid-product-brief.pdf');
  const buffer = await readFile((await download.path())!);
  expect(buffer.subarray(0, 8).toString()).toBe('%PDF-1.4');
  const file = viewer.locator('input[type="file"]');
  await file.setInputFiles({
    name: 'invalid.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not a PDF'),
  });
  await expect(viewer.getByRole('alert')).toContainText('Unable to display');
  await page.setViewportSize({ width: 390, height: 900 });
  const errorTitle = viewer.getByRole('alert').locator('.rv-alert__title');
  expect((await errorTitle.boundingBox())!.width).toBeGreaterThan(
    (await viewer.boundingBox())!.width - 110,
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(downloadButton).toBeDisabled();
  await file.setInputFiles({
    name: 'local-report.pdf',
    mimeType: 'application/pdf',
    buffer,
  });
  await expect(viewer.locator('.rv-pdf-viewer__filename')).toHaveText(
    'local-report.pdf',
  );
  await expect(
    viewer.locator('.page[data-page-number="1"] canvas').first(),
  ).toBeVisible();
  await expect(viewer.getByRole('alert')).toHaveCount(0);
  const empty = page.locator('#pdf-viewer .rv-pdf-viewer').nth(1);
  await expect(empty).toContainText('Open a PDF to get started');
  await expect(
    empty.getByRole('button', { name: 'Zoom in', exact: true }),
  ).toHaveCount(0);
  await expect(
    empty.getByRole('button', { name: 'Zoom out', exact: true }),
  ).toHaveCount(0);
  await expect(empty.locator('.rv-pdf-viewer__page-count')).toHaveCount(0);
  await empty
    .locator('input[type="file"]')
    .setInputFiles({ name: 'second.pdf', mimeType: 'application/pdf', buffer });
  await expect(
    empty.getByRole('spinbutton', { name: 'Page', exact: true }),
  ).toHaveValue('1');
  const zoom = empty.getByRole('combobox', { name: 'Zoom', exact: true });
  await zoom.click();
  const choices = page.locator(
    `[id="${await zoom.getAttribute('aria-controls')}"]`,
  );
  await expect(choices.getByRole('option')).toHaveText([
    'Fit width',
    'Fit page',
    '100%',
    '200%',
  ]);
  await zoom.press('Escape');
  await empty.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(
    empty.getByRole('spinbutton', { name: 'Page', exact: true }),
  ).toHaveValue('2');
  await expect(
    viewer.getByRole('spinbutton', { name: 'Page', exact: true }),
  ).toHaveValue('1');
});

test('prepares every page before opening print', async ({ page }) => {
  const printed: number[] = [];
  await page.exposeFunction('recordPdfPrint', (count: number) =>
    printed.push(count),
  );
  await page.addInitScript(() => {
    window.print = () => {
      (
        window.parent as Window & { recordPdfPrint: (count: number) => void }
      ).recordPdfPrint(document.querySelectorAll('canvas').length);
      window.dispatchEvent(new Event('afterprint'));
    };
    window.focus = () => {};
  });
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(viewer.getByRole('button', { name: 'Print PDF' })).toBeEnabled();
  await viewer.getByRole('button', { name: 'Print PDF' }).click();
  await expect.poll(() => printed).toEqual([3]);
  await expect(page.locator('iframe[title="PDF print document"]')).toHaveCount(
    0,
  );
});

test('keeps controls inside the viewer on mobile in light and dark themes', async ({
  page,
}, info) => {
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(
    viewer.getByRole('button', { name: 'Download PDF' }),
  ).toBeEnabled();
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await expect(
        viewer.locator('.page[data-page-number="1"] canvas').first(),
      ).toBeVisible();
      expect(
        await viewer.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await viewer.screenshot({
        path: info.outputPath(`pdf-viewer-${width}-${theme}.png`),
      });
    }
  }
});

test('preserves keyboard focus when closing search and committing page edits', async ({
  page,
}) => {
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  const find = viewer.getByRole('button', {
    name: 'Find in document',
    exact: true,
  });
  await expect(find).toBeEnabled();
  await find.click();
  const search = viewer.getByRole('searchbox', {
    name: 'Find in document',
    exact: true,
  });
  await expect(search).toBeFocused();
  await expect(search).toHaveAttribute('placeholder', 'Find in document');
  await viewer.locator('.rv-pdf-viewer__viewport').focus();
  await page.keyboard.press('Control+f');
  await expect(search).toBeFocused();
  await search.press('Escape');
  await expect(find).toBeFocused();
  await viewer.getByRole('button', { name: 'Next page', exact: true }).click();
  const number = viewer.getByRole('spinbutton', { name: 'Page', exact: true });
  await expect(number).toHaveValue('2');
  await number.fill('');
  await number.press('Enter');
  await expect(number).toHaveValue('2');
  await expect(number).toBeFocused();
  await number.fill('999');
  await number.press('Enter');
  await expect(number).toHaveValue('3');
  await expect(number).toBeFocused();
  await number.fill('1');
  await number.press('Escape');
  await expect(number).toHaveValue('3');
});

test('keeps the mobile toolbar compact and the search field usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  const find = viewer.getByRole('button', {
    name: 'Find in document',
    exact: true,
  });
  await expect(find).toBeEnabled();
  const toolbar = viewer.getByRole('toolbar', { name: 'PDF tools' });
  expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(140);
  await find.click();
  const input = viewer.getByRole('searchbox', {
    name: 'Find in document',
    exact: true,
  });
  const available = (await viewer.boundingBox())!.width;
  expect((await input.boundingBox())!.width).toBeGreaterThan(available - 70);
  const more = viewer.getByRole('button', {
    name: 'More PDF tools',
    exact: true,
  });
  await more.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'More PDF tools', exact: true });
  await expect(
    menu.getByRole('menuitem', { name: 'Rotate clockwise', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    menu.getByRole('menuitem', { name: 'Download PDF', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(more).toBeFocused();
});

test('has no automated WCAG violations in the viewer and its mobile tools', async ({
  page,
}) => {
  const require = createRequire(
    new URL('../../package.json', import.meta.url),
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  const find = viewer.getByRole('button', {
    name: 'Find in document',
    exact: true,
  });
  await expect(find).toBeEnabled();
  await find.click();
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await viewer
      .getByRole('button', { name: 'More PDF tools', exact: true })
      .click();
    // Audit the settled theme and menu, after their real CSS transitions finish.
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.effect?.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    const results = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
      return axe.run(
        {
          include: [
            '#pdf-viewer',
            '[role="menu"][aria-label="More PDF tools"]',
          ],
        },
        {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
          },
        },
      );
    });
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.keyboard.press('Escape');
  }
});

test('keeps mobile tools in the viewer direction and scoped theme', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(
    viewer.getByRole('button', { name: 'More PDF tools', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('switch', { name: 'Right to left', exact: true })
    .click();
  await page.addStyleTag({
    content: '.rv-pdf-viewer { --rv-ui-surface-elevated: rgb(12, 34, 56); }',
  });
  await viewer
    .getByRole('button', { name: 'More PDF tools', exact: true })
    .click();
  const menu = page.getByRole('menu', { name: 'More PDF tools', exact: true });
  await expect(menu).toHaveCSS('direction', 'rtl');
  await expect(menu).toHaveCSS('background-color', 'rgb(12, 34, 56)');
});

test('reports a failed worker script instead of keeping the document in loading', async ({
  page,
}) => {
  await page.route('**/pdf.worker.min-*.mjs', (route) => route.abort('failed'));
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(viewer.getByRole('alert')).toContainText(
    'Check the document and try again.',
  );
  await expect(viewer.locator('.rv-pdf-viewer__body')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(
    viewer.getByRole('button', { name: 'Retry', exact: true }),
  ).toBeVisible();
  await expect(
    viewer.getByRole('button', { name: 'Download PDF', exact: true }),
  ).toBeDisabled();
  await page.unroute('**/pdf.worker.min-*.mjs');
  await viewer.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    viewer.locator('.page[data-page-number="1"] canvas').first(),
  ).toBeVisible();
  await expect(viewer.getByRole('alert')).toHaveCount(0);
});

test('keeps PDF toolbar controls and icons uniformly sized and centered', async ({
  page,
}, info) => {
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  await expect(
    viewer.getByRole('button', { name: 'Find in document', exact: true }),
  ).toBeEnabled();
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const geometry = await viewer
      .getByRole('toolbar', { name: 'PDF tools' })
      .evaluate((toolbar) => {
        const controls = [
          ...toolbar.querySelectorAll<HTMLElement>('button, input, select'),
        ].filter((element) => element.getBoundingClientRect().width > 0);
        const icons = [
          ...toolbar.querySelectorAll<SVGElement>('.rv-svg-icon > svg'),
        ].filter((element) => element.getBoundingClientRect().width > 0);
        return {
          controls: controls.map((element) => ({
            height: element.getBoundingClientRect().height,
            font: getComputedStyle(element).fontSize,
          })),
          icons: icons.map((element) => {
            const rect = element.getBoundingClientRect();
            const owner = element
              .closest('button, .rv-pdf-viewer__zoom-select')!
              .getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              centerOffset: Math.abs(
                rect.y + rect.height / 2 - owner.y - owner.height / 2,
              ),
            };
          }),
        };
      });
    geometry.controls.forEach((control) => {
      expect(control.height).toBe(32);
      expect(control.font).toBe('14px');
    });
    geometry.icons.forEach((icon) => {
      expect(icon.width).toBe(14);
      expect(icon.height).toBe(14);
      expect(icon.centerOffset).toBeLessThanOrEqual(0.5);
    });
    await viewer.screenshot({
      path: info.outputPath(`pdf-toolbar-aligned-${width}.png`),
    });
    await viewer
      .getByRole('toolbar', { name: 'PDF tools' })
      .screenshot({ path: info.outputPath(`pdf-toolbar-strip-${width}.png`) });
  }
});

test('dismisses command tooltips after activation while preserving focus', async ({
  page,
}, info) => {
  await page.goto('/?section=pdf-viewer#pdf-viewer');
  const viewer = primary(page);
  const rotate = viewer.getByRole('button', {
    name: 'Rotate clockwise',
    exact: true,
  });
  await expect(rotate).toBeEnabled();
  const tooltip = rotate.locator('.rv-control-tooltip');
  await rotate.hover();
  await expect(tooltip).toBeVisible();
  await rotate.click();
  await expect(rotate).toBeFocused();
  await expect(tooltip).toBeHidden();
  await viewer
    .getByRole('toolbar', { name: 'PDF tools' })
    .screenshot({ path: info.outputPath('tooltip-dismissed.png') });
  // Leaving and re-entering exposes the label again, even while the button keeps focus.
  await page.mouse.move(0, 0);
  await rotate.hover();
  await expect(tooltip).toBeVisible();
  await rotate.press('Escape');
  await expect(tooltip).toBeHidden();
  await rotate.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(rotate).toBeFocused();
  await expect(tooltip).toBeVisible();
  await rotate.press('Enter');
  await expect(tooltip).toBeHidden();
  await expect(rotate).toBeFocused();
});

test('does not leave a command tooltip open after a touch tap', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1280, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/?section=pdf-viewer#pdf-viewer');
    const viewer = primary(page);
    const rotate = viewer.getByRole('button', {
      name: 'Rotate clockwise',
      exact: true,
    });
    await expect(rotate).toBeEnabled();
    const before = await viewer
      .locator('.page[data-page-number="1"]')
      .boundingBox();
    await rotate.tap();
    await expect(rotate.locator('.rv-control-tooltip')).toBeHidden();
    await expect
      .poll(
        async () =>
          (await viewer.locator('.page[data-page-number="1"]').boundingBox())
            ?.height,
      )
      .not.toBe(before?.height);
  } finally {
    await context.close();
  }
});
