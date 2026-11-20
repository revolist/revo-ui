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
    '.brand-button:not([data-preset-surface]) {\n  background-color: #123456;\n}',
  );
  expect(css).toContain('.brand-button {\n  --space: 4px;\n}');
  expect(css).toContain(
    '.brand-switch[data-part="thumb"], .brand-switch [data-part="thumb"]:not([data-preset-scope="root"]):not(:where(.brand-switch :is([data-part="root"], [data-preset-scope="root"]):not(.brand-switch):not([data-preset-scope="inherit"]) *)) {\n  border-radius: 50%;\n}',
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
  expect(examples).toHaveLength(4);
  expect(themeToCss(examples[0])).toContain(
    '.my-switch-compact [data-part="thumb"]',
  );
  expect(examples[0].components.Switch.compact.tokens.trackWidth).toBe('44px');
  expect(examples[1].components.Button.primary.props.variant).toBe('primary');
  expect(presetProps(examples[3].components.ProgressBar.capacity).max).toBe(
    200,
  );
});

it('validates portable event motion and resolves custom frames', async () => {
  const { validateMotionPreset } = await import('./index');
  const { presetAnimation } = await import('./motion');
  const motion = JSON.parse(
    '{"selection":{"duration":400,"easing":"ease-in","keyframes":[{"transform":"translateX(0px)"},{"transform":"translateX({{distance}}px)"}]}}',
  );
  expect(() => validateMotionPreset(motion)).not.toThrow();
  const result = presetAnimation(
    motion,
    'selection',
    { keyframes: [], options: { duration: 100 } },
    { distance: -37 },
  );
  expect(result?.options.duration).toBe(400);
  expect(result?.keyframes[1].transform).toBe('translateX(-37px)');
  expect(
    presetAnimation({ selection: { enabled: false } }, 'selection', {
      keyframes: [],
      options: {},
    }),
  ).toBeUndefined();
  expect(() => validateMotionPreset({ settle: { duration: -1 } })).toThrow();
  expect(() =>
    validateMotionPreset({
      settle: { keyframes: [{ offset: 2 }, { opacity: 1 }] },
    }),
  ).toThrow();
  expect(() =>
    validateMotionPreset({
      settle: { keyframes: [{ offset: 0.8 }, { offset: 0.2 }] },
    }),
  ).toThrow();
  expect(() => validateMotionPreset({ settle: { onEnd: 'code' } })).toThrow();
});

it('generates scoped slider keyframes and honors motion-off selectors', async () => {
  const { themeToCss } = await import('./index');
  const theme = {
    version: 1,
    components: {
      SliderField: {
        custom: {
          className: 'my-slider',
          motion: {
            hover: {
              duration: 360,
              keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
              ],
            },
          },
        },
      },
    },
  } as const;
  const css = themeToCss(JSON.parse(JSON.stringify(theme)));
  expect(css).toContain('@keyframes rv-motion-my-slider-hover');
  expect(css).toContain('scale(1.2)');
  expect(css).toContain('::-webkit-slider-thumb:hover');
  expect(css).toContain('::-moz-range-thumb:hover');
  expect(css).toContain('360ms');
  expect(css).toContain('prefers-reduced-motion: reduce');
  expect(css).toContain('[data-rv-ui-motion="off"]');
  const bad = JSON.parse(JSON.stringify(theme));
  bad.components.SliderField.custom.motion.hover.keyframes[1].transform =
    'scale(1); color:red';
  expect(() => themeToCss(bad)).toThrow();
});
