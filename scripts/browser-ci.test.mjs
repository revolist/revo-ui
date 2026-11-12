import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('Pages and coverage use the official browser image matching the frozen Playwright lock', () => {
  const lock = read('pnpm-lock.yaml');
  const version = lock.match(/^  playwright@([\d.]+):$/m)[1];
  for (const name of ['pages', 'coverage']) {
    const workflow = read(`.github/workflows/${name}.yml`);
    assert(
      workflow.includes(
        `container: mcr.microsoft.com/playwright:v${version}-noble`,
      ),
    );
    assert.doesNotMatch(
      workflow,
      /playwright install|apt-get|install-ci-browser/,
    );
    assert.match(
      workflow,
      /node --test (?:gallery\/)?scripts\/browser-ci.test.mjs/,
    );
  }
});

test('container CI retains gallery build, public package, browser, framework and SEO checks', () => {
  const coverage = read('.github/workflows/coverage.yml');
  for (const command of [
    'pnpm lint',
    'pnpm test',
    'pnpm pack:public',
    'pnpm test:public',
    'pnpm test:size',
    'pnpm test:api',
    'pnpm test:docs',
    'pnpm test:discovery',
    'pnpm build:demo',
    'pnpm test:browser',
    'pnpm test:frameworks',
    'pnpm test:tooltips',
    'pnpm test:cdn',
    'pnpm test:fields-styles',
  ]) {
    assert(coverage.includes(command), `keep ${command}`);
  }
  const pages = read('.github/workflows/pages.yml');
  assert.match(pages, /build:demo --base/);
  assert.match(pages, /seo.test.mjs gallery\/dist-gallery/);
  assert.match(pages, /actions\/upload-pages-artifact@v4/);
  assert.match(pages, /actions\/deploy-pages@v4/);
});
