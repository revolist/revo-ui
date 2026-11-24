import { h } from 'preact';
import {
  MetricPanel,
  MetricTile,
  type MetricPanelProps,
  type MetricTileProps,
} from './metric-panel';
import {
  createPreactElement,
  releasePreactElement,
  renderPreactInto,
} from './preact-mount';

/** Mount or update a panel on an application-owned native host. */
export function renderMetricPanelInto(
  host: HTMLElement,
  props: MetricPanelProps,
): void {
  renderPreactInto(host, <MetricPanel {...props} />);
}
export function createMetricPanelElement(
  document: Document,
  props: MetricPanelProps,
): HTMLElement {
  const host = createPreactElement<HTMLElement>(document, <div />);
  renderMetricPanelInto(host, props);
  return host;
}
export function createMetricTileElement(
  document: Document,
  props: MetricTileProps,
): HTMLElement {
  return createPreactElement<HTMLElement>(document, <MetricTile {...props} />);
}
/** Unmount a native panel or standalone tile created by this module. */
export function releaseMetricElement(element: HTMLElement): void {
  renderPreactInto(element, null);
  releasePreactElement(element);
}
