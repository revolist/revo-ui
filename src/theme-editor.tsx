import { h } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import schema from '../package/presets/theme.schema.json';
import { frameworkHref } from './routing';
import {
  themeToCss,
  presetProps,
  type ComponentDefaults,
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
  { properties?: { props?: OptionSchema } }
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
}: {
  family: string;
  onPreview: (value?: ThemePreview) => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [component, setComponent] = useState('');
  const [presetName, setPresetName] = useState('custom');
  const [color, setColor] = useState('#6d28d9');
  const [radius, setRadius] = useState(6);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [extraCss, setExtraCss] = useState('');
  const [defaultsText, setDefaultsText] = useState('{}');
  const [defaults, setDefaults] = useState<ComponentDefaults>({});
  const [defaultsError, setDefaultsError] = useState('');
  const [structured, setStructured] = useState<
    Record<string, Record<string, string>>
  >({});
  const [stylePart, setStylePart] = useState('');
  const [styleProperty, setStyleProperty] = useState('');
  const [styleValue, setStyleValue] = useState('');
  const [styleError, setStyleError] = useState('');
  const partsListId = useId();
  const [enabled, setEnabled] = useState(false);
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
      const found = api
        .filter((item) => item.families.includes(family) && entries[item.name])
        .map((item) => item.name);
      setNames(found);
      setComponent(found[0] ?? '');
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
  const preset = {
    className,
    styles: {
      root: {
        '--rv-ui-accent': color,
        '--rv-ui-radius': `${radius}px`,
        ...structured.root,
      },
      parts: Object.fromEntries(
        Object.entries(structured).filter(([part]) => part !== 'root'),
      ),
    },
    ...(Object.keys(options).length ? { props: options } : {}),
    ...(Object.keys(defaults).length ? { defaults } : {}),
  };
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
            const nestedRoot = element.closest(`[data-part="root"]:not(.${className}):not([data-preset-scope="inherit"])`);
            if (nestedRoot && nestedRoot !== root && root.contains(nestedRoot)) continue;
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
      class="theme-editor"
      onToggle={(event) => setEnabled(event.currentTarget.open)}
    >
      <summary>Customize and export</summary>
      {enabled && (
        <div class="theme-editor-controls">
          <label>
            Component{' '}
            <select
              value={component}
              onChange={(event) => {
                setComponent(event.currentTarget.value);
                setOptions({});
                setStructured({});
                setDefaults({});
                setDefaultsText('{}');
                setDefaultsError('');
                setStylePart('');
                setStyleError('');
              }}
            >
              {names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preset name{' '}
            <input
              value={presetName}
              onInput={(event) => setPresetName(event.currentTarget.value)}
            />
          </label>
          <label>
            Accent{' '}
            <input
              type="color"
              value={color}
              onInput={(event) => setColor(event.currentTarget.value)}
            />
          </label>
          <label>
            Corner radius{' '}
            <input
              type="range"
              min="0"
              max="24"
              value={radius}
              onInput={(event) => setRadius(Number(event.currentTarget.value))}
            />{' '}
            {radius}px
          </label>
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
                <label key={name}>
                  {name}{' '}
                  {property.type === 'number' ||
                  (property.type === 'string' && !property.enum) ? (
                    <input
                      type={property.type === 'number' ? 'number' : 'text'}
                      value={selected === undefined ? '' : String(selected)}
                      onInput={(event) => update(event.currentTarget.value)}
                    />
                  ) : (
                    <select
                      value={selected === undefined ? '' : String(selected)}
                      onChange={(event) => update(event.currentTarget.value)}
                    >
                      <option value="">Default</option>
                      {(property.enum ?? ['true', 'false']).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              );
            })}
          <details class="theme-editor-defaults">
            <summary>More behavior defaults (JSON)</summary>
            <p>
              Set JSON-friendly component props. Explicit props in your
              application win; event handlers remain in code.
            </p>
            <label>
              Behavior defaults{' '}
              <textarea
                value={defaultsText}
                onInput={(event) => setDefaultsText(event.currentTarget.value)}
                rows={3}
              />
            </label>
            <button
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
            </button>
            {defaultsError && <p role="alert">{defaultsError}</p>}
          </details>
          <fieldset class="theme-editor-styles">
            <legend>JSON styles</legend>
            <label>
              Part{' '}
              <input
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
              <input
                value={styleProperty}
                placeholder="background-color"
                onInput={(event) => setStyleProperty(event.currentTarget.value)}
              />
            </label>
            <label>
              CSS value{' '}
              <input
                value={styleValue}
                placeholder="#6d28d9"
                onInput={(event) => setStyleValue(event.currentTarget.value)}
              />
            </label>
            <button
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
            </button>
            {styleError && <p role="alert">{styleError}</p>}
            {Object.entries(structured).flatMap(([part, declarations]) =>
              Object.entries(declarations).map(([property, value]) => (
                <div key={`${part}:${property}`}>
                  <code>
                    {part}: {property}: {value}
                  </code>{' '}
                  <button
                    type="button"
                    aria-label={`Remove ${part} ${property}`}
                    onClick={() =>
                      setStructured((previous) => {
                        const next = {
                          ...previous,
                          [part]: { ...previous[part] },
                        };
                        delete next[part][property];
                        if (!Object.keys(next[part]).length) delete next[part];
                        return next;
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              )),
            )}
          </fieldset>
          <label>
            Additional CSS{' '}
            <textarea
              value={extraCss}
              onInput={(event) => setExtraCss(event.currentTarget.value)}
              rows={3}
              placeholder={`.${className} { }`}
            />
          </label>
          {parts.length > 0 && (
            <p>
              Visible CSS parts{' '}
              {parts.map((part) => (
                <code key={part}>[data-part="{part}"] </code>
              ))}
            </p>
          )}
          {states.length > 0 && (
            <p>
              Observed states{' '}
              {states.map((state) => (
                <code key={state}>{state} </code>
              ))}
            </p>
          )}
          <p>
            Apply the preset to a component and import the CSS in each project. <a href={frameworkHref('presets')}>Read the themes and presets guide</a>.
          </p>
          {Object.keys(defaults).length > 0 && (
            <p>
              Import <code>presetProps</code> from{' '}
              <code>@revolist/ui/presets</code> to apply the behavior defaults.
            </p>
          )}
          <code>
            {Object.keys(defaults).length
              ? `<${component} {...presetProps(theme.components.${component}?.["${presetKey}"])} />`
              : `<${component} preset={theme.components.${component}?.["${presetKey}"]} />`}
          </code>
          <div>
            <button
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
            </button>{' '}
            <button
              type="button"
              onClick={() => download('theme.css', css, 'text/css')}
            >
              Download CSS
            </button>{' '}
            <button
              type="button"
              onClick={() =>
                download(
                  'theme.json',
                  JSON.stringify(theme, null, 2) + '\n',
                  'application/json',
                )
              }
            >
              Download JSON
            </button>{' '}
            <button
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
              Download CSS and JSON
            </button>
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
                    <button
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
                    </button>
                  </li>
                ))}
              </ul>
              <button
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
              </button>{' '}
              <button
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
              </button>
            </div>
          )}
        </div>
      )}
    </details>
  );
}
