/** @jsxImportSource preact */
import { h } from 'preact';
import { Input } from '../../../native-control';

export type SingleValueSliderProps = {
  min: number;
  max: number;
  value: number;
  step?: number | string;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel: string;
  ariaValueText?: string;
  ariaDescribedBy?: string;
  onChange: (
    value: number,
    event: Event & { currentTarget: HTMLInputElement },
  ) => void;
  onCommit?: (
    value: number,
    event: Event & { currentTarget: HTMLInputElement },
  ) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
};

/** Shared native single-thumb slider for scalar thresholds and tolerances. */
export function SingleValueSlider({
  min,
  max,
  value,
  step = 1,
  disabled = false,
  id,
  className = '',
  ariaLabel,
  ariaValueText,
  ariaDescribedBy,
  onChange,
  onCommit,
  onKeyDown,
}: SingleValueSliderProps): any {
  const span = max - min;
  const percent =
    span > 0 ? Math.max(0, Math.min(100, ((value - min) / span) * 100)) : 0;

  return (
    <Input
      class={`rv-single-slider ${className}`.trim()}
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      style={{ '--rv-single-slider-value': `${percent}%` }}
      aria-label={ariaLabel}
      aria-valuetext={ariaValueText}
      aria-describedby={ariaDescribedBy}
      onKeyDown={onKeyDown}
      onInput={(event) => onChange(Number(event.currentTarget.value), event)}
      onChange={(event) => onCommit?.(Number(event.currentTarget.value), event)}
    />
  );
}

export interface SliderFieldProps extends SingleValueSliderProps {
  label: string;
  layout?: 'inline' | 'stacked';
  valuePlacement?: 'end' | 'thumb' | 'none';
  formatValue?: (value: number) => string;
  /** Number of evenly spaced decorative tick marks, bounded to 2–101. */
  ticks?: number;
  accentColor?: string;
}

/** Label/value composition over the same native single-thumb input. */
export function SliderField({
  label,
  layout = 'inline',
  valuePlacement = 'end',
  formatValue = String,
  ticks,
  accentColor,
  ...slider
}: SliderFieldProps) {
  const text = formatValue(slider.value);
  const percent =
    slider.max > slider.min
      ? Math.max(
          0,
          Math.min(
            100,
            ((slider.value - slider.min) / (slider.max - slider.min)) * 100,
          ),
        )
      : 0;
  const tickCount =
    ticks && Number.isFinite(ticks)
      ? Math.max(2, Math.min(101, Math.floor(ticks)))
      : 0;
  return (
    <label
      class={`rv-slider-field rv-slider-field--${layout} rv-slider-field--${valuePlacement}${slider.disabled ? ' is-disabled' : ''}`}
      style={
        accentColor ? { '--rv-slider-field-accent': accentColor } : undefined
      }
    >
      <span class="rv-slider-field__label">{label}</span>
      <span
        class="rv-slider-field__track"
        style={{ '--rv-slider-field-position': `${percent / 100}` }}
      >
        <SingleValueSlider
          {...slider}
          ariaValueText={slider.ariaValueText ?? text}
        />
        {tickCount > 0 && (
          <span class="rv-slider-field__ticks" aria-hidden="true">
            {Array.from({ length: tickCount }, (_, index) => (
              <i key={index} />
            ))}
          </span>
        )}
        {valuePlacement === 'thumb' && (
          <span class="rv-slider-field__thumb-value" aria-hidden="true">
            {text}
          </span>
        )}
      </span>
      {valuePlacement === 'end' && (
        <span
          class="rv-slider-field__value rv-badge rv-badge--inline"
          aria-hidden="true"
        >
          {text}
        </span>
      )}
    </label>
  );
}
