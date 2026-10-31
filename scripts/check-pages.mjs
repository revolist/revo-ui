import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pages = JSON.parse(await readFile(new URL('src/pages.json', root), 'utf8'));
const slug = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const paths = ['', 'components/', ...pages.components.map(page => `components/${slug(page.title)}/`), 'colors/', 'frameworks/', ...pages.frameworks.map(name => `frameworks/${slug(name)}/`)];
const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, paths.length);
const titles = new Set();
const descriptions = new Set();
for (const path of paths) {
  const html = await readFile(new URL(`dist/${path}index.html`, root), 'utf8');
  const canonical = `https://ui.rv-grid.com/${path}`;
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `Missing sitemap URL: ${path}`);
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `Missing canonical: ${path}`);
  assert.ok(html.includes(`property="og:url" content="${canonical}"`), `Missing social URL: ${path}`);
  assert.match(html, /<h1[\s>]/, `Missing rendered heading: ${path}`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title), `Missing or duplicate title: ${path}`);
  titles.add(title);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(description && !descriptions.has(description), `Missing or duplicate description: ${path}`);
  descriptions.add(description);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)[^"]*"/g)) {
    if (!href.includes('.')) assert.ok(paths.includes(href.slice(1)), `Unknown navigation target: ${href}`);
  }
  assert.ok(!/href="(?:\?page=|#component\/|#buttons")/.test(html), `Legacy navigation: ${path}`);
}
console.log(`Verified ${paths.length} static pages: rendered headings, unique titles, canonicals, social URLs, sitemap and clean navigation.`);
