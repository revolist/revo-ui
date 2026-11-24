import { h } from 'preact';
import {
  SegmentedSwitch,
  type SegmentedSwitchOption,
  type SegmentedSwitchValue,
} from '../segmented-switch';

/** A controlled selector for caller-defined calendar periods. */
export interface CalendarPeriodSelectorProps<T extends SegmentedSwitchValue = SegmentedSwitchValue> {
  value: T;
  options: SegmentedSwitchOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function CalendarPeriodSelector<T extends SegmentedSwitchValue>(props: CalendarPeriodSelectorProps<T>) {
  return <SegmentedSwitch {...props} role="group" className={`rv-calendar-period-selector ${props.className ?? ''}`} />;
}
