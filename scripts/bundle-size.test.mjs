import { test } from 'node:test';
import assert from 'node:assert/strict';
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
  assert(
    result.gzip <= limits['react-button'],
    `button baseline is ${result.gzip} gzip bytes`,
  );
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
