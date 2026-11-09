import { expect, it } from 'vitest';
import { parseIsoLocalCivilDateTime } from './civil-time';

it.each(['2026-02-30T12:00', '2026-08-12T24:00', '2026-13-12T10:00'])(
  'rejects normalized civil input %s',
  (value) => {
    expect(parseIsoLocalCivilDateTime(value)).toBeUndefined();
  },
);
