import { Input, ButtonControl } from '../native-control';
import { normalizeHexColor } from './color-model';
/** @jsxImportSource preact */
import { h } from 'preact';
import { ColorPalette } from './color-palette';
import {
  COLOR_PICKER_DEFAULT_COLOR,
  COLOR_PICKER_HEX_LENGTH,
} from './color-picker.constants';
import { useEffect, useRef, useState } from 'preact/hooks';
import { createColorPickerId } from './color-picker.id';
import ban from '@fortawesome/fontawesome-free/svgs/solid/ban.svg?raw';
import chevronDown from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';
import palette from '@fortawesome/fontawesome-free/svgs/solid/palette.svg?raw';
import { useControlTooltip } from '../core/tooltip';

function PickerIcon({
  icon,
  className = 'rv-format-icon rv-format-color-picker__icon',
}: {
  icon: string;
  className?: string;
}) {
  return (
    <span
      class={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );
}

export function ColorPicker({
  label,
  value,
  defaultLabel,
  customLabel,
  customHexLabel,
  invalidColor,
  colorLabels,
  optional = true,
  allowHexInput = true,
  disabled = false,
  onChange,
}: {
  readonly label: string;
  readonly value?: string;
  readonly defaultLabel: string;
  readonly customLabel: string;
  readonly customHexLabel?: string;
  readonly invalidColor?: string;
  readonly colorLabels: Readonly<Record<string, string>>;
  readonly optional?: boolean;
  /** Set false for a selection-only palette and native color chooser. */
  readonly allowHexInput?: boolean;
  readonly disabled?: boolean;
  readonly onChange: (value: string | undefined) => void;
}) {
  const [pickerId] = useState(createColorPickerId);
  const tooltip = useControlTooltip(label, true, {
    className: 'rv-control-tooltip',
    placement: 'above',
  });
  const popoverId = `rv-format-color-popover-${pickerId}`;
  const customControlsId = `rv-format-color-custom-${pickerId}`;
  const hexErrorId = `rv-format-color-error-${pickerId}`;
  const anchorName = `--rv-format-color-anchor-${pickerId}`;
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [hex, setHex] = useState(value ?? COLOR_PICKER_DEFAULT_COLOR);
  const [invalidHex, setInvalidHex] = useState(false);
  useEffect(() => {
    setHex(value ?? COLOR_PICKER_DEFAULT_COLOR);
    setInvalidHex(false);
  }, [value]);
  const commitHex = (next: string) => {
    const normalized = normalizeHexColor(next);
    if (!normalized) {
      setInvalidHex(true);
      return;
    }
    setInvalidHex(false);
    setHex(normalized);
    if (!disabled) onChange(normalized);
  };
  const closePopover = () => popoverRef.current?.hidePopover?.();
  useEffect(() => {
    if (disabled) {
      closePopover();
      setOpen(false);
    }
  }, [disabled]);

  return (
    <div
      class="rv-format-color-picker"
      onKeyDownCapture={(event) => {
        // Escape dismisses this nested chooser before its containing dialog.
        if (
          event.key === 'Escape' &&
          popoverRef.current?.matches(':popover-open')
        ) {
          event.preventDefault();
          event.stopPropagation();
          closePopover();
        }
      }}
    >
      <ButtonControl
        unstyled
        type="button"
        class="rv-format-color-picker__trigger"
        aria-label={`${label}: ${value?.toUpperCase() ?? defaultLabel}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        {...tooltip.triggerProps}
        disabled={disabled}
        popovertarget={popoverId}
        style={`anchor-name: ${anchorName}`}
      >
        <span
          class={`rv-format-color-picker__trigger-swatch${value ? '' : ' rv-format-color-picker__trigger-swatch--empty'}`}
          style={value ? { backgroundColor: value } : undefined}
        >
          {!value ? (
            <PickerIcon
              icon={ban}
              className="rv-format-color-picker__empty-icon"
            />
          ) : null}
        </span>
        <span class="rv-format-color-picker__trigger-value">
          {value?.toUpperCase() ?? defaultLabel}
        </span>
        <PickerIcon icon={chevronDown} />
        {tooltip.tooltip}
      </ButtonControl>
      <div
        id={popoverId}
        ref={popoverRef}
        class="rv-format-color-picker__popover"
        role="dialog"
        aria-label={label}
        popover="auto"
        style={`position-anchor: ${anchorName}`}
        onToggle={(event) =>
          setOpen(event.currentTarget.matches(':popover-open'))
        }
      >
        <ColorPalette
          value={normalizeHexColor(value) ?? value ?? null}
          ariaLabel={label}
          defaultLabel={defaultLabel}
          colorAriaLabel={(option) => colorLabels[option.value] ?? option.label}
          includeDefault={optional}
          disabled={disabled}
          onChange={(next) => {
            if (disabled) return;
            onChange(next ?? undefined);
            closePopover();
          }}
        />
        <div
          id={customControlsId}
          class="rv-format-color-picker__custom-controls"
          data-selection-only={!allowHexInput || undefined}
          hidden={!customOpen}
        >
          <Input
            type="color"
            disabled={disabled}
            class="rv-format-color-picker__native"
            aria-label={customLabel}
            title={customLabel}
            value={normalizeHexColor(hex) ?? COLOR_PICKER_DEFAULT_COLOR}
            onInput={(event) => commitHex(event.currentTarget.value)}
          />
          {allowHexInput ? (
            <Input
              type="text"
              disabled={disabled}
              class="rv-control rv-format-color-picker__hex"
              inputMode="text"
              maxLength={COLOR_PICKER_HEX_LENGTH}
              aria-label={customHexLabel}
              aria-invalid={invalidHex}
              aria-describedby={invalidHex ? hexErrorId : undefined}
              title={customHexLabel}
              value={hex.toUpperCase()}
              onInput={(event) => {
                setHex(event.currentTarget.value);
                if (invalidHex) setInvalidHex(false);
              }}
              onChange={(event) => commitHex(event.currentTarget.value)}
            />
          ) : null}
          {allowHexInput && invalidHex ? (
            <span
              id={hexErrorId}
              class="rv-format-color-picker__error"
              role="alert"
            >
              {invalidColor}
            </span>
          ) : null}
        </div>
        <ButtonControl
          unstyled
          type="button"
          class="rv-format-color-picker__custom-action"
          disabled={disabled}
          aria-expanded={customOpen}
          aria-controls={customControlsId}
          title={customLabel}
          onClick={() => setCustomOpen((current) => !current)}
        >
          <PickerIcon icon={palette} />
          {customLabel}
        </ButtonControl>
      </div>
    </div>
  );
}

export { normalizeHexColor } from './color-model';
