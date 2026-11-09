import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['ai-assistant'] });

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    test(`standalone chat works in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#ai-assistant');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const example = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', { name: 'Chat UI', exact: true }),
      });
      const chat = example.getByRole('region', {
        name: 'AI chat',
        exact: true,
      });
      const prompt = chat.getByLabel('Message', { exact: true });
      await prompt.scrollIntoViewIfNeeded();
      const box = await chat.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(width);
      expect(
        await chat.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      const caret = await chat
        .locator('.rv-ai-trace-chevron svg')
        .first()
        .boundingBox();
      expect(caret!.width).toBeLessThanOrEqual(8);
      expect(caret!.height).toBeLessThanOrEqual(8);
      const lastMessage = await chat.locator('article').last().boundingBox();
      const composer = await chat.locator('.rv-ai-chat-composer').boundingBox();
      expect(
        composer!.y - lastMessage!.y - lastMessage!.height,
      ).toBeLessThanOrEqual(40);
      const footerPadding = await chat
        .locator('.rv-ai-prompt-footer')
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            top: style.paddingTop,
            bottom: style.paddingBottom,
            border: style.borderTopWidth,
          };
        });
      expect(footerPadding.bottom).toBe(footerPadding.top);
      expect(footerPadding.border).toBe('0px');
      const reasoning = chat.locator('details').first();
      await reasoning.locator('summary').press('Enter');
      await expect(reasoning).toHaveAttribute('open', '');
      await expect(reasoning).toContainText('Host-provided work summary');
      await reasoning.locator('summary').press('Enter');
      await expect(reasoning).not.toHaveAttribute('open', '');
      await chat
        .getByRole('button', { name: 'Follow up', exact: true })
        .click();
      await expect(prompt).toHaveValue('Show orders above 1000');
      await prompt.press('Enter');
      await expect(
        chat.getByRole('button', { name: 'Stop', exact: true }),
      ).toBeVisible();
      await chat.getByRole('button', { name: 'Stop', exact: true }).click();
      await expect(prompt).toBeEnabled();
      await expect(chat.locator('article')).toHaveCount(4);
      await example.screenshot({
        path: test.info().outputPath(`chat-${theme}-${width}.png`),
      });
    });
  }
}
test('reading history pauses following streamed messages until Jump to latest', async ({
  page,
}) => {
  // Native scrolling plus streamed updates and traced assertions exceed 30s on the VPS.
  test.slow();
  await page.goto('/#ai-assistant');
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('AI assistant');
  const example = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Chat UI', exact: true }),
  });
  await example
    .getByRole('button', { name: 'Add sample turns', exact: true })
    .click();
  const log = example.getByRole('log', { name: 'Conversation messages' });
  await expect
    .poll(() =>
      log.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThanOrEqual(40);
  const fullLogWidth = await log.evaluate((element) => element.clientWidth);
  // Exercise reader scrolling with native input on both Linux CI and macOS.
  await log.hover();
  await page.mouse.wheel(0, -10000);
  await expect(
    example.getByRole('button', { name: 'Jump to latest', exact: true }),
  ).toHaveCSS('position', 'absolute');
  const jumpButton = example.getByRole('button', {
    name: 'Jump to latest',
    exact: true,
  });
  expect(
    await jumpButton.evaluate(
      (element) =>
        [...element.childNodes].filter(
          (node) => node.nodeType === Node.TEXT_NODE,
        ).length,
    ),
  ).toBe(0);
  await expect(jumpButton.locator('svg')).toBeVisible();
  await expect(jumpButton).toHaveCSS('width', '32px');
  await expect(jumpButton).toHaveCSS('height', '32px');
  await expect(jumpButton).toHaveCSS('border-radius', '50%');
  await expect
    .poll(() => log.evaluate((element) => element.clientWidth))
    .toBe(fullLogWidth);
  await expect.poll(() => log.evaluate((element) => element.scrollTop)).toBe(0);
  const prompt = example.getByLabel('Message', { exact: true });
  await prompt.fill('Continue');
  await prompt.press('Enter');
  await expect(log).toHaveAttribute('aria-busy', 'true');
  await expect(
    example.getByRole('button', { name: 'Jump to latest', exact: true }),
  ).toBeVisible();
  await expect.poll(() => log.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(log).not.toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => log.evaluate((element) => element.scrollTop)).toBe(0);
  await example
    .getByRole('button', { name: 'Jump to latest', exact: true })
    .click();
  await expect
    .poll(() =>
      log.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThanOrEqual(40);
});
