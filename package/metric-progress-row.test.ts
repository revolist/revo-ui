import { expect, it } from 'vitest';
import { createMetricProgressRow } from './metric-progress-row';

it('renders accessible, localized metric values and handles missing values', () => {
  const row = createMetricProgressRow(document, {
    label: 'Crescimento',
    meterLabel: 'Pontuação de crescimento',
    value: null,
    maximum: 0,
    formattedValue: '—',
    detail: 'de 50',
  });
  const meter = row.querySelector('[role=progressbar]')!;
  expect(meter.getAttribute('aria-label')).toBe('Pontuação de crescimento');
  expect(meter.getAttribute('aria-valuemax')).toBe('1');
  expect(meter.getAttribute('aria-valuenow')).toBe('0');
  expect(meter.querySelector('.rv-progress-bar__fill')).not.toBeNull();
  expect(row.textContent).toContain('de 50');
});
