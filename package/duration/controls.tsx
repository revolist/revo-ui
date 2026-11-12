/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { Dropdown } from '../dropdown';
import { SingleValueSlider } from '../filter/filters/slider/single';
import { SegmentedSwitch } from '../segmented-switch';
import type { DurationUnit } from '@revolist/ui-dates';
import type { DurationFieldOptions } from './index';
import '../filter/filters/slider/_slider.scss';

const unitLabels: Record<DurationUnit, string> = {
  minute: 'min',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'qtr',
  year: 'year',
};
/** Optional presentation controls. Numeric conversion and validation stay in the dates owner. */
export function DurationControls(
  props: DurationFieldOptions & {
    unit: DurationUnit;
    amount: number;
    draft: string;
    elapsed: boolean;
    label?: string;
    disabled?: boolean;
    onChange: (value: number, unit?: DurationUnit, elapsed?: boolean) => void;
    onCommit?: (value: number, unit?: DurationUnit, elapsed?: boolean) => void;
  },
) {
  const { unit, amount } = props;
  const choose = props.onCommit ?? props.onChange;
  const units = [
    ...new Set(
      props.allowedUnits ?? (Object.keys(unitLabels) as DurationUnit[]),
    ),
  ];
  const slider = typeof props.slider === 'object' ? props.slider : {};
  const minimum = Number.isFinite(props.min) ? Math.max(0, props.min!) : 0;
  const fallbackMax = Math.max(minimum + 100, amount);
  const maximum = Number.isFinite(props.max)
    ? props.max!
    : Number.isFinite(slider.max)
      ? slider.max!
      : fallbackMax;
  const step =
    Number.isFinite(slider.step) && slider.step! > 0 ? slider.step! : 1;
  return (
    <>
      {props.slider && (
        <span class="rv-duration-field__slider">
          <SingleValueSlider
            min={minimum}
            max={maximum}
            step={step}
            value={props.amount}
            disabled={props.disabled || maximum <= minimum}
            ariaLabel={props.label ?? 'Duration'}
            ariaValueText={props.draft}
            onChange={(value) => props.onChange(value)}
            onCommit={
              props.onCommit ? (value) => props.onCommit?.(value) : undefined
            }
          />
          <span class="rv-duration-field__bounds" aria-hidden="true">
            <span>{minimum}</span>
            <span>
              {maximum} {props.unitLabels?.[unit] ?? unitLabels[unit]}
            </span>
          </span>
        </span>
      )}
      {props.unitButtons && (
        <span class="rv-duration-field__modes">
          {units.length === 0 ? null : units.length > 5 ? (
            <Dropdown
              className="rv-select"
              config={{
                ariaLabel: props.unitLabel ?? 'Duration unit',
                topLayer: true,
              }}
              source={units.map((value) => ({
                value,
                label: props.unitLabels?.[value] ?? unitLabels[value],
              }))}
              value={unit}
              disabled={props.disabled}
              onChange={(value) => choose(amount, value as DurationUnit)}
            />
          ) : (
            <SegmentedSwitch
              role="radiogroup"
              ariaLabel={props.unitLabel ?? 'Duration unit'}
              value={unit}
              options={units.map((value) => ({
                value,
                label: props.unitLabels?.[value] ?? unitLabels[value],
                ariaLabel: props.unitLabels?.[value] ?? value,
              }))}
              disabled={props.disabled}
              onChange={(next) => choose(amount, next)}
            />
          )}
          {props.allowElapsed && (
            <SegmentedSwitch
              role="radiogroup"
              ariaLabel={props.modeLabel ?? 'Duration mode'}
              value={props.elapsed ? 'elapsed' : 'working'}
              options={[
                { value: 'working', label: props.workingLabel ?? 'Working' },
                { value: 'elapsed', label: props.elapsedLabel ?? 'Elapsed' },
              ]}
              disabled={props.disabled}
              onChange={(next) => choose(amount, unit, next === 'elapsed')}
            />
          )}
        </span>
      )}
    </>
  );
}
