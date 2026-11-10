import { apiRoutes } from './api-routes.mjs';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const pages = JSON.parse(await readFile(new URL('../src/pages.json', import.meta.url), 'utf8'));
const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const routes = [...apiRoutes, '', 'components/', ...pages.components.map(page => `components/${slug(page.title)}/`), 'colors/', 'accessibility/', 'frameworks/', ...pages.frameworks.map(name => `frameworks/${slug(name)}/`)];
const origin = 'https://ui.rv-grid.com';
const root = resolve(import.meta.dirname, '..');
const baseFlag = process.argv.indexOf('--base');
const base = baseFlag >= 0 ? process.argv[baseFlag + 1] : '/';
const started = performance.now();
await build({ root, base });
console.log(`Compiled gallery in ${((performance.now() - started) / 1000).toFixed(1)}s.`);
const server = await preview({ root, base, preview: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const address = server.httpServer.address();
  const url = `http://127.0.0.1:${address.port}${base === './' ? '/' : base}`;
  const renderStarted = performance.now();
  for (const route of routes) {
    await page.goto(`${url}${route}`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor();
    await page.waitForFunction(expected => document.querySelector('link[rel="canonical"]')?.getAttribute('href') === expected, `${origin}${base === './' ? '/' : base}${route}`);
    // Metadata effects run after the initial render. API data loads separately;
    // wait for its owning sections rather than a fixed 500ms network-idle delay.
    await page.locator('.api-workspace[aria-busy="true"], .component-api[aria-busy="true"]').waitFor({ state: 'detached' });
    if (route.startsWith('api/')) {
      // API metadata is committed by an effect after its data-backed heading.
      await page.waitForFunction(() => document.title === `${document.querySelector('h1')?.textContent} · Revo UI`);
    }
    await page.evaluate(() => document.fonts.ready);
    const html = await page.content();
    const destination = resolve(root, 'dist-gallery', route);
    await mkdir(destination, { recursive: true });
    await writeFile(resolve(destination, 'index.html'), html);
  }
  console.log(`Rendered ${routes.length} pages in ${((performance.now() - renderStarted) / 1000).toFixed(1)}s.`);
  await writeFile(resolve(root, 'dist-gallery/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${origin}${base === './' ? '/' : base}${route}</loc></url>`).join('\n')}\n</urlset>\n`);

  // Code-native brand artwork: no remote fonts, images or network dependencies.
  const logo = await readFile(resolve(root, 'public/favicon.svg'));
  const image = `data:image/svg+xml;base64,${logo.toString('base64')}`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#171717"><main style="padding:72px 80px;border:1px solid #e5e7eb;height:630px;box-sizing:border-box;background:linear-gradient(135deg,#fff 40%,#eff6ff)"><div style="display:flex;align-items:center;gap:20px;font-size:42px;font-weight:700"><img src="${image}" width="56" height="56"/>Revo UI</div><h1 style="font-size:65px;line-height:1.12;letter-spacing:-2px;margin:54px 0 24px">Components for finance,<br/>reporting, and projects.</h1><p style="font-size:24px;color:#52525b">React · Vue · Angular · Svelte · Preact · TypeScript</p><p style="font-size:21px;color:#2563eb;margin-top:42px">ui.rv-grid.com</p></main></body></html>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({ path: resolve(root, 'dist-gallery/og-image.png') });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<html><body style="margin:0;display:grid;place-items:center;width:180px;height:180px;background:white"><img src="${image}" width="128" height="128"/></body></html>`);
  await page.locator('img').evaluate(image => image.decode());
  await page.screenshot({ path: resolve(root, 'dist-gallery/apple-touch-icon.png') });
  await import('./check-pages.mjs');
  console.log(`Pre-rendered ${routes.length} pages, sitemap, social preview and touch icon.`);
} finally {
  await browser?.close();
  await new Promise((done, reject) => server.httpServer.close(error => error ? reject(error) : done()));
}
