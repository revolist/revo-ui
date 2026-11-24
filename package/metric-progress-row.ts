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
  const row = doc.createElement('div');
  row.className = ['rv-metric-progress-row', options.className].filter(Boolean).join(' ');
  const label = doc.createElement('span');
  label.textContent = options.label;
  const meter = doc.createElement('progress');
  meter.max = Number.isFinite(options.maximum) && options.maximum > 0 ? options.maximum : 1;
  meter.value = Number.isFinite(options.value) ? Math.max(0, options.value!) : 0;
  meter.setAttribute('aria-label', options.meterLabel);
  const value = doc.createElement('strong');
  value.textContent = options.formattedValue;
  const detail = doc.createElement('small');
  detail.textContent = options.detail ?? '';
  detail.className = options.detailClassName ?? '';
  row.append(label, meter, value, detail);
  return row;
}
