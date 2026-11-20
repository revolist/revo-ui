import { h } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { Button, CollapsibleSection, MultiSelect } from '@revolist/ui/preact';
import { Select } from '@revolist/ui/select';
import { Input, TextArea, ButtonControl } from '@revolist/ui/native-control';
import { ColorPicker } from '@revolist/ui/color-palette/color-picker';
import { SliderField } from '@revolist/ui/filter/filters/slider/single';
import { Highlight } from './example-source';
import schema from '../package/presets/theme.schema.json';
import { apiHref, frameworkHref } from './routing';
import type { ComponentApi } from './api-types';
import {
  themeToCss,
  presetProps,
  validateMotionPreset,
  type ComponentDefaults,
  type MotionPreset,
  type PresetStyles,
  type UiTheme,
} from '@revolist/ui/presets';

type OptionSchema = {
  type?: string;
  enum?: string[];
  properties?: Record<string, OptionSchema>;
};
type SchemaItem = { $ref: string };
const definitions = schema.$defs as Record<
  string,
  { properties?: { props?: OptionSchema; motion?: { $ref: string } } }
>;
const entries = schema.properties.components.properties as Record<
  string,
  { additionalProperties: SchemaItem }
>;

export interface ThemePreview {
  component: string;
  preset: {
    className: string;
    props?: Record<string, unknown>;
    styles?: PresetStyles;
    defaults?: ComponentDefaults;
    motion?: MotionPreset;
  };
  css: string;
}

type SavedPreset = ThemePreview & { name: string };
const storageKey = 'revo-ui-gallery-theme-v1';

