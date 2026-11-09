import { chooseOption } from './choose-option';
import { expect, test, type Page } from './gallery-test';

test.use({ gallerySections: ['html-editor'] });

async function setDarkTheme(page: Page) {
  await chooseOption(
    page.getByRole('button', { name: 'Theme', exact: true }),
    'Dark',
  );
  const options = page.getByRole('button', {
    name: 'More gallery options',
    exact: true,
  });
  if (
    (await options.isVisible()) &&
    (await options.getAttribute('aria-expanded')) === 'true'
  )
    await page.keyboard.press('Escape');
}

for (const width of [1280, 390]) {
  test(`standalone HTML editor saves sanitized HTML and cancels drafts at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/components/editors/');
    await expect(page).toHaveURL(/\/components\/html-editor\//);
    await expect(
      page.getByRole('heading', { name: 'HTML Rich Text Editor' }),
    ).toBeVisible();
    await expect(page.locator('revo-grid')).toHaveCount(0);
    const initialHtml = await page.getByLabel('Saved HTML').textContent();
    expect(initialHtml).toContain(
      '<blockquote>\n  <p>Focus on the next useful step.</p>\n</blockquote>',
    );
    expect(initialHtml).toContain(
      '<ul>\n  <li>Review changes</li>\n  <li>Share with the team</li>\n</ul>',
    );
    expect(initialHtml).toContain('<pre>const ready = true;\nlaunch();</pre>');
    const editor = page.locator('.rv-rich-text-editor');
    await editor.getByRole('tab', { name: 'HTML', exact: true }).click();
    await expect(
      editor.getByRole('textbox', { name: 'HTML', exact: true }),
    ).toHaveValue(initialHtml!);
    await editor
      .getByRole('textbox', { name: 'HTML', exact: true })
      .fill('<p onclick="bad()">Saved <strong>notes</strong></p>');
    await editor.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByLabel('Saved HTML')).toHaveText(
      '<p>Saved <strong>notes</strong></p>',
    );
    await expect(
      editor.getByRole('textbox', { name: 'Rich text', exact: true }),
    ).toHaveText('Saved notes');
    await editor.getByRole('tab', { name: 'HTML', exact: true }).click();
    await editor
      .getByRole('textbox', { name: 'HTML', exact: true })
      .fill('<p>Discard this draft</p>');
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(
      editor.getByRole('textbox', { name: 'Rich text', exact: true }),
    ).toHaveText('Saved notes');
    await expect(page.getByLabel('Saved HTML')).toHaveText(
      '<p>Saved <strong>notes</strong></p>',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

async function sourceHtml(
  page: import('@playwright/test').Page,
  value: string,
) {
  await page.getByRole('tab', { name: 'HTML', exact: true }).click();
  await page.getByRole('textbox', { name: 'HTML', exact: true }).fill(value);
  await page.getByRole('tab', { name: 'Visual', exact: true }).click();
  return page.getByRole('textbox', { name: 'Rich text', exact: true });
}

for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`code keyboard exit, history and typography in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto('/components/html-editor/');
      if (theme === 'dark') await setDarkTheme(page);
      const rich = await sourceHtml(
        page,
        '<h2>Launch notes</h2><blockquote><p>Keep notes simple.</p></blockquote><pre><strong>const</strong> ready = true;</pre>',
      );
      await rich.press(
        process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
      );
      await expect(
        page.getByRole('button', { name: 'Bold', exact: true }),
      ).toBeDisabled();
      await rich.press('Enter');
      await rich.press('Enter');
      await rich.press('Enter');
      await expect(rich.locator('pre')).toHaveText('const ready = true;');
      await expect(rich.locator(':scope > p')).toHaveCount(1);
      await rich.press('ControlOrMeta+z');
      await expect(rich.locator(':scope > p')).toHaveCount(0);
      await rich.press('ControlOrMeta+Shift+z');
      await rich.pressSequentially('Continue outside code.');
      await expect(rich.locator(':scope > p')).toHaveText(
        'Continue outside code.',
      );
      await expect(rich.locator('pre strong')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Bold', exact: true }),
      ).toBeEnabled();
      const metrics = await rich.evaluate((el) => {
        const style = getComputedStyle(el),
          code = getComputedStyle(el.querySelector('pre')!);
        return {
          font: parseFloat(style.fontSize),
          line: parseFloat(style.lineHeight),
          padding: parseFloat(style.paddingLeft),
          codeFont: code.fontFamily,
        };
      });
      expect(metrics.line / metrics.font).toBeGreaterThanOrEqual(1.5);
      expect(metrics.padding).toBeGreaterThanOrEqual(14);
      expect(metrics.codeFont).toContain('monospace');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .locator('.rv-rich-text-editor')
        .screenshot({ path: info.outputPath('rich-text.png') });
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByLabel('Saved HTML')).toContainText(
        '<p>Continue outside code.</p>',
      );
      await expect(page.getByLabel('Saved HTML')).not.toContainText(
        'data-rv-placeholder',
      );
    });
  }

