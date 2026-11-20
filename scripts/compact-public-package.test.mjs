import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import {
  forwardPublicDeclaration,
  sharePdfWorker,
  compactAngularRuntime,
} from './compact-public-package.mjs';

function fixture(run) {
  const root = mkdtempSync(resolve(tmpdir(), 'ui-package-layout-'));
  const write = (name, value) => {
    const file = resolve(root, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, value);
  };
  return Promise.resolve()
    .then(() => run(root, write))
    .finally(() => rmSync(root, { recursive: true, force: true }));
}

test('type forwards retain default and named API exports without copying declarations', () =>
  fixture((root, write) => {
    write(
      'api.d.ts',
      'export interface Props { value: string }\ndeclare const control: Props;\nexport default control;\n',
    );
    forwardPublicDeclaration(root, resolve(root, 'unstyled'), 'api');
    assert.equal(
      readFileSync(resolve(root, 'unstyled/api.d.ts'), 'utf8'),
      "export * from '../api.js';\nexport { default } from '../api.js';\n",
    );
    write('named.d.ts', 'export declare const defaultLabel: string;\n');
    forwardPublicDeclaration(root, resolve(root, 'unstyled'), 'named');
    assert.equal(
      readFileSync(resolve(root, 'unstyled/named.d.ts'), 'utf8'),
      "export * from '../named.js';\n",
    );
  }));

test('generated PDF URLs resolve to the same public module worker from every layout', () =>
  fixture((root, write) => {
    const name = 'pdf.worker.min-abc.js';
    write('browser/pdf.worker.min.mjs', 'export const worker = true;');
    for (const directory of ['assets', 'unstyled/assets', 'browser/assets'])
      write(`${directory}/${name}`, 'generated worker');
    write(
      '_chunks/pdf.js',
      `export const url = new URL('../assets/${name}', import.meta.url);`,
    );
    write(
      'unstyled/_chunks/pdf.js',
      `export const url = new URL('../assets/${name}', import.meta.url);`,
    );
    write(
      'browser/ui.js',
      `export const url = new URL('assets/${name}', import.meta.url);`,
    );
    sharePdfWorker(root);
    assert.match(
      readFileSync(resolve(root, '_chunks/pdf.js'), 'utf8'),
      /\.\.\/browser\/pdf\.worker\.min\.mjs/,
    );
    assert.match(
      readFileSync(resolve(root, 'unstyled/_chunks/pdf.js'), 'utf8'),
      /\.\.\/\.\.\/browser\/pdf\.worker\.min\.mjs/,
    );
    assert.match(
      readFileSync(resolve(root, 'browser/ui.js'), 'utf8'),
      /\.\/pdf\.worker\.min\.mjs/,
    );
    assert(!existsSync(resolve(root, 'assets', name)));
    assert(!existsSync(resolve(root, 'unstyled/assets', name)));
    assert(!existsSync(resolve(root, 'browser/assets', name)));
  }));

test('Angular compaction preserves class names, decorator metadata and pure markers', () =>
  fixture(async (root, write) => {
    for (const mode of ['angular', 'unstyled/angular'])
      write(
        `${mode}/component.js`,
        `
    export class NamedButton {
      label;
      static definition = /* @__PURE__ */ createDefinition({ type: NamedButton, inputs: { label: 'label' } });
    }
  `,
      );
    await compactAngularRuntime(root);
    const code = readFileSync(resolve(root, 'angular/component.js'), 'utf8');
    assert(code.length < 220);
    assert.match(code, /class NamedButton/);
    assert.match(code, /@__PURE__/);
    assert.match(code, /inputs:\{label:["']label["']\}/);
  }));
