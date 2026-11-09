import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['ai-assistant'] });

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    test(`chat composer is the only assistant example in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#ai-assistant');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      await expect(
        page.getByRole('heading', { name: 'View assistant', exact: true }),
      ).toHaveCount(0);
      const example = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', { name: 'Chat UI', exact: true }),
      });
      await example.scrollIntoViewIfNeeded();
      const prompt = example.getByLabel('Message', { exact: true });
      const composer = example.locator('.rv-ai-prompt-composer');
      const suggestions = composer.getByRole('group', {
        name: 'Suggested requests',
      });
      await expect(suggestions.getByRole('button')).toHaveCount(2);
      await expect(example.locator('.rv-ai-suggestions')).toHaveCount(1);
      await expect(prompt).toHaveAttribute('placeholder', 'Type a message…');
      await expect(
        example.getByRole('button', { name: 'Send', exact: true }),
      ).toBeDisabled();
      const sendBox = (await example
        .getByRole('button', { name: 'Send', exact: true })
        .boundingBox())!;
      expect(sendBox.width).toBe(sendBox.height);
      await suggestions.getByRole('button').first().focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const more = suggestions.getByRole('combobox', { name: 'More' });
      await expect(more).toBeFocused();
      await more.press('Enter');
      await page
        .getByRole('option', { name: 'Exclude cancelled orders', exact: true })
        .click();
      await expect(example.locator('.rv-ai-message--user').last()).toHaveText(
        'Exclude cancelled orders',
      );
      await example.getByRole('button', { name: 'Stop', exact: true }).click();
      await expect(prompt).toBeEnabled();
      await prompt.fill('Only Europe');
      await prompt.press('Shift+Enter');
      await prompt.pressSequentially('Sort by amount');
      await expect(prompt).toHaveValue('Only Europe\nSort by amount');
      await prompt.press('Enter');
      await expect(example.locator('.rv-ai-message--user').last()).toHaveText(
        'Only Europe\nSort by amount',
      );
      await example.getByRole('button', { name: 'Stop', exact: true }).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });
  }
}

test('prompt icon controls expose busy, stop and disabled states', async ({
  page,
}) => {
  await page.goto('/#ai-assistant');
  await page
    .getByRole('searchbox', { name: 'Find a component' })
    .fill('AI assistant');
  const example = page.locator('.catalog-example').filter({
    has: page.getByRole('heading', { name: 'Prompt states', exact: true }),
  });
  const cancellable = example.getByRole('textbox', {
    name: 'Cancellable request',
    exact: true,
  });
  const busy = example.getByRole('textbox', {
    name: 'Busy request',
    exact: true,
  });
  const unavailable = example.getByRole('textbox', {
    name: 'Unavailable request',
    exact: true,
  });
  await expect(cancellable).toBeDisabled();
  await expect(busy).toBeDisabled();
  await expect(unavailable).toBeDisabled();
  await expect(example.locator('button[aria-busy="true"]')).toBeDisabled();
  await example.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(cancellable).toBeEnabled();
  await expect(
    example.getByText('Request stopped.', { exact: true }),
  ).toBeVisible();
  await expect(
    example.getByRole('button', { name: 'Stop', exact: true }),
  ).toHaveCount(0);
  await expect(cancellable).toHaveCSS('resize', 'none');
  await expect(cancellable).toHaveAttribute('rows', '3');
  const initialHeight = (await cancellable.boundingBox())!.height;
  await cancellable.fill(
    Array.from({ length: 20 }, (_, index) => `Line ${index + 1}`).join('\n'),
  );
  await expect
    .poll(async () => (await cancellable.boundingBox())!.height)
    .toBeGreaterThan(initialHeight);
  await expect(cancellable).toHaveCSS('height', '160px');
  expect(
    await cancellable.evaluate(
      (input) => input.scrollHeight > input.clientHeight,
    ),
  ).toBe(true);
  const inputBox = (await cancellable.boundingBox())!;
  const toolbarBox = (await cancellable
    .locator('..')
    .locator('.rv-ai-prompt-toolbar')
    .boundingBox())!;
  expect(toolbarBox.x).toBeGreaterThanOrEqual(inputBox.x + inputBox.width);
  expect(toolbarBox.y + toolbarBox.height).toBeCloseTo(
    inputBox.y + inputBox.height,
    0,
  );
  await cancellable.fill('Short request');
  await expect
    .poll(async () => (await cancellable.boundingBox())!.height)
    .toBe(initialHeight);
});