test('keyboard continues outside quotes, headings, nested lists and inline links', async ({
  page,
}) => {
  await page.goto('/components/html-editor/');
  let rich = await sourceHtml(page, '<blockquote><p>Quote</p></blockquote>');
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('Enter');
  await rich.press('Enter');
  await rich.pressSequentially('Outside quote');
  await expect(rich.locator(':scope > p')).toHaveText('Outside quote');
  rich = await sourceHtml(page, '<h2>Heading</h2>');
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('Enter');
  await rich.pressSequentially('Paragraph');
  await expect(rich.locator(':scope > p')).toHaveText('Paragraph');
  rich = await sourceHtml(
    page,
    '<ul><li>Parent<ul><li>Nested</li></ul></li></ul>',
  );
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('Enter');
  await rich.press('Enter');
  await expect(rich.locator(':scope > ul > li')).toHaveCount(2);
  await rich.press('Enter');
  await rich.pressSequentially('Outside list');
  await expect(rich.locator(':scope > p')).toHaveText('Outside list');
  rich = await sourceHtml(page, '<ul><li><p>Wrapped item</p></li></ul>');
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('Enter');
  await rich.press('Enter');
  await rich.pressSequentially('Outside wrapped list');
  await expect(rich.locator(':scope > p')).toHaveText('Outside wrapped list');
  rich = await sourceHtml(page, '<p><a href="/record/1">Link</a></p>');
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('ArrowRight');
  await rich.pressSequentially(' outside');
  await expect(rich.locator('a')).toHaveText('Link');
  await expect(rich).toHaveText('Link outside');
});

test('toolbar has one tab stop, arrow navigation and Escape restores the caret', async ({
  page,
}) => {
  await page.goto('/components/html-editor/');
  const rich = await sourceHtml(page, '<p>Hello</p>');
  await rich.press(
    process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
  );
  await rich.press('Alt+F10');
  const bold = page.getByRole('button', { name: 'Bold', exact: true });
  const italic = page.getByRole('button', { name: 'Italic', exact: true });
  await expect(bold).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveText('Bold');
  await bold.press('ArrowRight');
  await expect(italic).toBeFocused();
  await italic.press('Escape');
  await expect(rich).toBeFocused();
  await rich.pressSequentially(' world');
  await expect(rich).toHaveText('Hello world');
  await expect(
    page.locator(
      '.rv-rich-text-editor [role="toolbar"] [role="button"][tabindex="0"]',
    ),
  ).toHaveCount(1);
});

