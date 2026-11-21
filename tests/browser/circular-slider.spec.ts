import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);

test('drags along the ring and commits once on release without jumping across the seam', async ({
  page,
}) => {
  await page.goto('/components/circular-slider/');
  const slider = page.getByRole('slider', { name: 'Rotation', exact: true });
  const box = await slider.boundingBox();
  const radius = Number(
    await slider.locator('[data-part="track"]').getAttribute('r'),
  );
  const point = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: box!.x + box!.width / 2 + radius * Math.sin(radians),
      y: box!.y + box!.height / 2 - radius * Math.cos(radians),
    };
  };
  const example = page.locator('#example-controlled-rotation');
  const start = point(330);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await expect(slider).toHaveAttribute('aria-valuenow', '330');
  await expect(example.getByRole('status')).toHaveText('Applied rotation 135°');
  for (const degrees of [345, 355, 5]) {
    const next = point(degrees);
    await page.mouse.move(next.x, next.y);
  }
  await expect(slider).toHaveAttribute('aria-valuenow', '360');
  await expect(example.getByRole('status')).toHaveText('Applied rotation 135°');
  await page.mouse.up();
  await expect(example.getByRole('status')).toHaveText('Applied rotation 360°');
  await expect(slider).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '355');
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('PageUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  await slider.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '55');
});

test('lists the dial next to sliders and animates the thumb and arc together', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.goto('/components/circular-slider/');
  const links = await page
    .getByRole('navigation', { name: 'Component sections' })
    .getByRole('link')
    .allTextContents();
  expect(links[links.indexOf('Sliders') + 1]).toBe('Circular slider');

  const slider = page.getByRole('slider', { name: 'Rotation', exact: true });
  const thumb = slider.locator('[data-part="thumb"]');
  await thumb.hover();
  await expect(thumb).toHaveCSS('transform', /^matrix\(1\.1,/);
  await page.mouse.down();
  await expect(thumb).toHaveCSS('transform', /^matrix\(0\.92,/);
  const bounds = (await slider.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.09,
    bounds.y + bounds.height / 2,
  );
  const position = slider.locator('.rv-circular-slider-thumb-position');
  const fill = slider.locator('[data-part="fill"]');
  await expect(slider).toHaveAttribute('data-dragging', '');
  await expect(position).toHaveCSS('transition-duration', '0s');
  await page.mouse.up();
  await expect(slider).not.toHaveAttribute('data-dragging', '');

  const motion = () =>
    slider.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .filter(
          (animation): animation is CSSTransition =>
            animation instanceof CSSTransition,
        )
        .map((animation) => animation.transitionProperty),
    );
  await slider.press('PageUp');
  await expect
    .poll(motion)
    .toEqual(expect.arrayContaining(['stroke-dasharray', 'transform']));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(position).toHaveCSS('transition-duration', '0s');
  await expect(fill).toHaveCSS('transition-duration', '0s');
});

test('shows keyboard focus on the thumb without outlining the dial', async ({
  page,
}) => {
  await page.route('https://registry.npmjs.org/**', (route) => route.abort());
  await page.goto('/components/circular-slider/');
  const slider = page.getByRole('slider', { name: 'Rotation', exact: true });
  const thumb = slider.locator('[data-part="thumb"]');
  const idle = await thumb.evaluate(
    (element) => getComputedStyle(element).fill,
  );
  await thumb.click();
  await expect(slider).toBeFocused();
  await expect(slider).toHaveCSS('outline-style', 'none');
  await expect(thumb).toHaveCSS('fill', idle);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(slider).toBeFocused();
  await expect(slider).toHaveCSS('outline-style', 'none');
  await expect(thumb).not.toHaveCSS('fill', idle);
});

test('submits degrees while displaying another unit and resets uncontrolled values', async ({
  page,
}) => {
  await page.goto('/components/circular-slider/');
  const slider = page.getByRole('slider', { name: 'Mix level' });
  await expect(slider).toHaveAttribute('aria-valuetext', '50%');
  await slider.focus();
  await page.keyboard.press('ArrowUp');
  await expect(slider).toHaveAttribute('aria-valuetext', '55%');
  const form = page.locator('#example-circular-form-control form');
  expect(
    await form.evaluate((element: HTMLFormElement) =>
      new FormData(element).get('mix'),
    ),
  ).toBe('198');
  await form.getByRole('button', { name: 'Reset mix' }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '180');
  expect(
    await form.evaluate((element: HTMLFormElement) =>
      new FormData(element).get('mix'),
    ),
  ).toBe('180');
});

for (const theme of ['light', 'dark']) {
  test(`slider markers and states work in ${theme} at 320px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 780 });
    await page.addInitScript(
      (mode) => localStorage.setItem('revo-ui-theme', mode),
      theme,
    );
    await page.goto('/components/circular-slider/');
    const compass = page.getByRole('slider', { name: 'Heading' });
    await expect(compass.locator('[data-part="marker"]')).toHaveCount(4);
    const readonly = page.getByRole('slider', { name: 'Saved heading' });
    await readonly.focus();
    await page.keyboard.press('ArrowRight');
    await expect(readonly).toHaveAttribute('aria-valuenow', '225');
    await expect(
      page.getByRole('slider', { name: 'Locked rotation' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('slider', { name: 'Review angle' }),
    ).toHaveAttribute('aria-invalid', 'true');
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page
      .locator('#circular-slider')
      .evaluate(async (element) => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe;
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
}
