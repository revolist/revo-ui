import { h } from 'preact';
import { createPreactElement } from './preact-mount';
import { renderLegend, type LegendProps } from './legend';

/** Create the shared legend in a native DOM host. */
export function createLegendElement(doc: Document, options: LegendProps): HTMLElement {
  return createPreactElement(doc, renderLegend(h, options));
}