test('soft breaks, code boundary arrows and Backspace keep typing in the expected block', async ({
  page,
}) => {
  await page.goto('/components/html-editor/');
  const end = process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End';
  const start = process.platform === 'darwin' ? 'Meta+ArrowUp' : 'Control+Home';
  let rich = await sourceHtml(page, '<p>First</p>');
  await rich.press(end);
  await rich.press('Shift+Enter');
  await rich.pressSequentially('Second');
  await expect(rich.locator('p')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByLabel('Saved HTML')).toHaveText(
    '<p>First<br>Second</p>',
  );
  rich = await sourceHtml(page, '<pre>code</pre>');
  await rich.press(end);
  await rich.press('ArrowDown');
  await rich.pressSequentially('After');
  await expect(rich.locator(':scope > p')).toHaveText('After');
  rich = await sourceHtml(page, '<pre>code</pre>');
  await rich.press(start);
  await rich.press('ArrowUp');
  await rich.pressSequentially('Before');
  await expect(rich.locator(':scope > p')).toHaveText('Before');
  rich = await sourceHtml(page, '<h2>Heading</h2>');
  await rich.press(start);
  await rich.press('Backspace');
  await rich.pressSequentially('Plain ');
  await expect(rich.locator('h2')).toHaveCount(0);
  await expect(rich.locator('p')).toHaveText('Plain Heading');
});

test('source indentation and cross-block formatting do not create blank paragraphs or rich code', async ({
  page,
}) => {
  await page.goto('/components/html-editor/');
  const rich = await sourceHtml(page, '\n <p>Text</p>\n <pre>code</pre>\n');
  await expect(rich.locator('p')).toHaveCount(1);
  await rich.press('ControlOrMeta+a');
  await rich.press('ControlOrMeta+b');
  await expect(rich.locator('p strong')).toHaveText('Text');
  await expect(rich.locator('pre strong')).toHaveCount(0);
  await expect(rich.locator('pre')).toHaveText('code');
});

for (const theme of ['light', 'dark'])
  for (const width of [1280, 390])
    test(`HTML source highlighting preserves editing and scrolling in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/components/html-editor/');
      if (theme === 'dark') await setDarkTheme(page);
      await page.getByRole('tab', { name: 'HTML', exact: true }).click();
      const source = page.getByRole('textbox', { name: 'HTML', exact: true });
      const overlay = page.locator(
        '.rv-rich-text-editor__source .rv-highlighted-input__highlight',
      );
      await expect(overlay).toHaveAttribute('aria-hidden', 'true');
      await expect(
        overlay.locator('.rv-html-syntax__tag').first(),
      ).toBeVisible();
      const code =
        '<p title="Note">Editable</p>\n' +
        Array.from(
          { length: 35 },
          (_, i) => `<p>Line ${i} ${'text '.repeat(30)}</p>`,
        ).join('\n');
      await source.fill(code);
      await expect(overlay.locator('code')).toHaveText(code);
      const geometry = await page
        .locator('.rv-rich-text-editor__source')
        .evaluate((el) => {
          const input = el.querySelector('textarea')!,
            paint = el.querySelector('pre')!;
          const a = getComputedStyle(input),
            b = getComputedStyle(paint);
          return {
            a: [
              a.fontFamily,
              a.fontSize,
              a.lineHeight,
              a.padding,
              a.whiteSpace,
            ],
            b: [
              b.fontFamily,
              b.fontSize,
              b.lineHeight,
              b.padding,
              b.whiteSpace,
            ],
          };
        });
      expect(geometry.a).toEqual(geometry.b);
      await source.press(
        process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End',
      );
      await expect
        .poll(() =>
          page.locator('.rv-rich-text-editor__source').evaluate((el) => {
            const input = el.querySelector('textarea')!,
              paint = el.querySelector('pre')!;
            return Math.max(
              Math.abs(input.scrollTop - paint.scrollTop),
              Math.abs(input.scrollLeft - paint.scrollLeft),
            );
          }),
        )
        .toBeLessThanOrEqual(1);
      await source.pressSequentially(' end');
      await expect(source).toHaveValue(code + ' end');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByLabel('Saved HTML')).toContainText(' end');
      await page.getByRole('tab', { name: 'HTML', exact: true }).click();
      await source.fill('<script>bad()</script><p>Safe</p>');
      await expect(page.locator('.rv-rich-text-editor script')).toHaveCount(0);
      await page.getByRole('tab', { name: 'Visual', exact: true }).click();
      await expect(
        page.getByRole('textbox', { name: 'Rich text', exact: true }),
      ).toHaveText('Safe');
    });
