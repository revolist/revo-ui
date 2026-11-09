import { handleColorPaletteKeyDown } from './color-model';
/** @jsxImportSource preact */
import checkIcon from '@fortawesome/fontawesome-free/svgs/solid/check.svg?raw';
import { h, type JSX } from 'preact';
import { useControlTooltip } from '../core/tooltip';
import {
  DEFAULT_COLOR_PALETTE_OPTIONS,
  type ColorPaletteOption,
  type ColorPaletteValue,
} from './palette';

export * from './palette';

export interface ColorPaletteProps {
  readonly value: ColorPaletteValue;
  readonly options?: readonly ColorPaletteOption[];
  readonly ariaLabel: string;
  readonly defaultLabel: string;
  readonly colorAriaLabel: (option: ColorPaletteOption) => string;
  readonly disabled?: boolean;
  readonly includeDefault?: boolean;
  readonly defaultDisabled?: boolean;
  readonly onChange: (value: ColorPaletteValue) => void;
}

export function ColorPalette({
  value,
  options = DEFAULT_COLOR_PALETTE_OPTIONS,
  ariaLabel,
  defaultLabel,
  colorAriaLabel,
  disabled = false,
  includeDefault = true,
  defaultDisabled = false,
  onChange,
}: ColorPaletteProps) {
  const selectedEnabledIndex = options.findIndex(
    (option) => option.value === value && !option.disabled,
  );
  const firstEnabledIndex = options.findIndex((option) => !option.disabled);
  const defaultEnabled = includeDefault && !defaultDisabled;
  const handleKeyDown = handleColorPaletteKeyDown;

  return (
    <div class="rv-color-palette" role="radiogroup" aria-label={ariaLabel}>
      <div class="rv-color-palette__swatches">
        {options.map((option, index) => {
          const selected = option.value === value;
          const label = colorAriaLabel(option);
          return (
            <PaletteButton
              key={option.value}
              type="button"
              role="radio"
              class="rv-color-palette__swatch"
              data-rv-color-palette-value={option.value}
              label={label}
              aria-checked={selected ? 'true' : 'false'}
              disabled={disabled || option.disabled}
              tabIndex={
                !disabled &&
                (index === selectedEnabledIndex ||
                  (selectedEnabledIndex < 0 &&
                    (!defaultEnabled || value !== null) &&
                    index === firstEnabledIndex))
                  ? 0
                  : -1
              }
              style={{ '--rv-color-palette-color': option.value }}
              onKeyDown={handleKeyDown}
              onClick={() => onChange(option.value)}
            >
              {selected ? (
                <span
                  class="rv-color-palette__check"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: checkIcon }}
                />
              ) : null}
            </PaletteButton>
          );
        })}
      </div>
      {includeDefault ? (
        <PaletteButton
          type="button"
          role="radio"
          class="rv-color-palette__default"
          data-rv-color-palette-default=""
          aria-checked={value === null ? 'true' : 'false'}
          label={defaultLabel}
          disabled={disabled || defaultDisabled}
          tabIndex={
            !disabled &&
            !defaultDisabled &&
            (value === null || firstEnabledIndex < 0)
              ? 0
              : -1
          }
          onKeyDown={handleKeyDown}
          onClick={() => onChange(null)}
        >
          {value === null ? (
            <span
              class="rv-color-palette__default-check"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: checkIcon }}
            />
          ) : null}
          <span class="rv-color-palette__default-label">{defaultLabel}</span>
        </PaletteButton>
      ) : null}
    </div>
  );
}

function PaletteButton({
  label,
  children,
  onKeyDown,
  disabled,
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'onKeyDown'> & {
  readonly label: string;
  readonly onKeyDown: (event: KeyboardEvent) => void;
}) {
  const tooltip = useControlTooltip(label, true);
  return (
    <button
      {...props}
      disabled={disabled}
      aria-label={label}
      {...(!disabled ? tooltip.triggerProps : {})}
      onKeyDown={(event) => {
        tooltip.triggerProps.onKeyDown(event);
        if (!event.defaultPrevented) onKeyDown(event);
      }}
    >
      {children}
      {tooltip.tooltip}
    </button>
  );
}
