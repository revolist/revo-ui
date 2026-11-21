import { h, type JSX } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import {
  advanceAngle,
  angleFromPoint,
  MAX_ANGLE,
  normalizeAngle,
  pointOnDial,
  snapAngle,
  stepAngle,
} from './circular-slider-geometry';

export interface CircularSliderProps {
  /** Visible and accessible slider name. */
  label: string;
  /** Current angle in degrees when controlled. */
  value?: number;
  /** Initial uncontrolled angle in degrees. */
  defaultValue?: number;
  /** Angle increment for pointer and keyboard interaction. */
  step?: number;
  /** Reports the angle while the user adjusts it. */
  onValueChange?: (value: number) => void;
  /** Reports a completed pointer gesture or keyboard adjustment. */
  onValueCommit?: (value: number) => void;
  /** Accessible and visible value formatter. Defaults to an angle with a degree symbol. */
  formatValue?: (value: number) => string;
  /** Set to false to hide the value in the center of the dial. */
  showValue?: boolean;
  /** Set to true to display ticks every 60 degrees, or pass exact angles. */
  markers?: boolean | readonly number[];
  /** When markers is true, render ticks at step intervals, capped at 120 ticks. */
  markersAtSteps?: boolean;
  /** Dial diameter, in CSS pixels. */
  size?: number;
  /** Track thickness, in CSS pixels. */
  thickness?: number;
  /** Prevent focus and changes. Disabled values are excluded from forms. */
  disabled?: boolean;
  /** Keep the angle focusable and submittable while preventing changes. */
  readOnly?: boolean;
  /** Mark the slider as needing correction. */
  invalid?: boolean;
  /** DOM ID of help or validation text. */
  ariaDescribedBy?: string;
  /** Optional form field name. */
  name?: string;
  /** Optional ID for the focusable dial. */
  id?: string;
  /** Override the inherited writing direction. */
  dir?: 'ltr' | 'rtl';
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root classes. */
  className?: string;
}

interface DragState {
  id: number;
  raw: number;
  angle: number;
  value: number;
}

const formatAngle = (value: number) => `${value}°`;

