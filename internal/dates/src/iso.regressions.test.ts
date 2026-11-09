import { expect, it } from 'vitest';
import {
  formatIsoDateInTimeZone,
  formatLocalIsoDateTimeInTimeZone,
} from './iso';

it.each(['0001', '0099', '0999', '2026'])(
  'preserves four-digit year %s in timezone control values',
  (year) => {
    const instant = new Date(`${year}-02-28T12:30:00Z`);
    expect(formatIsoDateInTimeZone(instant, 'UTC')).toBe(`${year}-02-28`);
    expect(formatLocalIsoDateTimeInTimeZone(instant, 'UTC')).toBe(
      `${year}-02-28T12:30:00`,
    );
  },
);
