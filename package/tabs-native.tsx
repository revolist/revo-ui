import { h } from 'preact';
import { Tabs } from './controls';
import { renderPreactInto } from './preact-mount';
import type { SegmentedSwitchProps, SegmentedSwitchValue } from './segmented-switch';

/** Mount controlled tabs in a framework-neutral host. */
export function mountTabs<T extends SegmentedSwitchValue>(host: HTMLElement, initial: SegmentedSwitchProps<T>) {
  let destroyed = false;
  const update = (props: SegmentedSwitchProps<T>) => {
    if (!destroyed) renderPreactInto(host, <Tabs {...props} />);
  };
  update(initial);
  return { update, destroy() { if (!destroyed) { destroyed = true; renderPreactInto(host, null); } } };
}
