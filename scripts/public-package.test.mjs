import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';
import { validatePublishTarget } from './publish-target.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceManifest = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8'),
);
const version = sourceManifest.version;
const archive = resolve(root, `artifacts/revolist-ui-${version}.tgz`);
assert.ok(existsSync(archive), 'Run pnpm pack:public before test:public');
const fixture = mkdtempSync(join(tmpdir(), 'revolist-ui-public-'));
after(() => rmSync(fixture, { recursive: true, force: true }));
execFileSync('tar', ['-xf', archive, '-C', fixture]);
const packageRoot = join(fixture, 'package');
const manifest = JSON.parse(
  readFileSync(join(packageRoot, 'package.json'), 'utf8'),
);
const modules = join(fixture, 'node_modules');
mkdirSync(join(modules, '@revolist'), { recursive: true });
symlinkSync(packageRoot, join(modules, '@revolist/ui'), 'dir');
// Resolve only declared public dependencies; no private @revolist workspace
// package is visible to the extracted archive or consumer below.
for (const name of [
  ...Object.keys(manifest.dependencies),
  ...Object.keys(manifest.peerDependencies),
  '@types/react',
  '@types/react-dom',
  '@angular/compiler',
  'react-dom',
  'happy-dom',
]) {
  const target = resolve(root, 'node_modules', name);
  if (!existsSync(target)) continue;
  const link = join(modules, name);
  mkdirSync(dirname(link), { recursive: true });
  if (!existsSync(link)) symlinkSync(target, link, 'dir');
}
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}

test('archive exposes real typed ESM/CSS exports without private dependencies or source compilers', () => {
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.publishConfig.access, 'public');
  assert.equal(manifest.publishConfig.registry, 'https://registry.npmjs.org/');
  validatePublishTarget(manifest, 'https://registry.npmjs.org/', 'public');
  assert.throws(() =>
    validatePublishTarget(
      manifest,
      'https://npm.pkg.github.com/',
      'restricted',
    ),
  );
  for (const key of [
    'description',
    'author',
    'homepage',
    'repository',
    'bugs',
    'keywords',
  ]) {
    assert.deepEqual(
      manifest[key],
      sourceManifest[key],
      `Published ${key} must preserve package metadata`,
    );
  }
  assert.equal(
    manifest.repository.url,
    'https://github.com/revolist/revo-ui.git',
  );
  assert.equal(
    readFileSync(join(packageRoot, 'README.md'), 'utf8'),
    readFileSync(resolve(root, 'README.md'), 'utf8'),
  );
  assert(
    !Object.keys(manifest.exports).some((name) => name.startsWith('./demo/')),
  );
  assert.equal(manifest.license, 'MIT');
  assert.match(
    readFileSync(join(packageRoot, 'LICENSE'), 'utf8'),
    /MIT License/,
  );
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.peerDependencies.preact, undefined);
  assert.equal(manifest.dependencies.preact, undefined);
  assert.equal(manifest.peerDependenciesMeta.preact, undefined);
  assert.equal(existsSync(join(modules, 'preact')), false);
  assert.ok(existsSync(join(packageRoot, '_vendor/preact/LICENSE')));
  assert.ok(!JSON.stringify(manifest.dependencies).includes('workspace:'));
  assert.ok(
    Object.keys(manifest.dependencies).every(
      (name) => !name.startsWith('@revolist/'),
    ),
  );
  for (const [name, entry] of Object.entries(manifest.exports)) {
    for (const file of typeof entry === 'string'
      ? [entry]
      : Object.values(entry)) {
      assert.ok(existsSync(join(packageRoot, file)), `${name}: ${file}`);
      assert.ok(
        !/\.tsx?$/.test(file) || file.endsWith('.d.ts'),
        `${name} must not expose TS source`,
      );
    }
  }
  for (const file of files(packageRoot)) {
    assert.ok(!/\.(?:test|spec)\./.test(file), `test shipped: ${file}`);
    if (/\.(?:js|d\.ts)$/.test(file))
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /(?:from\s*|import\s*\()['"]preact(?:\/[^'"]*)?['"]/,
      );
    if (/\.(?:js|d\.ts)$/.test(file))
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /(?:from\s*|import\s*\()['"]@revolist\/(?:dates|chart-utils|data-query|ui)(?:\/[^'"]*)?['"]/,
      );
  }
  assert.match(
    readFileSync(join(packageRoot, 'styles.css'), 'utf8'),
    /\.rv-btn/,
  );
  assert.match(
    readFileSync(join(packageRoot, 'angular/angular-control.js'), 'utf8'),
    /ɵɵngDeclareDirective/,
  );
  assert.match(
    readFileSync(join(packageRoot, 'angular/angular-control.d.ts'), 'utf8'),
    /ɵdir/,
  );
});

