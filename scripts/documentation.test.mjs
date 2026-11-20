import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderDocumentation, documentation } from './documentation.mjs';

test('guides render complete Markdown with heading IDs, code and tables', () => {
  for (const page of Object.values(documentation)) {
    if (!page.source) continue;
    const html = renderDocumentation(
      readFileSync(new URL(`../docs/${page.source}`, import.meta.url), 'utf8'),
    );
    assert.match(html, /<h1 id="/);
    assert.equal(html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1], page.title);
    assert.match(html, /<h2 id="/);
    assert.match(html, /<pre><code/);
    assert.match(html, /<table>/);
    assert(!html.includes('href="ssr.md'));
    assert(!html.includes('href="bundle-size.md'));
  }
});

test('relative guide links and heading anchors respect the deployment base', () => {
  const html = renderDocumentation(
    '[families](bundle-size.md#stylesheet-families)\n\n[SSR](ssr.md)\n\n## Example\n\n## Example',
    '/ui/',
  );
  assert(
    html.includes('href="/ui/frameworks/bundle-size/#stylesheet-families"'),
  );
  assert(html.includes('href="/ui/frameworks/ssr/"'));
  assert(html.includes('id="example"'));
  assert(html.includes('id="example-1"'));
});

test('raw HTML and executable links cannot become executable page markup', () => {
  const html = renderDocumentation(
    '<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n```html\n<button>Save</button>\n```',
  );
  assert(!html.includes('<script>'));
  assert(!html.includes('href="javascript:'));
  assert(html.includes('&lt;button&gt;Save&lt;/button&gt;'));
});


test('guide diagrams use safe local asset paths and the deployment base', () => {
  const html = renderDocumentation('![Theme flow](../public/assets/presets-flow.svg)\n\n![Unsafe](https://example.com/a.svg)\n\n![Escape](../public/assets/../secret.svg)', '/ui/');
  assert.match(html, /<img src="\/ui\/assets\/presets-flow\.svg" alt="Theme flow"/);
  assert(!html.includes('src="https://'));
  assert(!html.includes('secret.svg'));
});


test('theme guide jump links resolve to headings', () => {
  const html = renderDocumentation(readFileSync(new URL('../docs/presets.md', import.meta.url), 'utf8'));
  for (const anchor of ['start-with-a-switch', 'understand-the-schema', 'configure-other-behavior-with-json', 'use-the-same-files-in-vue', 'write-your-own-css', 'build-and-share-in-the-gallery', 'troubleshooting']) {
    assert.ok(html.includes(`href="#${anchor}"`), anchor);
    assert.ok(html.includes(`id="${anchor}"`), anchor);
  }
});
