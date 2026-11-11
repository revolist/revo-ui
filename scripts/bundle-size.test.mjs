import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  checkBudgets,
  measureEntry,
  measureConsumer,
  limits,
  root,
} from './bundle-size.mjs';

test('budgets reject growth and missing measurements instead of updating limits', () => {
  assert.doesNotThrow(() =>
    checkBudgets({ sample: { gzip: 100 } }, { sample: 100 }),
  );
  assert.throws(
    () => checkBudgets({ sample: { gzip: 101 } }, { sample: 100 }),
    /exceeds 100/,
  );
  assert.throws(() => checkBudgets({}, { sample: 100 }), /measurement missing/);
  assert.throws(
    () => checkBudgets({ sample: { gzip: NaN } }, { sample: 100 }),
    /invalid gzip/,
  );
});

test('a published React button import does not retain dropdown implementation', async () => {
  const result = await measureEntry('react.js', ['SvgButton']);
  assert(
    !result.code.includes('combobox'),
    'A button must not retain shared Select/Dropdown code',
  );
  assert(result.code.includes('.rv-btn'), 'button includes its own CSS');
  assert(
    !result.code.includes('.revo-calendar__header{'),
    'unused Calendar CSS is removed',
  );
  assert(!result.code.includes('.rv-ai-prompt'), 'unused AI CSS is removed');
  assert(
    result.gzip <= limits['react-button'],
    `button baseline is ${result.gzip} gzip bytes`,
  );
});

test('a Calendar import includes its family CSS without retaining AI styles', async () => {
  const { code } = await measureEntry('react.js', ['Calendar']);
  assert(code.includes('.rv-btn'));
  assert(code.includes('.revo-calendar__header{'));
  assert(!code.includes('.rv-ai-prompt'));
});

test('standalone feedback and confirmation components retain their owning family styles', async () => {
  for (const [name, selector] of [
    ['Avatar', '.avatar-cell{'],
    ['StatusBadge', '.rv-status-badge{'],
    ['ConfirmDialog', '.rv-dialog__surface{'],
  ]) {
    const { code } = await measureEntry('react.js', [name]);
    assert(code.includes(selector), `${name} requires ${selector}`);
  }
});

test('published React components import and render on the server without a DOM or CSS loader', () => {
  const html = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { createElement } from 'react';
    import { renderToString } from 'react-dom/server';
    import { SvgButton, Calendar } from './dist/react.js';
    if (typeof document !== 'undefined') throw new Error('Unexpected DOM');
    console.log(renderToString(createElement(SvgButton, {label: 'Save'})));
    console.log(renderToString(createElement(Calendar, {month: '2026-11-01', focusedDate: '2026-11-11'})));
  `,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.match(html, /data-rv-react-host="SvgButton"/);
  assert.match(html, /data-rv-react-host="Calendar"/);
});

test('retained controls keep their native registration after production tree-shaking', async () => {
  const { code } = await measureEntry('native-control.js', [
    'Input',
    'Select',
    'ButtonControl',
    'nativeControlTag',
  ]);
  const ui = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  );
  assert.equal(ui.nativeControlTag(ui.Input), 'input');
  assert.equal(ui.nativeControlTag(ui.Select), 'select');
  assert.equal(ui.nativeControlTag(ui.ButtonControl), 'button');
});

test('direct Select imports retain native metadata without importing its native-control alias', async () => {
  const { code } = await measureConsumer(`
    export { Select } from ${JSON.stringify(resolve(root, 'dist/select.js'))};
    export { nativeControlTag } from ${JSON.stringify(resolve(root, 'dist/control-presentation.js'))};
  `);
  const ui = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  );
  assert.equal(ui.nativeControlTag(ui.Select), 'select');
});
