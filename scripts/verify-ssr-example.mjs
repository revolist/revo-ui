import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// Start a starter's production server first, then pass its URL here.
// --client-only is reserved for the legacy Lovable React/Vite starter.
const url = process.argv[2];
assert(url, 'Usage: node scripts/verify-ssr-example.mjs URL [--client-only]');
const response = await fetch(url);
assert.equal(response.status, 200, 'Production page must respond successfully');
const html = await response.text();
if (!process.argv.includes('--client-only')) {
  assert.match(
    html,
    /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i,
    'Heading must be present in server HTML',
  );
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const failed = [];
  page.on('response', (response) => {
    if (response.status() >= 400)
      failed.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(url);
  await page.getByRole('heading', { level: 1 }).waitFor();
  const button = page.getByRole('button', { name: 'Save 0', exact: true });
  assert.equal(
    await button.evaluate((node) => getComputedStyle(node).display),
    'inline-flex',
    'The extracted Revo UI button stylesheet must be applied',
  );
  await button.click();
  await page.getByRole('button', { name: 'Save 1', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Save 0', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    'No mobile page overflow',
  );
  assert.deepEqual(failed, [], 'Page assets must load');
  assert.deepEqual(errors, [], 'No runtime, hydration or console errors');
  console.log(
    JSON.stringify({
      url,
      serverHeading: !process.argv.includes('--client-only'),
      click: 'Save 0 → Save 1',
      reload: 'Save 0',
      errors,
      failed,
    }),
  );
} finally {
  await browser.close();
}
