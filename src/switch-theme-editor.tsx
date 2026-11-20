import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Switch, type SwitchPreset } from '@revolist/ui/preact';
import type { UiTheme } from '@revolist/ui/presets';

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function SwitchThemeEditor() {
  const [checked, setChecked] = useState(true);
  const [color, setColor] = useState('#6d28d9');
  const [width, setWidth] = useState(40);
  const [labelPosition, setLabelPosition] = useState<'before' | 'after'>(
    'after',
  );
  const preset: SwitchPreset = {
    className: 'custom-switch',
    props: { labelPosition },
    tokens: { trackWidth: `${width}px`, trackOn: color },
  };
  const theme: UiTheme = {
    $schema: 'https://ui.rv-grid.com/theme-v1.schema.json',
    version: 1,
    components: { Switch: { custom: preset } },
  };
  const css = `.custom-switch {\n  --rv-ui-switch-track-width: ${width}px;\n  --rv-ui-switch-track-on: ${color};\n}\n`;

  return (
    <div class="switch-theme-editor">
      <p>Customize a switch and export its settings for another project.</p>
      <label>
        Track color{' '}
        <input
          type="color"
          value={color}
          onInput={(event) => setColor(event.currentTarget.value)}
        />
      </label>
      <label>
        Track width{' '}
        <input
          type="range"
          min="30"
          max="64"
          value={width}
          onInput={(event) => setWidth(Number(event.currentTarget.value))}
        />{' '}
        {width}px
      </label>
      <label>
        Label position{' '}
        <select
          value={labelPosition}
          onChange={(event) =>
            setLabelPosition(event.currentTarget.value as 'before' | 'after')
          }
        >
          <option value="before">Before</option>
          <option value="after">After</option>
        </select>
      </label>
      <div>
        <Switch label="Default" checked={checked} onChange={setChecked} />{' '}
        <Switch
          label="Customized"
          checked={checked}
          onChange={setChecked}
          preset={preset}
        />
      </div>
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
      </button>
    </div>
  );
}
