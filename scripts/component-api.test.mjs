import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { componentApi, apiModule } from './component-api.mjs';

const gallery = resolve(import.meta.dirname, '..');
const api = componentApi(gallery, gallery);
const component = (name) => api.find((item) => item.name === name);

test('documents every catalog component and maps it to a live family', () => {
  const catalog = readFileSync(
    resolve(gallery, 'package/component-catalog.ts'),
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
    component('Select').families.includes('Multi/selects, autocomplete'),
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
  assert.doesNotMatch(
    module,
    /\/(?:Users|home|private\/tmp)\//,
    'Published metadata must not contain local filesystem paths',
  );
  const { default: restored } = await import(
    `data:text/javascript;base64,${Buffer.from(module).toString('base64')}`
  );
  assert.deepEqual(restored, api);
});

const walkTypes = (component, member) => {
  const types = new Map(component.types.map((type) => [type.id, type]));
  const found = new Map();
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.typeId && !found.has(value.typeId)) {
      assert.ok(types.has(value.typeId), `Missing type ${value.typeId}`);
      const type = types.get(value.typeId);
      found.set(value.typeId, type);
      visit(type);
    }
    for (const [key, child] of Object.entries(value))
      if (key !== 'typeId') visit(child);
  };
  visit(member);
  return [...found.values()];
};

test('every library-declared prop and callback has a source or editorial description', () => {
  for (const component of api)
    for (const member of [...component.props, ...component.events])
      if (!member.inherited)
        assert.ok(
          member.description.trim(),
          `${component.name}.${member.name}`,
        );
});

test('resolves named unions and nested configuration fields across products', () => {
  const pdf = component('PdfViewer');
  const zoom = pdf.props.find((prop) => prop.name === 'initialZoom');
  const zoomType = pdf.types.find((type) => type.id === zoom.typeId);
  assert.match(zoomType.definition, /number/);
  assert.match(zoomType.definition, /page-width/);
  assert.match(zoom.description, /1 = 100%/);
  const dropdown = component('Dropdown');
  const config = dropdown.props.find((prop) => prop.name === 'config');
  assert.ok(
    walkTypes(dropdown, config).some((type) =>
      type.properties.some((field) => field.name === 'multiSelect'),
    ),
  );
  const typography = component('TypographyControls');
  assert.ok(
    walkTypes(
      typography,
      typography.props.find((prop) => prop.name === 'value'),
    ).some((type) =>
      type.properties.some((field) => field.name === 'fontFamily'),
    ),
  );
  const icons = typography.props.find((prop) => prop.name === 'icons');
  assert.ok(
    walkTypes(typography, icons).some((type) =>
      type.properties.some((field) => field.name === 'bold'),
    ),
  );
  const result = component('AiResultView');
  const variants = walkTypes(
    result,
    result.props.find((prop) => prop.name === 'result'),
  );
  assert.ok(variants.some((type) => type.name === 'AiTableResult'));
  assert.ok(variants.some((type) => type.name === 'AiTextResult'));
});

test('resolves array items and callback arguments without exposing private controller state', () => {
  const list = component('ReorderList');
  assert.ok(
    walkTypes(
      list,
      list.props.find((prop) => prop.name === 'items'),
    ).some((type) => type.element?.type === 'T'),
  );
  const pdf = component('PdfViewer');
  const ready = walkTypes(
    pdf,
    pdf.events.find((event) => event.name === 'onReady'),
  );
  assert.ok(
    ready.some((type) =>
      type.calls.some((call) =>
        call.parameters.some((parameter) => parameter.name === 'controller'),
      ),
    ),
  );
  const controller = ready.find((type) => type.name === 'PdfViewerController');
  assert.ok(controller.properties.some((prop) => prop.name === 'goToPage'));
  assert.ok(
    !controller.properties.some((prop) =>
      ['state', 'initialize', 'report', 'update', 'worker'].includes(prop.name),
    ),
  );
  for (const component of api)
    for (const member of [
      ...component.props,
      ...component.events,
      ...component.methods,
    ])
      walkTypes(component, member);
});

