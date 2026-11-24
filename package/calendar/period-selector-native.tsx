import { h } from 'preact';
import { renderPreactInto } from '../preact-mount';
import type { SegmentedSwitchValue } from '../segmented-switch';
import { CalendarPeriodSelector, type CalendarPeriodSelectorProps } from './period-selector';

/** Mount a controlled calendar period selector in a framework-neutral host. */
export function mountCalendarPeriodSelector<T extends SegmentedSwitchValue>(host: HTMLElement, initial: CalendarPeriodSelectorProps<T>) {
  let destroyed = false;
  const update = (props: CalendarPeriodSelectorProps<T>) => {
    if (!destroyed) renderPreactInto(host, <CalendarPeriodSelector {...props} />);
  };
  update(initial);
  return { update, destroy() { if (!destroyed) { destroyed = true; renderPreactInto(host, null); } } };
}
