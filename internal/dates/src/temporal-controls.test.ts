import { expect, it, vi } from 'vitest';
import {
  formatClockControl,
  isTimeControlAllowed,
  parseClockControl,
  temporalFromControl,
  temporalToControl,
  timeControlSeconds,
} from './temporal-controls';
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
it.each([
  ['America/New_York', '2024-03-10T02:30', undefined],
  ['America/New_York', '2024-11-03T01:30', '2024-11-03T05:30:00.000Z'],
  ['Australia/Lord_Howe', '2024-10-06T02:15', undefined],
  ['Australia/Lord_Howe', '2024-04-07T01:45', '2024-04-06T14:45:00.000Z'],
  ['Pacific/Apia', '2011-12-30T12:00', undefined],
] as const)(
  'resolves zoned datetime edits in %s at %s',
  (zone, draft, expected) => {
    expect(temporalFromControl('datetime', draft, undefined, zone)).toBe(
      expected,
    );
  },
);

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
it('provides deterministic 12/24-hour clock formatting and second-precision parsing', () => {
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

it('keeps civil dates and pure clocks valid during the Beirut midnight gap', () => {
  vi.stubEnv('TZ', 'Asia/Beirut');
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-03-31T10:00:00Z'));
  try {
    expect(
      temporalFromControl('date', '2024-03-31', undefined, 'Asia/Beirut'),
    ).toBe('2024-03-31');
    expect(timeControlSeconds('00:15')).toBe(900);
    expect(formatClockControl('00:15', '24h')).toBe('00:15');
    expect(parseClockControl('00:15')).toBe('00:15');
    expect(
      temporalFromControl(
        'datetime',
        '2024-03-31T00:15',
        undefined,
        'Asia/Beirut',
      ),
    ).toBeUndefined();
  } finally {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  }
});

it('preserves explicit fractions in Kolkata and when editing Beirut’s repeated hour', () => {
  expect(
    temporalFromControl(
      'datetime',
      '2024-02-29T00:00:00.123',
      undefined,
      'Asia/Kolkata',
    ),
  ).toBe('2024-02-28T18:30:00.123Z');
  expect(
    temporalFromControl(
      'datetime',
      '2024-10-26T23:15:00.1',
      undefined,
      'Asia/Beirut',
    ),
  ).toBe('2024-10-26T20:15:00.100Z');
  expect(
    temporalFromControl(
      'datetime',
      '2024-10-26T23:15:00.2',
      '2024-10-26T21:15:00.100Z',
      'Asia/Beirut',
    ),
  ).toBe('2024-10-26T21:15:00.200Z');
});

it('validates zoned civil values independently of a gap in the browser timezone', () => {
  expect(
    temporalFromControl('datetime', '2026-03-29T01:30', undefined, 'UTC'),
  ).toBe('2026-03-29T01:30:00.000Z');
});
