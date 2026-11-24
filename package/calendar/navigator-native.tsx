import { h } from 'preact';
import { renderPreactInto } from '../preact-mount';
import { CalendarNavigator, type CalendarNavigatorProps } from './navigator';

/** Mount a controlled navigator in a framework-neutral host. */
export function mountCalendarNavigator(
  host: HTMLElement,
  initial: CalendarNavigatorProps,
) {
  let destroyed = false;
  const update = (props: CalendarNavigatorProps) => {
    if (!destroyed) renderPreactInto(host, <CalendarNavigator {...props} />);
  };
  update(initial);
  return {
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      renderPreactInto(host, null);
    },
  };
}
