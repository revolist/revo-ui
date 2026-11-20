import { setGalleryPreference } from './gallery-preferences';
import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`hero animation follows theme and motion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    if (width <= 1200) {
      await page.getByRole('button', { name: 'More gallery options' }).click();
    }
    const video = page.locator('.home-hero-animation video');
    const intro = page.locator('.home-hero-intro');
    await expect(video).toHaveAttribute('src', /avatar-light.*\.mp4/);
    await expect
      .poll(() =>
        video.evaluate(
          (element) =>
            !(element as HTMLVideoElement).paused &&
            (element as HTMLVideoElement).videoWidth > 0,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        intro.evaluate(
          (element) => getComputedStyle(element, '::before').backgroundColor,
        ),
      )
      .toBe('rgb(255, 255, 255)');
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await expect(video).toHaveAttribute('src', /avatar-dark.*\.mp4/);
    await expect
      .poll(() =>
        video.evaluate(
          (element) =>
            !(element as HTMLVideoElement).paused &&
            (element as HTMLVideoElement).videoWidth > 0,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        intro.evaluate(
          (element) => getComputedStyle(element, '::before').backgroundColor,
        ),
      )
      .toBe('rgb(0, 0, 0)');
    await setGalleryPreference(page, 'Animations', 'toggle');
    await expect(video).toBeVisible();
    expect(
      await video.evaluate((element) => (element as HTMLVideoElement).paused),
    ).toBe(true);
    await expect(page.locator('.home-hero-animation img')).toHaveCount(0);
    await setGalleryPreference(page, 'Animations', 'toggle');
    await expect
      .poll(() =>
        video.evaluate((element) => !(element as HTMLVideoElement).paused),
      )
      .toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(video).toBeVisible();
    await expect
      .poll(() =>
        video.evaluate((element) => (element as HTMLVideoElement).paused),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('.home-star-invitation video')).toHaveCount(1);
    await page.screenshot({
      path: `test-results/hero-dark-${width}.png`,
      fullPage: false,
    });
    if (width <= 1200)
      await page.getByRole('button', { name: 'More gallery options' }).click();
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await page.screenshot({
      path: `test-results/hero-light-${width}.png`,
      fullPage: false,
    });
  });
}
