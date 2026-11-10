import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { cdnExamples } from '../../src/cdn-examples';
import { createSamplePdf } from '../../src/sample-pdf';

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);
for (const format of ['module', 'classic'] as const) {
  test(`packed ${format} CDN example works without a bundler, import map or framework`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    await page.route('**/example.html', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: cdnExamples(version, baseURL)[format],
      }),
    );
    await page.goto('/example.html');
    const button = page.getByRole('button', {
      name: 'Create report · 0',
      exact: true,
    });
    await expect(button).toBeVisible();
    await button.click();
    await expect(
      page.getByRole('button', { name: 'Create report · 1', exact: true }),
    ).toBeVisible();
    expect(
      await page
        .locator('button')
        .evaluate((el) => getComputedStyle(el).borderRadius),
    ).not.toBe('0px');
    expect(requests.every((url) => url.startsWith(baseURL!))).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await expect(page.locator('#report-action')).toBeEmpty();
    expect(errors).toEqual([]);
  });

  test(`packed ${format} tooltip supports imperative APIs and cleanup`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    if (format === 'classic')
      await page.addScriptTag({ url: '/browser/revo-ui.global.js' });
    await page.evaluate(
      async ({ format, baseURL }) => {
        const ui =
          format === 'module'
            ? await import(/* @vite-ignore */ `${baseURL}/browser/revo-ui.js`)
            : (window as any).RevoUI;
        const trigger = document.createElement('button');
        trigger.textContent = 'CDN tooltip';
        trigger.style.margin = '100px';
        document.body.append(trigger);
        const controller = new ui.TooltipController();
        controller.bind(trigger, 'CDN details', {
          side: 'right',
          arrow: true,
          group: ui.createTooltipGroup({ delay: 0 }),
        });
        (window as any).cdnTooltip = controller;
      },
      { format, baseURL },
    );
    const trigger = page.getByRole('button', {
      name: 'CDN tooltip',
      exact: true,
    });
    await trigger.focus();
    const popup = page.getByRole('tooltip', {
      name: 'CDN details',
      exact: true,
    });
    await expect(popup).toBeVisible();
    await expect(popup).toHaveAttribute('data-side', 'right');
    await expect(popup).toHaveAttribute('data-arrow', 'true');
    await page.evaluate(() =>
      (window as any).cdnTooltip.setContent('Updated CDN details'),
    );
    await expect(page.getByRole('tooltip')).toHaveText('Updated CDN details');
    await page.evaluate(() => (window as any).cdnTooltip.destroy());
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(errors).toEqual([]);
  });

  test(`packed ${format} browser bundle starts the PDF engine and matching worker`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.addStyleTag({ url: '/styles.css' });
    await page.addStyleTag({ url: '/browser/pdf-viewer.css' });
    if (format === 'classic')
      await page.addScriptTag({ url: '/browser/revo-ui.global.js' });
    await page.evaluate(
      async ({ format, source, baseURL }) => {
        const ui =
          format === 'module'
            ? await import(/* @vite-ignore */ `${baseURL}/browser/revo-ui.js`)
            : (window as any).RevoUI;
        const host = document.createElement('div');
        host.className = 'rv-ui';
        document.body.append(host);
        const mount = ui.createFrameworkMount(host, () => {});
        mount.render(ui.uiComponents.PdfViewer, {
          source: new Uint8Array(source),
          workerSrc: `${baseURL}/browser/pdf.worker.min.mjs`,
          height: 500,
        });
      },
      { format, source: [...createSamplePdf()], baseURL },
    );
    await expect(
      page.locator('.page[data-page-number="1"] canvas'),
    ).toBeVisible({ timeout: 20000 });
    expect(errors).toEqual([]);
  });
}
