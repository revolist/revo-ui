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
export function createMetricProgressRow(
  doc: Document,
  options: MetricProgressRowOptions,
): HTMLElement {
  const row = doc.createElement('div');
  row.className = ['rv-metric-progress-row', options.className]
    .filter(Boolean)
    .join(' ');
  const label = doc.createElement('span');
  label.className = 'rv-metric-progress-row__label';
  label.textContent = options.label;
  const max =
    Number.isFinite(options.maximum) && options.maximum > 0
      ? options.maximum
      : 1;
  const value =
    typeof options.value === 'number' && Number.isFinite(options.value)
      ? options.value
      : 0;
  const meter = createPreactElement<HTMLElement>(
    doc,
    renderProgressBar(h, {
      value,
      max,
      ariaLabel: options.meterLabel,
    }),
  );
  const formatted = doc.createElement('strong');
  formatted.className = 'rv-metric-progress-row__value';
  formatted.textContent = options.formattedValue;
  const detail = doc.createElement('small');
  detail.textContent = options.detail ?? '';
  detail.className = ['rv-metric-progress-row__detail', options.detailClassName]
    .filter(Boolean)
    .join(' ');
  row.append(label, meter, formatted, detail);
  return row;
}
