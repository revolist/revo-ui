import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist-gallery');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
assert.match(html, /<title>Revo UI — Components for Finance, Reporting/);
assert.match(html, /name="description" content="Build financial dashboards/);
assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
assert.match(html, /rel="canonical" href="https:\/\/ui\.rv-grid\.com\/"/);
assert.match(html, /<h1[^>]*>Components for finance,/);
assert.match(html, /href="https:\/\/github\.com\/revolist\/revo-ui"/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(html, /property="og:image" content="https:\/\/ui\.rv-grid\.com\/og-image\.png"/);
const structured = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(structured['@context'], 'https://schema.org');
assert.equal(structured['@graph'][0].url, 'https://ui.rv-grid.com/');
for (const file of ['favicon.svg', 'apple-touch-icon.png', 'og-image.png', 'robots.txt', 'sitemap.xml']) {
  assert.ok((await stat(resolve(dist, file))).size > 0, file);
}
const image = await readFile(resolve(dist, 'og-image.png'));
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<loc>https:\/\/ui\.rv-grid\.com\/<\/loc>/);
assert.doesNotMatch(sitemap, /<loc>[^<]*#/);
console.log('SEO checks passed: rendered content, metadata, canonical, structured data, icons, social artwork, robots and sitemap.');

const article = await readFile(resolve(dist, 'accessibility/index.html'), 'utf8');
assert.match(article, /<title>Accessible UI components: a practical guide/);
assert.match(article, /rel="canonical" href="https:\/\/ui\.rv-grid\.com\/accessibility\/"/);
assert.match(article, /property="og:type" content="article"/);
assert.match(article, /<article[^>]*aria-labelledby="accessibility-title"/);
assert.match(article, /id="keyboard-and-focus"/);
assert.match(article, /id="integration-checklist"/);
assert.match(html, /href="\/accessibility\/"/);
assert.match(sitemap, /<loc>https:\/\/ui\.rv-grid\.com\/accessibility\/<\/loc>/);
const articleSchema = JSON.parse(article.match(/<script id="accessibility-article-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(articleSchema['@type'], 'TechArticle');
assert.equal(articleSchema.url, 'https://ui.rv-grid.com/accessibility/');
assert.equal(articleSchema.headline, 'Accessible interfaces, built into everyday work.');
assert.equal(articleSchema.inLanguage, 'en');
console.log('Accessibility article SEO passed: rendered article, canonical, discovery, sitemap and TechArticle metadata.');
