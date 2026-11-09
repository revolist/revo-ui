import { describe, expect, it } from 'vitest';
import {
  excelSerialToSpreadsheetDateParts,
  parseSpreadsheetDateDisplay,
  parseSpreadsheetDateTimeDisplay,
  resolveSpreadsheetDateOrder,
  spreadsheetDateToExcelSerial,
  spreadsheetDateToExcelSerialInTimeZone,
  usesSpreadsheetTwelveHourClock,
} from './spreadsheet-date';

describe('spreadsheet date parts', () => {
  it('resolves locale date order in the shared dates owner', () => {
    expect(resolveSpreadsheetDateOrder('en-US')).toBe('mdy');
    expect(resolveSpreadsheetDateOrder('ja-JP')).toBe('ymd');
    expect(resolveSpreadsheetDateOrder('sv-SE')).toBe('ymd');
    expect(resolveSpreadsheetDateOrder('fr-FR')).toBe('dmy');
  });

  it('resolves locale hour cycles in the shared dates owner', () => {
    expect(usesSpreadsheetTwelveHourClock('en-AU')).toBe(true);
    expect(usesSpreadsheetTwelveHourClock('en-CA')).toBe(true);
    expect(usesSpreadsheetTwelveHourClock('de-DE')).toBe(false);
  });
  it('preserves Excel serial 60 as the fictional leap day', () => {
    expect(excelSerialToSpreadsheetDateParts(60.5)).toMatchObject({
      year: 1900,
      month: 2,
      day: 29,
      hour: 12,
      fictionalLeapDay: true,
    });
  });

  it('resolves fractional and elapsed time fields', () => {
    expect(excelSerialToSpreadsheetDateParts(2.25)).toMatchObject({
      year: 1900,
      month: 1,
      day: 2,
      hour: 6,
      elapsedHours: 54,
      elapsedMinutes: 3_240,
    });
  });

  it('uses the real calendar weekday after Excel serial 60', () => {
    expect(excelSerialToSpreadsheetDateParts(46254)?.weekday).toBe(4);
    expect(excelSerialToSpreadsheetDateParts(60)?.weekday).toBe(4);
  });

  it('round-trips ordinary local calendar dates through Excel serials', () => {
    const date = new Date(2026, 7, 21, 14, 30, 15, 250);
    const serial = spreadsheetDateToExcelSerial(date)!;
    expect(excelSerialToSpreadsheetDateParts(serial)).toMatchObject({
      year: 2026,
      month: 8,
      day: 21,
      hour: 14,
      minute: 30,
      second: 15,
      millisecond: 250,
    });
  });

  it('encodes the calendar fields displayed in a requested timezone', () => {
    const instant = new Date('2026-01-01T00:00:00.250Z');
    expect(
      spreadsheetDateToExcelSerialInTimeZone(instant, 'America/New_York'),
    ).toBe(spreadsheetDateToExcelSerial(new Date(2025, 11, 31, 19, 0, 0, 250)));
  });

  it('parses locale-ordered Excel display dates with the spreadsheet two-digit cutoff', () => {
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('8/20/26', 'mdy')!,
      ),
    ).toBe(46254);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('20/8/26', 'dmy')!,
      ),
    ).toBe(46254);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('2026-8-20', 'ymd')!,
      ),
    ).toBe(46254);
    expect(parseSpreadsheetDateDisplay('2/30/26', 'mdy')).toBeUndefined();
  });

  it('parses localized month names without guessing ambiguous one-letter months', () => {
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay(
          'Thursday, August 20, 2026',
          'mdy',
          'en-US',
        )!,
      ),
    ).toBe(46254);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('20 août 2026', 'dmy', 'fr-FR')!,
      ),
    ).toBe(46254);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay(
          'martes, 18 de agosto de 2026',
          'dmy',
          'es-ES',
        )!,
      ),
    ).toBe(46252);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('martedì 18 agosto 2026', 'dmy', 'it-IT')!,
      ),
    ).toBe(46252);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('18 августа 2026 г.', 'dmy', 'ru-RU')!,
      ),
    ).toBe(46252);
    expect(
      spreadsheetDateToExcelSerial(
        parseSpreadsheetDateDisplay('18 sierpnia 2026', 'dmy', 'pl-PL')!,
      ),
    ).toBe(46252);
    expect(
      parseSpreadsheetDateDisplay('20 A 2026', 'dmy', 'en-US'),
    ).toBeUndefined();
  });

  it('parses time, date-time, fractional seconds, and elapsed display values', () => {
    expect(
      parseSpreadsheetDateTimeDisplay('4:36:03 PM', {
        hasTime: true,
      }),
    ).toBeCloseTo((16 * 3600 + 36 * 60 + 3) / 86400, 10);
    expect(
      parseSpreadsheetDateTimeDisplay('8/20/26 16:36:03.25', {
        dateOrder: 'mdy',
        hasDate: true,
        hasTime: true,
      }),
    ).toBeCloseTo(46254 + (16 * 3600 + 36 * 60 + 3.25) / 86400, 10);
    expect(
      parseSpreadsheetDateTimeDisplay('49:30:00', {
        hasTime: true,
        elapsedUnit: 'h',
      }),
    ).toBeCloseTo(49.5 / 24, 10);
    expect(
      parseSpreadsheetDateTimeDisplay('24:01', { hasTime: true }),
    ).toBeUndefined();
    expect(
      parseSpreadsheetDateTimeDisplay('25:75', {
        hasTime: true,
        elapsedUnit: 'h',
      }),
    ).toBeUndefined();
  });
});