test('tooltip reference includes state, positioning, asynchronous content and lifecycle contracts', () => {
  const tooltip = component('Tooltip');
  for (const name of [
    'side',
    'align',
    'sideOffset',
    'collisionBoundary',
    'open',
    'group',
    'loadContent',
    'appendTo',
    'arrow',
    'keepMounted',
  ]) {
    assert.ok(
      tooltip.props.some((prop) => prop.name === name),
      name,
    );
  }
  for (const name of [
    'onOpenChange',
    'onBeforeOpenChange',
    'onOpenChangeComplete',
    'onContentLoad',
    'onError',
  ]) {
    assert.ok(
      tooltip.events.some((event) => event.name === name),
      name,
    );
  }
});

test('registered Select preserves documented value and selection contracts', () => {
  const select = component('Select');
  assert(
    select.props.some(
      (prop) => prop.name === 'value' && prop.type.includes('string'),
    ),
  );
  assert(select.props.some((prop) => prop.name === 'multiple'));
  assert(
    select.events.some(
      (event) =>
        event.name === 'onValueChange' && event.type.includes('string'),
    ),
  );
});

test('date/time APIs use their field family as canonical and also expose time pickers', () => {
  for (const name of ['DateTimeField', 'TemporalPicker', 'TemporalDraft']) {
    assert.deepEqual(component(name).families, [
      'Date and time fields',
      'Time pickers',
    ]);
    const reference = readFileSync(
      resolve(gallery, `docs/api/${name}.md`),
      'utf8',
    );
    assert.match(
      reference,
      /\[Live examples and formatted usage\]\(https:\/\/ui\.rv-grid\.com\/components\/date-and-time-fields\/\)/,
    );
  }
});
test('every documented component has a portable preset contract and schema entry', () => {
  const schema = JSON.parse(
    readFileSync(resolve(gallery, 'package/presets/theme.schema.json'), 'utf8'),
  );
  const names = Object.keys(schema.properties.components.properties).sort();
  assert.deepEqual(names, api.map((item) => item.name).sort());
  const file = ts.createSourceFile(
    'presets.ts',
    readFileSync(resolve(gallery, 'package/presets/index.ts'), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const theme = file.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === 'UiTheme',
  );
  const components = theme.members.find(
    (node) => node.name?.getText(file) === 'components',
  );
  assert.deepEqual(
    components.type.members.map((node) => node.name.getText(file)).sort(),
    names,
  );
  for (const item of api) {
    assert.ok(
      item.props.some((prop) => prop.name === 'preset'),
      `${item.name}.preset`,
    );
  }
});

test('selection wrappers advertise only preset options they can honor', () => {
  const schema = JSON.parse(
    readFileSync(resolve(gallery, 'package/presets/theme.schema.json'), 'utf8'),
  );
  const config = (component) => {
    const ref = schema.properties.components.properties[
      component
    ].additionalProperties.$ref
      .split('/')
      .pop();
    return schema.$defs[ref].properties.props.properties.config.properties;
  };
  assert.equal('multiSelect' in config('Select'), false);
  assert.equal('multiSelect' in config('MultiSelect'), false);
  assert.equal('multiSelect' in config('Combobox'), false);
  assert.equal('search' in config('Combobox'), false);
  assert.equal('search' in config('Select'), true);
  assert.equal('search' in config('MultiSelect'), true);
});

test('each documented component has a gallery comparison sample', () => {
  const source = readFileSync(
    resolve(gallery, 'src/theme-samples.tsx'),
    'utf8',
  );
  const list = source.match(/const names = new Set\(\[([\s\S]*?)\]\)/)?.[1];
  assert.ok(list, 'Sample name list must be present');
  const names = [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const cases = [...source.matchAll(/case '([^']+)':/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(names.sort(), api.map((item) => item.name).sort());
  assert.deepEqual(cases.sort(), names);
});

test('every documented component has example CSS hook metadata', () => {
  const hooks = JSON.parse(
    readFileSync(resolve(gallery, 'src/theme-example-hooks.json'), 'utf8'),
  );
  assert.deepEqual(
    Object.keys(hooks).sort(),
    api.map((item) => item.name).sort(),
  );
  for (const [name, value] of Object.entries(hooks)) {
    assert.ok(Array.isArray(value.parts), name);
    assert.ok(Array.isArray(value.states), name);
  }
});
