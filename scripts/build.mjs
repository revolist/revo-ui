import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const baseFlag = process.argv.indexOf('--base');
const base = baseFlag >= 0 ? process.argv[baseFlag + 1] : '/';
await build({ root, base });
const server = await preview({ root, base, preview: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}${base === './' ? '/' : base}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.home-hero h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const html = await page.content();
  if (!html.includes('Components for finance,') || !html.includes('rel="canonical"')) throw new Error('Homepage static rendering failed');
  await writeFile(resolve(root, 'dist/index.html'), html);

  // Code-native brand artwork: no remote fonts, images or network dependencies.
  const logo = await readFile(resolve(root, 'public/favicon.svg'));
  const image = `data:image/svg+xml;base64,${logo.toString('base64')}`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#171717"><main style="padding:72px 80px;border:1px solid #e5e7eb;height:630px;box-sizing:border-box;background:linear-gradient(135deg,#fff 40%,#eff6ff)"><div style="display:flex;align-items:center;gap:20px;font-size:42px;font-weight:700"><img src="${image}" width="56" height="56"/>Revo UI</div><h1 style="font-size:65px;line-height:1.12;letter-spacing:-2px;margin:54px 0 24px">Components for finance,<br/>reporting, and projects.</h1><p style="font-size:24px;color:#52525b">React · Vue · Angular · Svelte · Preact · TypeScript</p><p style="font-size:21px;color:#2563eb;margin-top:42px">ui.rv-grid.com</p></main></body></html>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({ path: resolve(root, 'dist/og-image.png') });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<html><body style="margin:0;display:grid;place-items:center;width:180px;height:180px;background:white"><img src="${image}" width="128" height="128"/></body></html>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({ path: resolve(root, 'dist/apple-touch-icon.png') });
  console.log('Pre-rendered homepage, social preview and touch icon.');
} finally {
  await browser?.close();
  await new Promise((done, reject) => server.httpServer.close(error => error ? reject(error) : done()));
}