test('an isolated consumer executes native, React, Vue and Svelte adapters from the archive', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { Window } from 'happy-dom';
    const window = new Window();
    globalThis.window = window; globalThis.document = window.document;
    const ui = await import('@revolist/ui');
    const button = ui.createControl(document, 'button', { onClick: () => button.dataset.clicked = 'true' });
    assert.equal(button.className, 'rv-btn'); button.click(); assert.equal(button.dataset.clicked, 'true');
    const React = await import('react'); const { renderToStaticMarkup } = await import('react-dom/server');
    const { Input } = await import('@revolist/ui/react-control');
    assert.match(renderToStaticMarkup(React.createElement(Input, { type: 'checkbox', defaultChecked: true })), /rv-checkbox/);
    const { vRvControl } = await import('@revolist/ui/vue-control');
    const input = document.createElement('input'); vRvControl.beforeMount(input); assert.equal(input.className, 'rv-control');
    const { rvControl } = await import('@revolist/ui/svelte-control');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
    const action = rvControl(checkbox); assert.equal(checkbox.className, 'rv-checkbox'); action.destroy();
    const { UiComponent, defaultPdfViewerText } = await import('@revolist/ui/svelte');
    assert.equal(defaultPdfViewerText.open, 'Open PDF');
    const { render } = await import('svelte/server');
    const html = render(UiComponent, { props: { component: 'Button', props: {} } }).body;
    assert.match(html, /data-rv-svelte-host/);
    const { Button } = await import('@revolist/ui/react');
    assert.match(renderToStaticMarkup(React.createElement(Button, null, 'Save')), /data-rv-react-host/);
    window.happyDOM.abort();
  `;
  writeFileSync(join(fixture, 'consumer.mjs'), script);
  execFileSync(process.execPath, [join(fixture, 'consumer.mjs')], {
    cwd: fixture,
    stdio: 'pipe',
  });
});

test('an isolated TypeScript consumer resolves published declarations without workspace aliases', () => {
  const allPublicTypes = Object.entries(manifest.exports)
    .filter(([, entry]) => typeof entry === 'object' && entry.types)
    .map(
      ([name], index) =>
        `import type * as PublicEntry${index} from '${manifest.name}${name === '.' ? '' : name.slice(1)}';`,
    )
    .join('\n');
  writeFileSync(
    join(fixture, 'consumer.ts'),
    allPublicTypes +
      `
    import { createControl, type ControlTag } from '@revolist/ui';
    import { Input } from '@revolist/ui/react-control';
    import { createElement } from 'react';
    import { Dropdown, FieldGroupHeading, FieldGroup, FieldList, FieldRow, PdfViewer, PdfViewerToolbar } from '@revolist/ui/react';
    createElement(PdfViewer, { workerSrc: '/worker.mjs', toolbar: { buttons: { print: false } },
      renderToolbar: (_controller, _state, props) => createElement(PdfViewerToolbar, props) });
    import type { PdfViewerProps as AngularPdfProps } from '@revolist/ui/angular';
    import type { PdfViewerProps as SveltePdfProps } from '@revolist/ui/svelte';
    const pdfProps: AngularPdfProps & SveltePdfProps = { workerSrc: '/worker.mjs', toolbar: ['search'] };
    void pdfProps;
    const dropdown = createElement(Dropdown, {
      source: [{ value: 'a', label: 'Alpha' }],
      renderOption: option => createElement('strong', null, option.label),
    });
    void dropdown;
    createElement(FieldGroupHeading, { actions: createElement('button', null, 'Add') });
    createElement(FieldGroup, { heading: createElement('strong', null, 'Heading') });
    createElement(FieldList, { empty: true, placeholder: createElement('em', null, 'Empty') });
    createElement(FieldRow, { indicator: createElement('span', null, 'Drop') });
    import { vRvControl } from '@revolist/ui/vue-control';
    import { rvControl } from '@revolist/ui/svelte-control';
    import { UiControlDirective } from '@revolist/ui/angular-control';
    const tag: ControlTag = 'button'; const button: HTMLButtonElement = createControl(document, tag);
    void [button, Input, vRvControl, rvControl, UiControlDirective];
  `,
  );
  writeFileSync(
    join(fixture, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: false,
        types: [],
        noEmit: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      },
      files: ['consumer.ts'],
    }),
  );
  execFileSync(
    process.execPath,
    [
      fileURLToPath(import.meta.resolve('typescript/bin/tsc')),
      '-p',
      join(fixture, 'tsconfig.json'),
    ],
    { cwd: fixture, stdio: 'pipe' },
  );
});
