/** @jsxImportSource preact */
import { Dropdown } from '../dropdown';
import { h, Fragment } from 'preact';
import { Input as UiInput } from '../native-control';
import { IconToggleButton } from './icon-controls';
export interface TypographyValue {
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
  readonly strike?: boolean;
}
export interface TypographyControlsProps {
  readonly value: TypographyValue;
  readonly fonts?: readonly string[];
  readonly labels: {
    readonly fontFamily: string;
    readonly defaultFont: string;
    readonly fontSize: string;
    readonly typographySection: string;
    readonly bold: string;
    readonly italic: string;
    readonly underline: string;
    readonly strike: string;
  };
  readonly icons: Record<'bold' | 'italic' | 'underline' | 'strike', string>;
  readonly onChange: (patch: Partial<TypographyValue>) => void;
}
const DEFAULT_FONTS = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
];
export function TypographyControls({
  value: appearance,
  fonts = DEFAULT_FONTS,
  labels: locale,
  icons,
  onChange,
}: TypographyControlsProps) {
  return (
    <>
      <div class="rv-form-grid">
        <label class="rv-field">
          <span class="rv-field__label">{locale.fontFamily}</span>
          <Dropdown
            className="rv-select"
            value={appearance.fontFamily ?? ''}
            source={[
              { value: '', label: locale.defaultFont },
              ...fonts.map((font) => ({ value: font, label: font })),
            ]}
            config={{ ariaLabel: locale.fontFamily, topLayer: true }}
            onChange={(value) =>
              onChange({ fontFamily: String(value) || undefined })
            }
          />
        </label>
        <label class="rv-field">
          <span class="rv-field__label">{locale.fontSize}</span>
          <UiInput
            type="number"
            class="rv-control"
            min={8}
            max={72}
            value={appearance.fontSize ?? ''}
            onInput={(event) =>
              onChange({
                fontSize: Number.isFinite(event.currentTarget.valueAsNumber)
                  ? event.currentTarget.valueAsNumber
                  : undefined,
              })
            }
          />
        </label>
      </div>
      <div
        class="rv-format-segmented rv-format-typography-toolbar"
        role="group"
        aria-label={locale.typographySection}
      >
        <IconToggleButton
          value={appearance.bold ?? false}
          label={locale.bold}
          icon={icons.bold}
          onChange={(bold) => onChange({ bold })}
        />
        <IconToggleButton
          value={appearance.italic ?? false}
          label={locale.italic}
          icon={icons.italic}
          onChange={(italic) => onChange({ italic })}
        />
        <IconToggleButton
          value={appearance.underline ?? false}
          label={locale.underline}
          icon={icons.underline}
          onChange={(underline) => onChange({ underline })}
        />
        <IconToggleButton
          value={appearance.strike ?? false}
          label={locale.strike}
          icon={icons.strike}
          onChange={(strike) => onChange({ strike })}
        />
      </div>
    </>
  );
}