function loadSavedPresets(): SavedPreset[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(value)
      ? value.filter(
          (item) =>
            item &&
            typeof item.component === 'string' &&
            typeof item.name === 'string' &&
            typeof item.css === 'string' &&
            typeof item.preset?.className === 'string',
        )
      : [];
  } catch {
    return [];
  }
}

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ThemeEditor({
  family,
  onPreview,
  onComponentsChange,
  standalone = false,
}: {
  family?: string;
  standalone?: boolean;
  onPreview: (value?: ThemePreview) => void;
  onComponentsChange?: (value: string[]) => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [apiComponents, setApiComponents] = useState<ComponentApi[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [component, setComponent] = useState('');
  const [presetName, setPresetName] = useState('custom');
  const [color, setColor] = useState('#6d28d9');
  const [radius, setRadius] = useState(6);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [extraCss, setExtraCss] = useState('');
  const [defaultsText, setDefaultsText] = useState('{}');
  const [defaults, setDefaults] = useState<ComponentDefaults>({});
  const [defaultsError, setDefaultsError] = useState('');
  const [motionText, setMotionText] = useState('{}');
  const [motion, setMotion] = useState<MotionPreset>({});
  const [motionError, setMotionError] = useState('');
  const [structured, setStructured] = useState<
    Record<string, Record<string, string>>
  >({});
  const [stylePart, setStylePart] = useState('');
  const [styleProperty, setStyleProperty] = useState('');
  const [styleValue, setStyleValue] = useState('');
  const [styleError, setStyleError] = useState('');
  const partsListId = useId();
  const [enabled, setEnabled] = useState(standalone);
  const [parts, setParts] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedPreset[]>([]);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const refresh = () => setSaved(loadSavedPresets());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('revo-ui-theme-change', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('revo-ui-theme-change', refresh);
    };
  }, []);
  useEffect(() => {
    import('virtual:component-api').then(({ default: api }) => {
      const found = api.filter(
        (item) =>
          entries[item.name] && (!family || item.families.includes(family)),
      );
      const query = new URLSearchParams(location.search);
      const requested = query.get('component');
      const selectedFamily = query.get('family');
      setNames(found.map((item) => item.name));
      setApiComponents(found);
      const initial =
        found.find((item) => item.name === requested)?.name ??
        found.find((item) => item.families.includes(selectedFamily ?? ''))
          ?.name ??
        found.find((item) => item.name === 'Button')?.name ??
        found[0]?.name ??
        '';
      setComponent(initial);
      setOptions(initial === 'Button' ? { variant: 'primary' } : {});
      setSelectedComponents(initial ? [initial] : []);
      onComponentsChange?.(initial ? [initial] : []);
    });
  }, [family]);
  const presetKey =
    presetName
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom';
  const className = `rv-theme-${component.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-${presetKey}`;
  const ref =
    entries[component]?.additionalProperties.$ref.split('/').pop() ?? '';
  const properties = definitions[ref]?.properties?.props?.properties ?? {};
  const supportsMotion = Boolean(definitions[ref]?.properties?.motion);
  const componentProps =
    apiComponents.find((item) => item.name === component)?.props ?? [];
  const exampleCandidates: [string, string, boolean | number][] = [
    ['disabled', 'boolean', true],
    ['readOnly', 'boolean', true],
    ['step', 'number', 3],
    ['max', 'number', 10],
    ['busy', 'boolean', true],
  ];
  const exampleEntry = exampleCandidates.find(([name, type]) =>
    componentProps.some(
      (prop) => prop.name === name && prop.type.includes(type),
    ),
  );
  const behaviorExample = exampleEntry
    ? JSON.stringify({ [exampleEntry[0]]: exampleEntry[2] }, null, 2)
    : undefined;
  const preset = {
    className,
    styles: {
      root: {
        '--rv-ui-accent': color,
        '--rv-ui-accent-hover': `color-mix(in srgb, ${color} 85%, black)`,
        '--rv-ui-accent-text': `color-mix(in srgb, ${color} var(--rv-ui-accent-text-weight), var(--rv-ui-accent-text-base))`,
        '--rv-ui-selected-bg': `color-mix(in srgb, ${color} 12%, var(--rv-ui-surface))`,
        '--rv-ui-selected-accent-fg': 'var(--rv-ui-accent-text)',
        '--rv-ui-field-accent-text': 'var(--rv-ui-accent-text)',
        '--rv-ui-badge-bg': 'var(--rv-ui-accent)',
        '--rv-ui-focus-ring': `color-mix(in srgb, ${color} 35%, transparent)`,
        '--rv-ui-radius': `${radius}px`,
        ...structured.root,
      },
      parts: Object.fromEntries(
        Object.entries(structured).filter(([part]) => part !== 'root'),
      ),
    },
    ...(Object.keys(options).length ? { props: options } : {}),
    ...(Object.keys(defaults).length ? { defaults } : {}),
    ...(Object.keys(motion).length ? { motion } : {}),
  };
  const sidebarTokens = {
    '--rv-ui-accent': color,
    '--rv-ui-accent-hover': `color-mix(in srgb, ${color} 85%, black)`,
    '--rv-ui-accent-text': `color-mix(in srgb, ${color} var(--rv-ui-accent-text-weight, 90%), var(--rv-ui-accent-text-base, black))`,
    '--rv-ui-selected-bg': `color-mix(in srgb, ${color} 12%, var(--rv-ui-surface))`,
    '--rv-ui-selected-accent-fg': 'var(--rv-ui-accent-text)',
    '--rv-ui-field-accent-text': 'var(--rv-ui-accent-text)',
    '--rv-ui-focus-ring': `color-mix(in srgb, ${color} 35%, transparent)`,
  };
  const sidebarPopupCss = themeToCss({
    version: 1,
    components: {
      Button: {
        sidebar: {
          className: 'rv-theme-editor-popup',
          styles: { root: sidebarTokens },
        },
      },
    },
  } as UiTheme);
  const css =
    themeToCss({
      version: 1,
      components: { [component]: { [presetKey]: preset } },
    } as UiTheme) + (extraCss ? `\n${extraCss}\n` : '');
  useEffect(() => {
    onPreview(enabled && component ? { component, preset, css } : undefined);
  }, [
    enabled,
    component,
    presetName,
    color,
    radius,
    options,
    extraCss,
    structured,
    defaults,
    motion,
  ]);
  useEffect(() => {
    if (!enabled || !component) {
      setParts([]);
      setStates([]);
      return;
    }
    let frame = 0;
    const inspect = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const found = new Set<string>();
        const observedStates = new Set<string>();
        const stateNames = [
          'data-state',
          'data-tone',
          'data-selected',
          'data-filled',
          'aria-checked',
          'aria-pressed',
          'aria-selected',
          'aria-expanded',
        ];
        const inspectState = (element: Element) => {
          for (const name of stateNames) {
            const value = element.getAttribute(name);
            if (value !== null) observedStates.add(`[${name}="${value}"]`);
          }
        };
        for (const root of document.querySelectorAll(`.${className}`)) {
          inspectState(root);
          for (const element of root.querySelectorAll(
            stateNames.map((name) => `[${name}]`).join(','),
          ))
            inspectState(element);
          const part = root.getAttribute('data-part');
          if (part) found.add(part);
          for (const element of root.querySelectorAll('[data-part]')) {
            const nestedRoot = element.closest(
              `:is([data-part="root"], [data-preset-scope="root"]):not(.${className}):not([data-preset-scope="inherit"])`,
            );
            if (nestedRoot && nestedRoot !== root && root.contains(nestedRoot))
              continue;
            const child = element.getAttribute('data-part');
            if (child) found.add(child);
          }
        }
        const next = [...found].sort();
        setParts((previous) =>
          previous.join('\0') === next.join('\0') ? previous : next,
        );
        const nextStates = [...observedStates].sort();
        setStates((previous) =>
          previous.join('\0') === nextStates.join('\0') ? previous : nextStates,
        );
      });
    };
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'data-part',
        'data-state',
        'data-tone',
        'data-selected',
        'data-filled',
        'aria-checked',
        'aria-pressed',
        'aria-selected',
        'aria-expanded',
      ],
    });
    inspect();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled, component, className]);
  if (!names.length) return null;
  const savePresets = (next: SavedPreset[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError(false);
      window.dispatchEvent(new Event('revo-ui-theme-change'));
    } catch {
      setStorageError(true);
    }
  };
  const savedComponents: Record<
    string,
    Record<string, ThemePreview['preset']>
  > = {};
  for (const item of saved)
    (savedComponents[item.component] ??= Object.create(null))[item.name] =
      item.preset;
  const savedTheme = {
    $schema: 'https://ui.rv-grid.com/theme-v1.schema.json',
    version: 1,
    components: savedComponents,
  };
  const theme = {
    $schema: 'https://ui.rv-grid.com/theme-v1.schema.json',
    version: 1,
    components: { [component]: { [presetKey]: preset } },
  };
  return (
    <details
      class={`theme-editor${standalone ? ' theme-editor--standalone' : ''}`}
      style={sidebarTokens}
      open={standalone || undefined}
      onToggle={(event) => setEnabled(event.currentTarget.open)}
    >
      <summary>Customize and export</summary>
      {enabled && (
        <div class="theme-editor-controls">
          <style>{sidebarPopupCss}</style>
          <div class="theme-editor-field">
            <span>Component</span>
            <MultiSelect
              preset={{ className: 'rv-theme-editor-popup' }}
              source={names.map((name) => ({ value: name, label: name }))}
              config={{
                search: true,
                ariaLabel: 'Component',
                searchAriaLabel: 'Search components to edit',
                searchPlaceholder: 'Search components',
                topLayer: true,
                nativeTabNavigation: true,
              }}
              value={selectedComponents}
              onChange={(value) => {
                const next = (Array.isArray(value) ? value : [value]).map(
                  String,
                );
                if (!next.length) return;
                const added = next.find(
                  (name) => !selectedComponents.includes(name),
                );
                const active =
                  added ??
                  (next.includes(component)
                    ? component
                    : next[next.length - 1]);
                setSelectedComponents(next);
                onComponentsChange?.(next);
                if (active === component) return;
                setComponent(active);
                setOptions(active === 'Button' ? { variant: 'primary' } : {});
                setStructured({});
                setDefaults({});
                setDefaultsText('{}');
                setMotion({});
                setMotionText('{}');
                setMotionError('');
                setDefaultsError('');
                setStylePart('');
                setStyleError('');
              }}
            />
            {selectedComponents.length > 1 && (
              <small>Editing {component}</small>
            )}
          </div>
          <label>
            Preset name{' '}
            <Input
              class="rv-control"
              value={presetName}
              onInput={(event) => setPresetName(event.currentTarget.value)}
            />
          </label>
          <fieldset class="theme-editor-swatches">
            <legend>Accent color</legend>
            <div>
              {[
                '#6d28d9',
                '#2563eb',
                '#0891b2',
                '#059669',
                '#65a30d',
                '#d97706',
                '#dc2626',
                '#db2777',
              ].map((value) => (
                <ButtonControl
                  unstyled
                  type="button"
                  class="theme-editor-swatch"
                  style={{ background: value }}
                  aria-label={`Accent ${value}`}
                  aria-pressed={color === value}
                  onClick={() => setColor(value)}
                />
              ))}
            </div>
          </fieldset>
          <div class="theme-editor-color-row">
            <span>Custom accent</span>
            <ColorPicker
              label="Custom accent"
              value={color}
              defaultLabel="Default"
              customLabel="Custom color"
              customHexLabel="Hex color"
              invalidColor="Enter a valid hex color"
              colorLabels={{}}
              optional={false}
              onChange={(value) => {
                if (value) setColor(value);
              }}
            />
          </div>
          <SliderField
            label="Corner radius"
            layout="stacked"
            ariaLabel="Corner radius"
            accentColor={color}
            min={0}
            max={24}
            value={radius}
            onChange={setRadius}
            formatValue={(value) => `${value}px`}
          />
          {Object.entries(properties)
            .flatMap(([name, property]) =>
              property.type === 'object'
                ? Object.entries(property.properties ?? {}).map(
                    ([child, definition]) => ({
                      name: `${name}.${child}`,
                      parent: name,
                      key: child,
                      property: definition,
                    }),
                  )
                : [{ name, parent: '', key: name, property }],
            )
            .filter(
              ({ property }) =>
                property.enum ||
                ['boolean', 'number', 'string'].includes(property.type ?? ''),
            )
            .map(({ name, parent, key, property }) => {
              const group = parent
                ? (options[parent] as Record<string, unknown> | undefined)
                : options;
              const selected = group?.[key];
              const update = (value: string) =>
                setOptions((previous) => {
                  const next = { ...previous };
                  const values = parent
                    ? {
                        ...(next[parent] as
                          | Record<string, unknown>
                          | undefined),
                      }
                    : next;
                  if (value === '') delete values[key];
                  else
                    values[key] =
                      property.type === 'boolean'
                        ? value === 'true'
                        : property.type === 'number'
                          ? Number(value)
                          : value;
                  if (parent) {
                    if (Object.keys(values).length) next[parent] = values;
                    else delete next[parent];
                  }
                  return next;
                });
              return (
                <div class="theme-editor-field" key={name}>
                  <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                  {property.type === 'number' ||
                  (property.type === 'string' && !property.enum) ? (
                    <Input
                      class="rv-control"
                      aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
                      type={property.type === 'number' ? 'number' : 'text'}
                      value={selected === undefined ? '' : String(selected)}
                      onInput={(event) => update(event.currentTarget.value)}
                    />
                  ) : (
                    <Select
                      preset={{ className: 'rv-theme-editor-popup' }}
                      aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
                      value={selected === undefined ? '' : String(selected)}
                      onValueChange={(value) => update(String(value))}
                    >
                      <option value="">Default</option>
                      {(property.enum ?? ['true', 'false']).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              );
            })}
          <CollapsibleSection
            className="theme-editor-defaults"
            title="More behavior defaults (JSON)"
          >
            <p>
              Set JSON-friendly component props. Explicit props in your
              application win; event handlers remain in code.
            </p>
            {behaviorExample ? (
              <div class="theme-editor-behavior-example">
                <span>Example for {component}</span>
                <pre>
                  <code>{behaviorExample}</code>
                </pre>
                <Button
                  type="button"
                  onClick={() => {
                    setDefaultsText(behaviorExample);
                    setDefaultsError('');
                  }}
                >
                  Use example
                </Button>
              </div>
            ) : (
              <p>
                See the <a href={apiHref(component)}>component API</a> for
                supported props.
              </p>
            )}
            <label>
              Behavior defaults{' '}
              <TextArea
                class="rv-control"
                value={defaultsText}
                onInput={(event) => setDefaultsText(event.currentTarget.value)}
                rows={3}
              />
            </label>
            <Button
              type="button"
              onClick={() => {
                try {
                  const parsed: unknown = JSON.parse(defaultsText);
                  if (
                    !parsed ||
                    Array.isArray(parsed) ||
                    typeof parsed !== 'object'
                  )
                    throw new Error('Expected an object');
                  presetProps({ defaults: parsed as ComponentDefaults });
                  setDefaults(parsed as ComponentDefaults);
                  setDefaultsError('');
                } catch {
                  setDefaultsError(
                    'Enter a JSON object with serializable props; events, children and refs belong in code.',
                  );
                }
              }}
            >
              Apply defaults
            </Button>
            {defaultsError && <p role="alert">{defaultsError}</p>}
          </CollapsibleSection>
          {supportsMotion && (
            <CollapsibleSection
              className="theme-editor-advanced"
              title="Animation (JSON)"
            >
              <p>
                Configure event timing or provide keyframes. Reduced-motion
                settings still apply.
              </p>
              <label>
                Animation settings
                <TextArea
                  class="rv-control"
                  value={motionText}
                  onInput={(event) => setMotionText(event.currentTarget.value)}
                  rows={5}
                />
              </label>
              <Button
                type="button"
                onClick={() => {
                  try {
                    const parsed: unknown = JSON.parse(motionText);
                    validateMotionPreset(parsed);
                    const supported =
                      ref === 'switchPreset'
                        ? ['settle']
                        : ref === 'segmentedSwitchPreset'
                          ? ['selection']
                          : ref === 'calendarPreset'
                            ? [
                                'caption',
                                'period',
                                'periodForward',
                                'periodBackward',
                                'selection',
                              ]
                            : ref === 'numberStepperPreset'
                              ? ['digits', 'digitsUp', 'digitsDown']
                              : ['hover', 'press'];
                    if (
                      Object.keys(parsed).some(
                        (name) => !supported.includes(name),
                      )
                    )
                      throw new Error('Unknown animation event');
                    themeToCss({
                      version: 1,
                      components: {
                        [component]: {
                          [presetKey]: { className, motion: parsed },
                        },
                      },
                    } as UiTheme);
                    setMotion(parsed);
                    setMotionError('');
                  } catch {
                    setMotionError(
                      'Enter valid animation JSON using the events and settings supported by this component.',
                    );
                  }
                }}
              >
                Apply animation
              </Button>
              {motionError && <p role="alert">{motionError}</p>}
            </CollapsibleSection>
          )}
          <CollapsibleSection
            className="theme-editor-advanced"
            title="Style individual parts"
          >
            <fieldset class="theme-editor-styles">
              <legend>JSON styles</legend>
              <label>
                Part{' '}
                <Input
                  class="rv-control"
                  list={partsListId}
                  value={stylePart}
                  placeholder="root"
                  onInput={(event) => setStylePart(event.currentTarget.value)}
                />
              </label>
              <datalist id={partsListId}>
                {parts
                  .filter((part) => part !== 'root')
                  .map((part) => (
                    <option key={part} value={part} />
                  ))}
              </datalist>
              <label>
                CSS property{' '}
                <Input
                  class="rv-control"
                  value={styleProperty}
                  placeholder="background-color"
                  onInput={(event) =>
                    setStyleProperty(event.currentTarget.value)
                  }
                />
              </label>
              <label>
                CSS value{' '}
                <Input
                  class="rv-control"
                  value={styleValue}
                  placeholder="#6d28d9"
                  onInput={(event) => setStyleValue(event.currentTarget.value)}
                />
              </label>
              <Button
                type="button"
                onClick={() => {
                  const part = stylePart.trim() || 'root';
                  const property = styleProperty.trim();
                  const value = styleValue.trim();
                  if (!property || !value) {
                    setStyleError('Enter a CSS property and value.');
                    return;
                  }
                  const next = {
                    ...structured,
                    [part]: { ...structured[part], [property]: value },
                  };
                  const styles = {
                    root: next.root,
                    parts: Object.fromEntries(
                      Object.entries(next).filter(([key]) => key !== 'root'),
                    ),
                  };
                  try {
                    themeToCss({
                      version: 1,
                      components: {
                        [component]: { [presetKey]: { className, styles } },
                      },
                    } as UiTheme);
                    setStructured(next);
                    setStyleError('');
                    setStyleProperty('');
                    setStyleValue('');
                  } catch {
                    setStyleError(
                      'Use a CSS property and simple value, and a lowercase part name.',
                    );
                  }
                }}
              >
                Add style
              </Button>
              {styleError && <p role="alert">{styleError}</p>}
              {Object.entries(structured).flatMap(([part, declarations]) =>
                Object.entries(declarations).map(([property, value]) => (
                  <div key={`${part}:${property}`}>
                    <code>
                      {part}: {property}: {value}
                    </code>{' '}
                    <Button
                      type="button"
                      aria-label={`Remove ${part} ${property}`}
                      onClick={() =>
                        setStructured((previous) => {
                          const next = {
                            ...previous,
                            [part]: { ...previous[part] },
                          };
                          delete next[part][property];
                          if (!Object.keys(next[part]).length)
                            delete next[part];
                          return next;
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                )),
              )}
            </fieldset>
            <label>
              Additional CSS{' '}
              <TextArea
                class="rv-control"
                value={extraCss}
                onInput={(event) => setExtraCss(event.currentTarget.value)}
                rows={3}
                placeholder={`.${className} { }`}
              />
            </label>
          </CollapsibleSection>
          {parts.length > 0 && (
            <div class="theme-editor-metadata">
              <span>Visible CSS parts</span>
              <div class="theme-editor-selectors">
                {parts.map((part) => (
                  <code key={part}>[data-part="{part}"]</code>
                ))}
              </div>
            </div>
          )}
          {states.length > 0 && (
            <div class="theme-editor-metadata">
              <span>Observed states</span>
              <div class="theme-editor-selectors">
                {states.map((state) => (
                  <code key={state}>{state}</code>
                ))}
              </div>
            </div>
          )}
          <p class="theme-editor-guide">
            Apply the preset to a component and import its CSS in your project.{' '}
            <a href={frameworkHref('presets')}>
              Read the themes and presets guide
            </a>
            .
          </p>
          {Object.keys(defaults).length > 0 && (
            <p>
              Import <code>presetProps</code> from{' '}
              <code>@revolist/ui/presets</code> to apply the behavior defaults.
            </p>
          )}
          <div class="theme-editor-code">
            <div class="theme-editor-code-heading">
              Usage <span>TSX</span>
            </div>
            <pre>
              <Highlight
                code={
                  Object.keys(defaults).length
                    ? `<${component}\n  {...presetProps(theme.components.${component}?.["${presetKey}"])}\n/>`
                    : `<${component}\n  preset={theme.components.${component}?.["${presetKey}"]}\n/>`
                }
              />
            </pre>
          </div>
          <div
            class="theme-editor-actions"
            style={{
              '--rv-ui-accent': color,
              '--rv-ui-accent-hover': `color-mix(in srgb, ${color} 85%, black)`,
            }}
          >
            <Button
              variant="primary"
              type="button"
              onClick={() =>
                savePresets([
                  ...saved.filter(
                    (item) =>
                      item.component !== component || item.name !== presetKey,
                  ),
                  { component, name: presetKey, preset, css },
                ])
              }
            >
              Save to theme
            </Button>{' '}
            <Button
              type="button"
              onClick={() => download('theme.css', css, 'text/css')}
            >
              CSS
            </Button>{' '}
            <Button
              type="button"
              onClick={() =>
                download(
                  'theme.json',
                  JSON.stringify(theme, null, 2) + '\n',
                  'application/json',
                )
              }
            >
              JSON
            </Button>{' '}
            <Button
              type="button"
              onClick={() => {
                download('theme.css', css, 'text/css');
                download(
                  'theme.json',
                  JSON.stringify(theme, null, 2) + '\n',
                  'application/json',
                );
              }}
            >
              CSS and JSON
            </Button>
          </div>
          {storageError && (
            <p role="alert">The theme could not be saved in this browser.</p>
          )}
          {saved.length > 0 && (
            <div>
              <p>Saved presets</p>
              <ul>
                {saved.map((item) => (
                  <li key={`${item.component}:${item.name}`}>
                    {item.component} / {item.name}{' '}
                    <Button
                      type="button"
                      aria-label={`Remove ${item.component} ${item.name}`}
                      onClick={() =>
                        savePresets(
                          saved.filter(
                            (entry) =>
                              entry.component !== item.component ||
                              entry.name !== item.name,
                          ),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                onClick={() =>
                  download(
                    'theme.css',
                    saved.map((item) => item.css).join('\n'),
                    'text/css',
                  )
                }
              >
                Download saved CSS
              </Button>{' '}
              <Button
                type="button"
                onClick={() =>
                  download(
                    'theme.json',
                    JSON.stringify(savedTheme, null, 2) + '\n',
                    'application/json',
                  )
                }
              >
                Download saved JSON
              </Button>
            </div>
          )}
        </div>
      )}
    </details>
  );
}
