import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist-gallery');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
assert.match(
  html,
  /<title>Revo UI — Components for Data-Rich Applications<\/title>/,
);
assert.match(
  html,
  /name="description" content="Build data-rich applications with charts, AI chat, PDF viewing, timelines and date controls/,
);
assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
assert.match(html, /rel="canonical" href="https:\/\/ui\.rv-grid\.com\/"/);
assert.match(
  html,
  /<h1[^>]*>Components for<br\s*\/?\s*>data-rich applications\.<\/h1>/,
);
assert.match(html, /href="https:\/\/github\.com\/revolist\/revo-ui"/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(
  html,
  /property="og:image" content="https:\/\/ui\.rv-grid\.com\/og-image\.png"/,
);
const structured = JSON.parse(
  html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
);
assert.equal(structured['@context'], 'https://schema.org');
assert.equal(structured['@graph'][0].url, 'https://ui.rv-grid.com/');
for (const file of [
  'favicon.svg',
  'apple-touch-icon.png',
  'og-image.png',
  'robots.txt',
  'sitemap.xml',
]) {
  assert.ok((await stat(resolve(dist, file))).size > 0, file);
}
const image = await readFile(resolve(dist, 'og-image.png'));
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<loc>https:\/\/ui\.rv-grid\.com\/<\/loc>/);
assert.doesNotMatch(sitemap, /<loc>[^<]*#/);
console.log(
  'SEO checks passed: rendered content, metadata, canonical, structured data, icons, social artwork, robots and sitemap.',
);

const article = await readFile(
  resolve(dist, 'accessibility/index.html'),
  'utf8',
);
assert.match(article, /<title>Accessible UI components: a practical guide/);
assert.match(
  article,
  /rel="canonical" href="https:\/\/ui\.rv-grid\.com\/accessibility\/"/,
);
assert.match(article, /property="og:type" content="article"/);
assert.match(article, /<article[^>]*aria-labelledby="accessibility-title"/);
assert.match(article, /id="keyboard-and-focus"/);
assert.match(article, /id="integration-checklist"/);
assert.match(
  await readFile(resolve(dist, 'frameworks/index.html'), 'utf8'),
  /href="\/accessibility\/"/,
);
assert.match(
  sitemap,
  /<loc>https:\/\/ui\.rv-grid\.com\/accessibility\/<\/loc>/,
);
const articleSchema = JSON.parse(
  article.match(
    /<script id="accessibility-article-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )[1],
);
assert.equal(articleSchema['@type'], 'TechArticle');
assert.equal(articleSchema.url, 'https://ui.rv-grid.com/accessibility/');
assert.equal(
  articleSchema.headline,
  'Accessible interfaces, built into everyday work.',
);
assert.equal(articleSchema.inLanguage, 'en');
console.log(
  'Accessibility article SEO passed: rendered article, canonical, discovery, sitemap and TechArticle metadata.',
);

const documentation = JSON.parse(
  await readFile(new URL('../src/documentation.json', import.meta.url), 'utf8'),
);
const pages = JSON.parse(
  await readFile(new URL('../src/pages.json', import.meta.url), 'utf8'),
);
const hub = await readFile(resolve(dist, 'frameworks/index.html'), 'utf8');
const guideMetadata = [
  ...Object.entries(documentation).map(([id, doc]) => ({
    id,
    title: `${doc.seoTitle} · Revo UI`,
    headline: doc.title,
    description: doc.description,
    label: doc.label,
    section: doc.category,
  })),
  ...pages.frameworks.map((name) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    title: `${name} UI components and integration · Revo UI`,
    headline: `${name} integration`,
    label: name,
    section: 'Framework adapters',
    description: `Integrate Revo UI components with ${name}. Start with a small typed example, then follow the linked SSR, styling and bundle-size guides.`,
  })),
];
for (const guide of guideMetadata) {
  const path = `frameworks/${guide.id}/`;
  const url = `https://ui.rv-grid.com/${path}`;
  const html = await readFile(resolve(dist, `${path}index.html`), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.equal(
    (title?.match(/Revo UI/g) ?? []).length,
    1,
    `${path}: duplicate branding`,
  );
  assert.equal(title, guide.title, `${path}: search title`);
  assert.ok(
    html.includes(`name="description" content="${guide.description}"`),
    `${path}: unique guide description`,
  );
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, path);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), path);
  assert.ok(html.includes(`property="og:url" content="${url}"`), path);
  assert.ok(
    html.includes(`property="og:title" content="${guide.title}"`),
    path,
  );
  assert.ok(
    html.includes(`name="twitter:title" content="${guide.title}"`),
    path,
  );
  assert.ok(
    html.includes(`property="og:description" content="${guide.description}"`),
    path,
  );
  assert.match(html, /property="og:type" content="article"/, path);
  assert.match(
    html,
    /name="robots" content="index, follow, max-image-preview:large"/,
    path,
  );
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, path);
  assert.match(
    html,
    /<article[\s>]/,
    `${path}: rendered article without JavaScript`,
  );
  assert.match(
    html,
    /<pre[\s>]/,
    `${path}: rendered example without JavaScript`,
  );
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), path);
  assert.ok(hub.includes(`href="/${path}"`), `${path}: crawlable hub link`);
  assert.match(
    html,
    /<nav[^>]*aria-label="Breadcrumb"/,
    `${path}: visible breadcrumbs`,
  );
  const data = html.match(
    /<script id="documentation-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(data, `${path}: structured article metadata`);
  const schema = JSON.parse(data);
  assert.equal(schema['@context'], 'https://schema.org');
  const article = schema['@graph'].find(
    (item) => item['@type'] === 'TechArticle',
  );
  assert.equal(article.url, url);
  assert.equal(article.mainEntityOfPage, url);
  assert.equal(article.headline, guide.headline);
  assert.equal(article.description, guide.description);
  assert.equal(article.articleSection, guide.section);
  assert.equal(article.inLanguage, 'en');
  const crumbs = schema['@graph'].find(
    (item) => item['@type'] === 'BreadcrumbList',
  );
  assert.deepEqual(
    crumbs.itemListElement.map(({ position, name, item }) => ({
      position,
      name,
      item,
    })),
    [
      { position: 1, name: 'Docs', item: 'https://ui.rv-grid.com/frameworks/' },
      { position: 2, name: guide.label, item: url },
    ],
  );
}
console.log(
  `Documentation SEO passed: ${guideMetadata.length} pre-rendered guides, unique search metadata, indexability, discovery, article schema and breadcrumbs.`,
);
