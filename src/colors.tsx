import { Dropdown } from '@revolist/ui/dropdown/index';
import { BuiltInPalettesExamples } from './built-in-palettes';
import { h } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { colorRoles } from '@revolist/ui/color-roles';
import { Button, TextInput } from '@revolist/ui/preact';
import { Example } from './catalog';
import { DEFAULT_COLOR_PALETTE_OPTIONS } from '@revolist/ui/color-palette/palette';

function ThemePalette({ theme, query }: { theme: 'light' | 'dark'; query: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const swatches = root.current!.querySelectorAll<HTMLElement>('[data-color-token]');
    setValues(Object.fromEntries(Array.from(swatches, (swatch) => [
      swatch.dataset.colorToken!, getComputedStyle(swatch).backgroundColor,
    ])));
  }, []);
  return (
    <div ref={root} class="colors-theme" data-theme={theme} role="group" aria-label={`${theme} color palette`}>
      <h3>{theme === 'light' ? 'Light' : 'Dark'}</h3>
      <div class="colors-sample">
        <strong>Shared controls</strong>
        <TextInput aria-label={`${theme} example input`} placeholder="Project name" />
        <Dropdown className="rv-select" source={[{ value: 'Ready to review', label: 'Ready to review' }]} config={{ ariaLabel: `${theme} example select` }} value="Ready to review" onChange={() => {}} />
        <div class="row"><Button variant="primary">Save</Button><Button disabled>Disabled</Button></div>
      </div>
      <dl class="colors-roles">
        {colorRoles.map(({ token, group, usage }) => (
          <div key={token} class="colors-role" hidden={!`${token} ${group} ${usage}`.toLowerCase().includes(query.toLowerCase().trim())}>
            <dt><span class="colors-swatch" data-color-token={token} style={{ backgroundColor: `var(${token})` }} /><code>{token}</code></dt>
            <dd><span class="colors-group">{group}</span> · {usage}<code class="colors-value">{values[token] || 'Resolving…'}</code></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ColorsExamples() {
  const [query, setQuery] = useState('');
  const count = colorRoles.filter(({ token, group, usage }) => `${token} ${group} ${usage}`.toLowerCase().includes(query.trim().toLowerCase())).length;
  const swatchCount = DEFAULT_COLOR_PALETTE_OPTIONS.filter(({ value, label }) => `${value} ${label}`.toLowerCase().includes(query.trim().toLowerCase())).length;
  return (
    <>
    <Example title="Semantic palette and usage" wide>
      <p>Use semantic tokens by purpose. Values below are resolved from the actual theme; translucent colors show their alpha. Built-in data palettes are cataloged below; custom user colors remain configurable.</p>
      <TextInput aria-label="Find a color token" placeholder="Search tokens or usage…" value={query} onInput={(event) => setQuery(event.currentTarget.value)} />
      <p role="status" aria-label="Semantic color results">{count} color roles{swatchCount ? ` · ${swatchCount} swatches` : ''}</p>
      <div class="colors-palettes"><ThemePalette theme="light" query={query} /><ThemePalette theme="dark" query={query} /></div>
    </Example>
    <Example title="Selectable color swatches" wide>
      <p>Shared picker values used by product color palettes and Charts color labels. Chart series keep their own default palette.</p>
      <dl class="colors-roles" aria-label="Selectable color swatch values">
        {DEFAULT_COLOR_PALETTE_OPTIONS.map(({ value, label }) => (
          <div key={value} class="colors-role" hidden={!`${value} ${label}`.toLowerCase().includes(query.trim().toLowerCase())}>
            <dt><span class="colors-swatch" style={{ backgroundColor: value }} aria-hidden="true" />{label}</dt>
            <dd><code>{value}</code></dd>
          </div>
        ))}
      </dl>
    </Example>
    <BuiltInPalettesExamples />
    </>
  );
}
