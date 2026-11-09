import { test, expect, type Locator } from './gallery-test';

test.use({ gallerySections: ['formatting-controls'] });

const sizes = (details: Locator) =>
  details.evaluate(async (node) => {
    const samples: number[] = [];
    for (let frame = 0; frame < 4; frame++) {
      await new Promise(requestAnimationFrame);
      samples.push(
        parseFloat(getComputedStyle(node, '::details-content').blockSize),
      );
    }
    return samples;
  });

for (const [name, selector] of [
  ['inspector', '.rv-format-inspector-section'],
  ['disclosure', 'details:has(> .rv-disclosure-summary)'],
] as const) {
  test(`${name} animates opening and closing and respects motion off`, async ({
    page,
  }) => {
    await page.goto('/#components');
    const details = page.locator(selector).first();
    await details.scrollIntoViewIfNeeded();
    await details.evaluate((node) => {
      node.setAttribute('data-rv-ui-motion', 'off');
      node.style.setProperty('--rv-ui-motion-normal', '1500ms');
      (node as HTMLDetailsElement).open = false;
      node.getBoundingClientRect();
      node.removeAttribute('data-rv-ui-motion');
    });
    await expect
      .poll(() =>
        details.evaluate(
          (node) => getComputedStyle(node, '::details-content').blockSize,
        ),
      )
      .toBe('0px');
    const summary = details.locator(':scope > summary');
    const closedHeight = await details.evaluate(
      (node) => node.getBoundingClientRect().height,
    );
    await summary.click();
    const opening = await sizes(details);
    expect(opening.at(-1)!).toBeGreaterThan(opening[0]);
    await expect
      .poll(() =>
        details.evaluate(
          (node) => getComputedStyle(node, '::details-content').opacity,
        ),
      )
      .toBe('1');
    expect(
      await details.evaluate((node) => node.getBoundingClientRect().height),
    ).toBeGreaterThan(closedHeight);
    await summary.click();
    await expect(details).not.toHaveAttribute('open');
    const closing = await sizes(details);
    expect(closing.at(-1)!).toBeLessThan(closing[0]);
    if (name === 'inspector') {
      await summary.press('Tab');
      await expect(details.locator('input')).not.toBeFocused();
    }
    await details.evaluate((node) =>
      node.setAttribute('data-rv-ui-motion', 'off'),
    );
    await expect
      .poll(() =>
        details.evaluate((node) => node.getBoundingClientRect().height),
      )
      .toBe(closedHeight);
    await expect
      .poll(() =>
        details.evaluate(
          (node) =>
            getComputedStyle(node, '::details-content').transitionDuration,
        ),
      )
      .toBe('0s');
    await summary.press('Enter');
    await expect(details).toHaveAttribute('open');
    expect(
      await details.evaluate(
        (node) => getComputedStyle(node, '::details-content').opacity,
      ),
    ).toBe('1');
  });
}

test('global and OS motion disable disclosure content even with custom timing', async ({
  page,
}) => {
  await page.goto('/#components');
  const details = page.locator('.rv-format-inspector-section').first();
  for (const mode of ['global', 'reduce'] as const) {
    if (mode === 'global')
      await page
        .getByRole('switch', { name: 'Animations', exact: true })
        .uncheck();
    else {
      await page
        .getByRole('switch', { name: 'Animations', exact: true })
        .check();
      await page.emulateMedia({ reducedMotion: 'reduce' });
    }
    await details.evaluate((node) => {
      node.style.setProperty('--rv-ui-motion-normal', '2s');
      (node as HTMLDetailsElement).open = false;
    });
    await expect
      .poll(() =>
        details.evaluate(
          (node) => getComputedStyle(node, '::details-content').blockSize,
        ),
      )
      .toBe('0px');
    await details.locator(':scope > summary').press('Enter');
    await expect(details).toHaveAttribute('open');
    await expect
      .poll(() =>
        details.evaluate(
          (node) =>
            getComputedStyle(node, '::details-content').transitionDuration,
        ),
      )
      .toBe('0s');
    expect(
      await details.evaluate(
        (node) => getComputedStyle(node, '::details-content').opacity,
      ),
    ).toBe('1');
  }
});

test('rapid disclosure reversal and dynamic content keep natural sizing', async ({
  page,
}) => {
  await page.goto('/#components');
  const details = page.locator('.rv-format-inspector-section').first();
  await details.evaluate((node) =>
    node.style.setProperty('--rv-ui-motion-normal', '1500ms'),
  );
  const summary = details.locator(':scope > summary');
  await summary.click();
  const closing = await sizes(details);
  expect(closing.at(-1)!).toBeLessThan(closing[0]);
  await summary.click();
  const reopening = await sizes(details);
  expect(reopening.at(-1)!).toBeGreaterThan(reopening[0]);
  await expect
    .poll(() =>
      details.evaluate(
        (node) => getComputedStyle(node, '::details-content').opacity,
      ),
    )
    .toBe('1');
  const before = await details.evaluate(
    (node) => node.getBoundingClientRect().height,
  );
  await details
    .locator('.rv-format-inspector-section__content')
    .evaluate((node) => {
      const content = document.createElement('p');
      content.textContent = 'Additional section content';
      node.append(content);
    });
  expect(
    await details.evaluate((node) => node.getBoundingClientRect().height),
  ).toBeGreaterThan(before);
  expect(
    await details.evaluate((node) => (node as HTMLElement).style.height),
  ).toBe('');
});