/** A single-thumb dial for an angle between zero and one complete turn. */
export function CircularSlider({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  onValueCommit,
  step: stepProp = 1,
  formatValue = formatAngle,
  showValue = true,
  markers,
  markersAtSteps,
  size: sizeProp = 144,
  thickness: thicknessProp = 6,
  disabled,
  readOnly,
  invalid,
  ariaDescribedBy,
  name,
  id,
  dir,
  preset,
  className = '',
}: CircularSliderProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const [localValue, setLocalValue] = useState(defaultValue);
  const control = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>();
  const step =
    Number.isFinite(stepProp) && stepProp > 0
      ? Math.min(MAX_ANGLE, Math.max(stepProp, 0.000001))
      : 1;
  const angle = normalizeAngle(value ?? localValue);
  const valueText = formatValue(angle);
  const size = Math.max(56, Number.isFinite(sizeProp) ? sizeProp : 144);
  const thickness = Math.min(
    size / 5,
    Math.max(1, Number.isFinite(thicknessProp) ? thicknessProp : 6),
  );
  const thumbRadius = Math.max(6, thickness / 2 + 2);
  const center = size / 2;
  const radius = center - thumbRadius - 7;
  const thumb = pointOnDial(center, radius, angle);
  const tickInterval = markersAtSteps ? step * Math.ceil(3 / step) : 60;
  const ticks =
    markers === true
      ? Array.from(
          { length: Math.ceil(MAX_ANGLE / tickInterval) },
          (_, index) => index * tickInterval,
        )
      : Array.isArray(markers)
        ? [
            ...new Set(
              markers
                .filter(
                  (marker) =>
                    Number.isFinite(marker) &&
                    marker >= 0 &&
                    marker <= MAX_ANGLE,
                )
                .map((marker) => marker % MAX_ANGLE),
            ),
          ]
        : [];

  useEffect(() => {
    if (value !== undefined) return;
    const form = control.current?.closest('form');
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setLocalValue(defaultValue);
      });
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [defaultValue, value !== undefined]);

  function update(next: number) {
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }

  function readPointer(event: JSX.TargetedPointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width) return;
    const scale = size / box.width;
    const x = (event.clientX - box.left - box.width / 2) * scale;
    const y = (event.clientY - box.top - box.height / 2) * scale;
    const distance = Math.hypot(x, y);
    if (distance < radius / 3) return;
    return { raw: angleFromPoint(x, y), distance };
  }

  return (
    <div
      class={`rv-circular-slider ${preset?.className ?? ''} ${className}`.trim()}
      data-part="root"
      dir={dir}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
    >
      <span id={labelId} data-part="label" class="rv-circular-slider-label">
        {label}
      </span>
      {name && (
        <input type="hidden" name={name} value={angle} disabled={disabled} />
      )}
      <div
        class="rv-circular-slider-control"
        data-part="control"
        style={{ '--rv-circular-slider-size': `${size}px` }}
        ref={control}
        id={controlId}
        role="slider"
        aria-labelledby={labelId}
        aria-describedby={ariaDescribedBy}
        aria-valuemin={0}
        aria-valuemax={MAX_ANGLE}
        aria-valuenow={angle}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-invalid={invalid || undefined}
        tabIndex={disabled ? -1 : 0}
        onBlur={(event) => {
          delete event.currentTarget.dataset.pointerFocus;
        }}
        onPointerDown={(event) => {
          event.currentTarget.dataset.pointerFocus = '';
          if (disabled || readOnly || drag.current || event.button !== 0)
            return;
          const point = readPointer(event);
          if (
            !point ||
            Math.abs(point.distance - radius) > Math.max(thumbRadius + 4, 14)
          )
            return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          const grabbedThumb =
            event.target instanceof Element &&
            event.target.closest('[data-part="thumb"]');
          const initial = grabbedThumb
            ? angle
            : point.raw < 0.5 && angle > 180
              ? MAX_ANGLE
              : point.raw;
          const next = grabbedThumb ? angle : snapAngle(initial, step);
          drag.current = {
            id: event.pointerId,
            raw: point.raw,
            angle: initial,
            value: next,
          };
          if (next !== angle) update(next);
        }}
        onPointerMove={(event) => {
          const active = drag.current;
          if (!active || active.id !== event.pointerId || disabled || readOnly)
            return;
          const point = readPointer(event);
          if (!point) return;
          active.angle = advanceAngle(active.angle, active.raw, point.raw);
          active.raw = point.raw;
          const next = snapAngle(active.angle, step);
          if (next !== active.value) {
            active.value = next;
            update(next);
          }
        }}
        onPointerUp={(event) => {
          const active = drag.current;
          if (!active || active.id !== event.pointerId) return;
          drag.current = undefined;
          if (!disabled && !readOnly) onValueCommit?.(active.value);
        }}
        onLostPointerCapture={(event) => {
          if (drag.current?.id === event.pointerId) drag.current = undefined;
        }}
        onKeyDown={(event) => {
          const { key, currentTarget } = event;
          delete currentTarget.dataset.pointerFocus;
          if (
            ![
              'Home',
              'End',
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'PageUp',
              'PageDown',
            ].includes(key)
          )
            return;
          event.preventDefault();
          if (disabled || readOnly || drag.current) return;
          const rtl = getComputedStyle(currentTarget).direction === 'rtl';
          const increasing =
            key === 'ArrowUp' ||
            key === 'PageUp' ||
            key === (rtl ? 'ArrowLeft' : 'ArrowRight');
          const amount = event.shiftKey || key.startsWith('Page') ? 10 : 1;
          const next =
            key === 'Home'
              ? 0
              : key === 'End'
                ? MAX_ANGLE
                : stepAngle(angle, step, increasing ? amount : -amount);
          if (next === angle) return;
          update(next);
          onValueCommit?.(next);
        }}
      >
        <svg
          class="rv-circular-slider-ring"
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <circle
            data-part="track"
            cx={center}
            cy={center}
            r={radius}
            stroke-width={thickness}
          />
          {angle > 0 && (
            <circle
              data-part="fill"
              cx={center}
              cy={center}
              r={radius}
              stroke-width={thickness}
              pathLength={MAX_ANGLE}
              stroke-dasharray={`${angle} ${MAX_ANGLE}`}
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}
          {ticks.map((tick) => {
            const start = pointOnDial(center, radius + thickness / 2 + 3, tick);
            const end = pointOnDial(center, radius + thickness / 2 + 6, tick);
            return (
              <line
                key={tick}
                data-part="marker"
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
              />
            );
          })}
          <circle data-part="thumb" cx={thumb.x} cy={thumb.y} r={thumbRadius} />
        </svg>
        {showValue && (
          <span
            class="rv-circular-slider-value"
            data-part="value"
            aria-hidden="true"
          >
            {valueText}
          </span>
        )}
      </div>
    </div>
  );
}
