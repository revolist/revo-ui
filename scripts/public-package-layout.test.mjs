import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  readdirSync,
  readFileSync,
  statSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from 'node:fs';
import { resolve, relative, basename } from 'node:path';

const project = resolve(import.meta.dirname, '..');
const { version } = JSON.parse(
  readFileSync(resolve(project, 'package.json'), 'utf8'),
);
const fixture = mkdtempSync(resolve(tmpdir(), 'revo-ui-package-layout-'));
after(() => rmSync(fixture, { recursive: true, force: true }));
execFileSync('tar', [
  '-xf',
  resolve(project, `artifacts/revolist-ui-${version}.tgz`),
  '-C',
  fixture,
]);
const root = resolve(fixture, 'package');
const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
const output = files(root);

test('public package ships one module worker for all PDF entry points', () => {
  const workers = output.filter((file) =>
    /pdf\.worker\..*\.(?:js|mjs)$/.test(file),
  );
  assert.deepEqual(
    workers.map((file) => relative(root, file)),
    ['browser/pdf.worker.min.mjs'],
  );
  assert(
    statSync(workers[0]).size > 1_000_000,
    'keep the actual PDF worker, not a stub',
  );
});

test('Angular declarations have a single compiled owner', () => {
  assert(
    !existsSync(resolve(root, 'angular-components')),
    'general TS emission must not duplicate ngc declarations',
  );
  assert(
    existsSync(
      resolve(root, 'unstyled/angular/angular-components/svg-button.js'),
    ),
  );
  const forwards = output.filter(
    (file) =>
      file.startsWith(resolve(root, 'unstyled/angular') + '/') &&
      file.endsWith('.d.ts'),
  );
  assert(
    forwards.length > 0,
    'direct Angular compilation also needs type forwards',
  );
  for (const file of forwards) {
    const declaration = readFileSync(file, 'utf8');
    assert.match(declaration, /^export \* from /);
    assert(declaration.length < 300, 'keep one canonical declaration owner');
  }
});

test('public package stays below the unpacked footprint budget with named APIs', () => {
  const bytes = output.reduce((total, file) => total + statSync(file).size, 0);
  const packed = statSync(
    resolve(project, `artifacts/revolist-ui-${version}.tgz`),
  ).size;
  const declarations = output
    .filter((file) => file.endsWith('.d.ts'))
    .reduce((total, file) => total + statSync(file).size, 0);
  assert(packed < 2_500_000, `packed public package is ${packed} bytes`);
  assert(bytes < 12_000_000, `unpacked public package is ${bytes} bytes`);
  assert(
    declarations < 1_600_000,
    `public declarations are ${declarations} bytes`,
  );
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );
  for (const framework of ['angular', 'svelte']) {
    for (const style of ['', '/unstyled']) {
      assert(manifest.exports[`./${framework}/svg-button${style}`]);
    }
  }
});

test('bundlers resolve the shared worker from styled and unstyled PDF entry points', async () => {
  const { build } = await import('vite');
  for (const mode of ['', 'unstyled/']) {
    const result = await build({
      configFile: false,
      root: project,
      logLevel: 'silent',
      base: './',
      build: {
        write: false,
        assetsInlineLimit: 0,
        rolldownOptions: {
          input: resolve(root, `${mode}pdf-viewer/index.js`),
          preserveEntrySignatures: 'strict',
          external: /^pdfjs-dist(?:\/|$)/,
        },
      },
    });
    const output = (Array.isArray(result) ? result : [result]).flatMap(
      (bundle) => bundle.output,
    );
    const worker = output.find(
      (file) => file.type === 'asset' && /pdf\.worker/.test(file.fileName),
    );
    assert(worker, `${mode || 'styled'} must emit its module worker`);
    assert(
      worker.source.length > 1_000_000,
      'do not inline or omit the real worker',
    );
    assert(
      output.some(
        (file) =>
          file.type === 'chunk' &&
          file.code.includes(basename(worker.fileName)),
      ),
    );
  }
});
