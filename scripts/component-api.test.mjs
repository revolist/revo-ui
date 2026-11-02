import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { componentApi, apiModule } from './component-api.mjs';

const gallery = resolve(import.meta.dirname, '..');
const api = componentApi(resolve(gallery, '../..'), gallery);
const component = (name) => api.find((item) => item.name === name);

test('documents every catalog component and maps it to a live family', () => {
  const catalog = readFileSync(
    resolve(gallery, '../../packages/ui/src/component-catalog.ts'),
    'utf8',
  );
  const names = [...catalog.matchAll(/^  (\w+):/gm)].map((match) => match[1]);
  assert.deepEqual(
    api.map((item) => item.name).sort(),
    [...names, 'Select'].sort(),
  );
  assert.equal(new Set(api.map((item) => item.name)).size, api.length);
  for (const item of api) {
    assert.ok(item.families.length, item.name);
    for (const member of [...item.props, ...item.events])
      assert.ok(member.type, `${item.name}.${member.name}`);
  }
  assert.ok(component('HtmlEditor').families.includes('HTML Editor'));
  assert.ok(
    component('Select').families.includes('Selects, chips and resources'),
  );
});

test('separates declared props and callbacks from inherited HTML contracts', () => {
  const button = component('Button');
  assert.ok(
    button.props.some(
      (prop) => prop.name === 'busy' && !prop.inherited && !prop.required,
    ),
  );
  assert.ok(
    button.props.some((prop) => prop.name === 'disabled' && prop.inherited),
  );
  assert.ok(
    button.events.some((event) => event.name === 'onClick' && event.inherited),
  );
  assert.ok(
    component('PdfViewer').events.some(
      (event) =>
        event.name === 'onReady' && event.type.includes('PdfViewerController'),
    ),
  );
  assert.equal(button.methods.length, 0);
});

test('documents controller signatures reachable from callbacks without private implementation', () => {
  const methods = component('PdfViewer').methods;
  const page = methods.find(
    (method) => method.name === 'PdfViewerController.goToPage',
  );
  assert.ok(page.type.includes('number'));
  assert.ok(page.via.includes('callback'));
  assert.ok(
    methods.some((method) => method.name === 'PdfViewerController.destroy'),
  );
  assert.ok(
    !methods.some((method) =>
      /\.(update|report|initialize|releaseDocument|snapshot)$/.test(
        method.name,
      ),
    ),
  );
});

test('compact lazy module preserves all API information', async () => {
  const module = apiModule(api);
  assert.ok(module.length < JSON.stringify(api).length / 2);
  const { default: restored } = await import(
    `data:text/javascript;base64,${Buffer.from(module).toString('base64')}`
  );
  assert.deepEqual(restored, api);
});
