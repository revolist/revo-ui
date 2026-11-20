// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('publishes the same schema to package and gallery consumers', () => {
  const packageSchema = JSON.parse(
    readFileSync(new URL('./theme.schema.json', import.meta.url), 'utf8'),
  );
  const gallerySchema = JSON.parse(
    readFileSync(
      new URL('../../public/theme-v1.schema.json', import.meta.url),
      'utf8',
    ),
  );
  expect(gallerySchema).toEqual(packageSchema);
  expect(packageSchema.properties.version.const).toBe(1);
  for (const entry of Object.values(
    packageSchema.properties.components.properties,
  ) as any[]) {
    const name = entry.additionalProperties.$ref.split('/').pop();
    const definition = packageSchema.$defs[name];
    expect(definition.properties.styles.$ref).toBe('#/$defs/presetStyles');
    expect(definition.properties.defaults.$ref).toBe(
      '#/$defs/componentDefaults',
    );
    expect(definition.allOf).toBeDefined();
  }
  expect(
    packageSchema.properties.components.properties.Switch.additionalProperties
      .$ref,
  ).toBe('#/$defs/switchPreset');
});

it('compiles structured root and part styles for several components', async () => {
  const { themeToCss } = await import('./index');
  const css = themeToCss({
    version: 1,
    components: {
      Button: {
        branded: {
          className: 'brand-button',
          styles: { root: { 'background-color': '#123456', '--space': '4px' } },
        },
      },
      Switch: {
        branded: {
          className: 'brand-switch',
          styles: { parts: { thumb: { 'border-radius': '50%' } } },
        },
      },
    },
  });
  expect(css).toContain(
    '.brand-button {\n  background-color: #123456;\n  --space: 4px;\n}',
  );
  expect(css).toContain(
    '.brand-switch[data-part="thumb"], .brand-switch [data-part="thumb"]:not(.brand-switch [data-part="root"] *) {\n  border-radius: 50%;\n}',
  );
  expect(
    themeToCss({
      version: 1,
      components: { Button: { plain: { className: 'plain' } } },
    }),
  ).toBe('');
});

it('rejects unsafe or ambiguous structured CSS instead of emitting broken selectors', async () => {
  const { themeToCss } = await import('./index');
  const css = (className: string, styles: any) => () =>
    themeToCss({
      version: 1,
      components: { Button: { custom: { className, styles } } },
    });
  expect(css('one two', { root: { color: 'red' } })).toThrow();
  expect(css('valid', { root: { color: 'red; display: none' } })).toThrow();
  expect(css('valid', { parts: { 'thumb]': { color: 'red' } } })).toThrow();
  expect(css('valid', { root: { color: 'red /*' } })).toThrow();
  expect(css('valid', { root: { 'bad property': 'red' } })).toThrow();
});

it('applies JSON behavior defaults before explicit application props', async () => {
  const { presetProps } = await import('./index');
  const preset = {
    className: 'rating-theme',
    defaults: { max: 3, disabled: true, config: { compact: true } },
  };
  const props = { ...presetProps(preset), max: 5, disabled: false };
  expect(props.max).toBe(5);
  expect(props.disabled).toBe(false);
  expect(props.config).toEqual({ compact: true });
  expect(props.preset).toBe(preset);
});

it('rejects event handlers and non-JSON values in shared defaults', async () => {
  const { presetProps } = await import('./index');
  expect(() => presetProps({ defaults: { onClick: 'something' } })).toThrow();
  expect(() => presetProps({ defaults: { children: 'content' } })).toThrow();
  expect(() => presetProps({ defaults: { count: Number.NaN } })).toThrow();
  expect(() =>
    presetProps({ defaults: { value: (() => {}) as any } }),
  ).toThrow();
});

it('keeps the documentation JSON examples usable by the preset helpers', async () => {
  const { themeToCss, presetProps } = await import('./index');
  const markdown = readFileSync(
    new URL('../../docs/presets.md', import.meta.url),
    'utf8',
  );
  const examples = [...markdown.matchAll(/```json\n([\s\S]*?)\n```/g)].map(
    (match) => JSON.parse(match[1]),
  );
  expect(examples).toHaveLength(3);
  expect(themeToCss(examples[0])).toContain(
    '.my-switch-compact [data-part="thumb"]',
  );
  expect(examples[0].components.Switch.compact.tokens.trackWidth).toBe('44px');
  expect(examples[1].components.Button.primary.props.variant).toBe('primary');
  expect(presetProps(examples[2].components.ProgressBar.capacity).max).toBe(
    200,
  );
});
