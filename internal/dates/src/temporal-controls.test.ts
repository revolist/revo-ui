import { expect, it } from 'vitest';
import { temporalFromControl, temporalToControl } from './temporal-controls';
it('preserves civil dates and unchanged instant precision across timezone projection', () => {
  expect(temporalToControl('date', '2026-03-29', 'America/Los_Angeles')).toBe(
    '2026-03-29',
  );
  const original = '2026-10-25T01:30:00.123Z';
  const local = temporalToControl('datetime', original, 'Europe/London');
  expect(local).toContain('01:30');
  expect(
    temporalFromControl('datetime', local, original, 'Europe/London'),
  ).toBe(original);
});
it('rejects timezone gaps and preserves the earlier-fold rule for new repeated times', () => {
  expect(
    temporalFromControl(
      'datetime',
      '2026-03-29T01:30',
      undefined,
      'Europe/London',
    ),
  ).toBeUndefined();
  expect(
    temporalFromControl(
      'datetime',
      '2026-10-25T01:30',
      undefined,
      'Europe/London',
    ),
  ).toBe('2026-10-25T00:30:00.000Z');
});
it('retains Date and spreadsheet-number representations, distinguishes invalid and clear', () => {
  expect(
    temporalFromControl('date', '2026-01-08', new Date(2026, 0, 1)),
  ).toBeInstanceOf(Date);
  expect(typeof temporalFromControl('date', '2026-01-08', 46023)).toBe(
    'number',
  );
  expect(temporalFromControl('date', '')).toBeNull();
  expect(temporalFromControl('date', '2026-02-31')).toBeUndefined();
  expect(
    temporalFromControl(
      'datetime',
      temporalToControl('datetime', '2026-01-01'),
      '2026-01-01',
    ),
  ).toContain('T');
});
it('preserves an instant clock when changing its date and edits zoned clock fields correctly', () => {
  const original = new Date('2026-01-01T09:30:20.000Z');
  expect(
    (
      temporalFromControl('date', '2026-01-08', original, 'UTC') as Date
    ).toISOString(),
  ).toBe('2026-01-08T09:30:20.000Z');
  expect(
    (
      temporalFromControl('time', '10:45', original, 'America/New_York') as Date
    ).toISOString(),
  ).toBe('2026-01-01T15:45:00.000Z');
});
it('provides deterministic 12/24-hour clock formatting and second-precision parsing', async () => {
  const { formatClockControl, parseClockControl, isTimeControlAllowed } =
    await import('./temporal-controls');
  expect(formatClockControl('13:45', '12h')).toBe('01:45 PM');
  expect(formatClockControl('00:00', '24h')).toBe('00:00');
  expect(parseClockControl('1:45:20 pm', 'second')).toBe('13:45:20');
  expect(parseClockControl('13:45 AM')).toBeUndefined();
  expect(
    parseClockControl(
      formatClockControl('13:45', '12h', 'minute', 'ar-EG'),
      'minute',
      'ar-EG',
    ),
  ).toBe('13:45');
  for (const locale of ['fi-FI', 'zh-CN']) {
    expect(
      parseClockControl(
        formatClockControl('13:45', '12h', 'minute', locale),
        'minute',
        locale,
      ),
    ).toBe('13:45');
  }
  expect(isTimeControlAllowed('09:31', { min: '09:00', step: 900 })).toBe(
    false,
  );
});

it('validates zoned civil values independently of a gap in the browser timezone', () => {
  expect(
    temporalFromControl('datetime', '2026-03-29T01:30', undefined, 'UTC'),
  ).toBe('2026-03-29T01:30:00.000Z');
});
