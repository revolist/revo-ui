import { createRequire } from 'node:module';
import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

const require = createRequire(import.meta.url);

test.use({ gallerySections: ['timeline-track'] });

test('shared timeline track moves and resizes independently of the Pro editor', async ({
  page,
}, testInfo) => {
  await page.goto('/#timeline-track');
  const track = page.getByRole('group', {
    name: 'Timeline preview',
    exact: true,
  });
  await expect(track).toBeVisible();
  await expect(track.locator('.rv-timeline-control__bar').last()).toHaveCSS(
    'background-image',
    /linear-gradient/,
  );
  const build = track.getByRole('group', { name: 'Build', exact: true });
  const move = build.getByRole('button', {
    name: 'Move event 1: Build',
    exact: true,
  });
  await move.hover();
  await expect(page.getByRole('tooltip')).toContainText('Build: 08:00 – 12:00');
  await move.focus();
  await move.press('ArrowRight');
  await expect(
    build.getByRole('slider', { name: 'Resize start of Build' }),
  ).toHaveAttribute('aria-valuenow', '9');
  const end = build.getByRole('slider', { name: 'Resize end of Build' });
  await end.focus();
  await expect(page.getByRole('tooltip')).toContainText('Build: 09:00 – 13:00');
  await end.press('ArrowLeft');
  await expect(end).toHaveAttribute('aria-valuenow', '12');
  const bounds = (await track.boundingBox())!;
  const bar = (await move.boundingBox())!;
  expect(bounds.width).toBeGreaterThan(100);
  expect(
    await page.evaluate(
      ({ x, y }) =>
        document
          .elementFromPoint(x, y)
          ?.classList.contains('rv-timeline-control__bar-move'),
      { x: bar.x + bar.width / 2, y: bar.y + bar.height / 2 },
    ),
  ).toBe(true);
  await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    bar.x + bar.width / 2 + bounds.width / 24,
    bar.y + bar.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(
    build.getByRole('slider', { name: 'Resize start of Build' }),
  ).toHaveAttribute('aria-valuenow', '10');
  for (const theme of ['light', 'dark']) {
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await track.screenshot({
      path: testInfo.outputPath(`shared-timeline-${theme}.png`),
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(track).toBeVisible();
  const narrow = (await track.boundingBox())!;
  expect(narrow.x).toBeGreaterThanOrEqual(0);
  expect(narrow.x + narrow.width).toBeLessThanOrEqual(391);
  await track.screenshot({
    path: testInfo.outputPath('shared-timeline-narrow.png'),
  });
});

test('timeline editing uses the full-width shared disclosure in both states', async ({
  page,
}) => {
  await page.goto('/components/timeline-track/');
  const track = page
    .getByRole('group', { name: 'Timeline preview', exact: true })
    .first();
  const actions = page
    .locator('.rv-collapsible-section[data-part="actions"]')
    .first();
  const trigger = actions.locator('summary');
  await expect(trigger).toHaveText('Edit timeline events');
  const width = (await track.boundingBox())!.width;
  expect((await actions.boundingBox())!.width).toBeCloseTo(width, 0);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const build = actions.getByRole('group', { name: 'Build', exact: true });
  await expect(build).toBeVisible();
  expect((await actions.boundingBox())!.width).toBeCloseTo(width, 0);
  await build.getByRole('button', { name: 'Move later' }).click();
  await expect(build.locator('output')).toHaveText('09:00 – 13:00');
});

test('session lanes align to their axis and expose patterned events and details', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.goto('/components/timeline-track/');
  const chart = page.getByRole('group', {
    name: 'Device sessions by day',
    exact: true,
  });
  const axis = chart.locator('[data-part="column"]');
  const lines = chart.locator('[data-part="column-line"]');
  await expect(axis).toHaveCount(7);
  await expect(lines).toHaveCount(7);
  await expect(chart.locator('[data-part="lane"]')).toHaveCount(4);
  await expect(chart.locator('[data-part="event"]')).toHaveCount(9);
  expect(
    await chart.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    ),
  ).toBe(0);
  const reference = chart.locator('[data-part="reference"]');
  await expect(reference).toContainText('Now');
  const markerCaption = (await reference.locator('span').boundingBox())!;
  const referenceRow = (await reference.boundingBox())!;
  expect(markerCaption.y + markerCaption.height).toBeLessThanOrEqual(
    referenceRow.y + referenceRow.height,
  );
  await expect(reference.locator('span')).toHaveCSS('white-space', 'nowrap');
  for (let index = 0; index < 7; index += 1) {
    const heading = (await axis.nth(index).boundingBox())!;
    const line = (await lines.nth(index).boundingBox())!;
    expect(Math.abs(heading.x - line.x)).toBeLessThan(1);
  }
  const chrome = await chart
    .getByRole('button', { name: /^Firefox on Ubuntu/ })
    .all();
  expect(
    await Promise.all(
      chrome.map(async (button) => (await button.boundingBox())!.y),
    ),
  ).toEqual(Array(chrome.length).fill((await chrome[0].boundingBox())!.y));
  const legend = page.getByRole('list', { name: 'Session status' });
  await expect(legend.getByRole('listitem')).toHaveCount(3);
  await expect(legend.getByText('Revoked')).toBeVisible();
  const revoked = chart.getByRole('button', {
    name: /Edge on Windows, Revoked/,
  });
  await expect(revoked.locator('..')).toHaveCSS(
    'background-image',
    /repeating-linear-gradient/,
  );
  await revoked.press('Enter');
  const detail = page.getByRole('dialog', { name: 'Session details' });
  await expect(detail).toContainText('WS-304');
  await page.keyboard.press('Escape');
  await expect(detail).toBeHidden();
  await expect(revoked).toBeFocused();

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(chart).toBeVisible();
  const bounds = (await chart.boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(
    await chart.evaluate((element) => element.scrollWidth),
  ).toBeGreaterThan(bounds.width);
});

test('the left device column resizes by pointer and keyboard without moving the timeline grid out of alignment', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.goto('/components/timeline-track/');
  const chart = page.getByRole('group', { name: 'Device sessions by day' });
  const resize = chart.getByRole('separator', { name: 'Resize device column' });
  const panel = chart.locator('[data-part="lanes"]');
  const plot = chart.locator('[data-part="plot"]');
  await resize.press('ArrowRight');
  await expect(resize).toHaveAttribute('aria-valuenow', '202');
  await resize.press('Home');
  await expect(resize).toHaveAttribute('aria-valuenow', '140');
  const handle = (await resize.boundingBox())!;
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    handle.x + handle.width / 2 + 56,
    handle.y + handle.height / 2,
    { steps: 4 },
  );
  await page.mouse.up();
  await expect(resize).toHaveAttribute('aria-valuenow', '196');
  const labels = (await panel.boundingBox())!;
  const timeline = (await plot.boundingBox())!;
  expect(labels.width).toBeCloseTo(196, 0);
  expect(labels.x + labels.width).toBeCloseTo(timeline.x, 0);
  await resize.press('End');
  await expect(resize).toHaveAttribute('aria-valuenow', '320');
  const column = (await chart
    .locator('[data-part="column"]')
    .nth(3)
    .boundingBox())!;
  const gridLine = (await chart
    .locator('[data-part="column-line"]')
    .nth(3)
    .boundingBox())!;
  expect(column.x).toBeCloseTo(gridLine.x, 0);
});

test('session timeline uses themed colors and passes scoped checks in dark mode', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.addInitScript(() => localStorage.setItem('revo-ui-theme', 'dark'));
  await page.goto('/components/timeline-track/');
  const chart = page.getByRole('group', { name: 'Device sessions by day' });
  const active = chart
    .getByRole('button', { name: /^Chrome on Pixel, Active/ })
    .locator('..');
  const color = await chart.evaluate(
    (element) => getComputedStyle(element).color,
  );
  await expect(active).toHaveCSS('background-color', color);
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const violations = await page
    .locator('.session-timeline-demo')
    .evaluate(async (element) => {
      const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
      return (
        await axe.run(element, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
        })
      ).violations.map(({ id }) => id);
    });
  expect(violations).toEqual([]);
});
