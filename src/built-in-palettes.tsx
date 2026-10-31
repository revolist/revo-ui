import { h } from 'preact';
import { useState } from 'preact/hooks';
import { builtInColorPalettes } from '@revolist/ui/color-palette/built-in-palettes';
import { TextInput } from '@revolist/ui/preact';
import { Example } from './catalog';

/** The reference reads the same definitions that product code and Sass consume. */
export function BuiltInPalettesExamples() {
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const palettes = builtInColorPalettes.filter(palette =>
    [palette.id, palette.title, palette.usage, ...palette.consumers,
      ...Object.entries(palette.colors).flat()].join(' ').toLowerCase().includes(search));
  return (
    <Example title="Built-in product palettes and usage" wide>
      <p>These fixed palettes preserve product appearance, data meaning, and portable export colors. Products import their values from UI. Theme-aware interface colors remain in the semantic palette above.</p>
      <TextInput aria-label="Find a built-in palette" value={query} placeholder="Search palettes, usage, color names, or values…" onInput={event => setQuery(event.currentTarget.value)} />
      <p role="status" aria-label="Built-in palette results">{palettes.length} named palettes</p>
      <div class="builtin-palettes">
        {palettes.map(palette => (
          <article key={palette.id} class="builtin-palette" data-built-in-palette={palette.id}>
            <h3>{palette.title}</h3>
            <p>{palette.usage}</p>
            <p class="builtin-consumers"><strong>Used by:</strong> {palette.consumers.join(', ')}</p>
            <details open={search ? true : undefined}>
              <summary>{Object.keys(palette.colors).length} color values <code>{palette.id}</code></summary>
              <dl class="builtin-color-grid">
                {Object.entries(palette.colors).map(([name, value]) => (
                  <div key={name} class="builtin-color" data-built-in-color={name}>
                    <dt><span class="colors-swatch" aria-hidden="true" style={{ background: value }} /><code>{name}</code></dt>
                    <dd><code>{value}</code></dd>
                  </div>
                ))}
              </dl>
            </details>
          </article>
        ))}
      </div>
    </Example>
  );
}
