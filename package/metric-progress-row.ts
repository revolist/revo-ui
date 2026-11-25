import { h } from 'preact';
import { createPreactElement } from './preact-mount';
import { renderProgressBar } from './progress/bar';

export interface MetricProgressRowOptions {
  label: string;
  meterLabel: string;
  value: number | null;
  maximum: number;
  formattedValue: string;
  detail?: string;
  detailClassName?: string;
  className?: string;
}

/** Create a labelled metric row while leaving formatting and wording to the host. */
export function createMetricProgressRow(doc: Document, options: MetricProgressRowOptions): HTMLElement {
  const max = Number.isFinite(options.maximum) && options.maximum > 0 ? options.maximum : 1;
  const value = typeof options.value === 'number' && Number.isFinite(options.value) ? options.value : 0;
  return createPreactElement(doc, h('div', { class: ['rv-metric-progress-row', options.className].filter(Boolean).join(' ') },
    h('span', { class: 'rv-metric-progress-row__label' }, options.label),
    renderProgressBar(h, { value, max, ariaLabel: options.meterLabel }),
    h('strong', { class: 'rv-metric-progress-row__value' }, options.formattedValue),
    h('small', { class: ['rv-metric-progress-row__detail', options.detailClassName].filter(Boolean).join(' ') }, options.detail ?? ''),
  ));
}
