import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

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
