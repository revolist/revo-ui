import { h } from 'preact';
import { useState } from 'preact/hooks';
import { CalendarPicker, type CalendarRangeSelection } from '@revolist/ui/calendar/index';
import { parseIsoDate, type ISODateString } from '@revolist/ui-dates';
import { DateTimeField } from '@revolist/ui/date-time';
import { Example } from './catalog';
const reference = '2026-10-24' as const;
const translations = {
  previousMonth: 'ماه قبل',
  nextMonth: 'ماه بعد',
  chooseMonth: 'انتخاب ماه',
  chooseYear: 'انتخاب سال',
  calendar: 'تقویم',
  today: 'امروز',
};
export function CalendarExamples() {
  const [range, setRange] = useState<CalendarRangeSelection | undefined>({
    from: '2026-10-12',
    to: '2026-10-17',
  });
  const [multiple, setMultiple] = useState<readonly ISODateString[]>([
    '2026-10-12',
    '2026-10-15',
    '2026-10-20',
  ]);
  const [dropdown, setDropdown] = useState<ISODateString | undefined>(
    '2026-10-24',
  );
  const [preset, setPreset] = useState<ISODateString | undefined>(reference);
  const [presetError, setPresetError] = useState('');
  const [timed, setTimed] = useState<ISODateString | undefined>(reference);
  const [start, setStart] = useState('09:00'),
    [end, setEnd] = useState('17:00');
  const [booked, setBooked] = useState<ISODateString | undefined>();
  const [weeks, setWeeks] = useState<ISODateString | undefined>(reference);
  const [persian, setPersian] = useState<ISODateString | undefined>(
    '2024-03-20',
  );
  const [hijri, setHijri] = useState<ISODateString | undefined>('2026-10-24');
  const [zone, setZone] = useState<ISODateString | undefined>('2026-10-23');
  const [natural, setNatural] = useState<ISODateString | undefined>(
    '2021-02-14',
  );
  return (
    <>
      <Example title="Range calendar">
        <CalendarPicker
          mode="range"
          selected={range}
          onSelectionChange={setRange}
          defaultMonth="2026-10-01"
          numberOfMonths={2}
          pagedNavigation
          min={2}
          max={14}
          excludeDisabled
          isDateDisabled={(date) => date === '2026-10-25'}
          referenceDate={reference}
        />
        <p class="rv-form-description">
          2–14 nights. October 25 is unavailable.
        </p>
      </Example>
      <Example title="Multiple dates">
        <CalendarPicker
          mode="multiple"
          selected={multiple}
          onSelectionChange={setMultiple}
          defaultMonth="2026-10-01"
          required
          min={1}
          max={5}
          referenceDate={reference}
        />
        <p class="rv-form-description">Choose up to five dates.</p>
      </Example>
      <Example title="Month and year dropdowns">
        <CalendarPicker
          selected={dropdown}
          onSelectionChange={setDropdown}
          defaultMonth="2026-10-01"
          captionLayout="dropdown"
          startMonth="2020-01-01"
          endMonth="2030-12-01"
          referenceDate={reference}
        />
      </Example>
      <Example title="Calendar presets">
        <CalendarPicker
          selected={preset}
          onSelectionChange={(date) => {
            setPreset(date);
            setPresetError('');
          }}
          validateSelection={(date) =>
            date === '2026-10-25' ? 'Tomorrow is unavailable.' : true
          }
          onInvalidSelection={setPresetError}
          defaultMonth="2026-10-01"
          referenceDate={reference}
          presets={[
            { label: 'Today', selection: reference },
            { label: 'Tomorrow', selection: '2026-10-25' },
            { label: 'In a week', selection: '2026-10-31' },
          ]}
        />
        {presetError ? <p role="status">{presetError}</p> : null}
      </Example>
      <Example title="Date and time calendar">
        <CalendarPicker
          selected={timed}
          onSelectionChange={setTimed}
          defaultMonth="2026-10-01"
          referenceDate={reference}
          footer={
            <div class="rv-form-grid">
              <label class="rv-field">
                <span class="rv-field__label">Start time</span>
                <DateTimeField kind="time" value={start} onValueChange={setStart}
                  picker={{ timeFormat: '24h', text: { chooseTime: 'Choose start time' } }} />
              </label>
              <label class="rv-field">
                <span class="rv-field__label">End time</span>
                <DateTimeField kind="time" value={end} onValueChange={setEnd}
                  picker={{ timeFormat: '24h', text: { chooseTime: 'Choose end time' } }} />
              </label>
            </div>
          }
        />
      </Example>
      <Example title="Booked dates and custom cells">
        <CalendarPicker
          selected={booked}
          onSelectionChange={setBooked}
          defaultMonth="2026-10-01"
          referenceDate={reference}
          cellSize={40}
          isDateDisabled={(date) =>
            date >= '2026-10-12' && date <= '2026-10-15'
          }
          dayClassName={(date) =>
            date >= '2026-10-12' && date <= '2026-10-15'
              ? 'calendar-booked'
              : undefined
          }
          formatDayLabel={(date, locale) => `${Number(date.slice(8, 10))} $100, ${new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parseIsoDate(date))}`}
          renderDay={(date) => (
            <span class="calendar-price">
              <span>{Number(date.slice(8, 10))}</span>
              <small> $100</small>
            </span>
          )}
        />
      </Example>
      <Example title="Calendar week numbers">
        <CalendarPicker
          selected={weeks}
          onSelectionChange={setWeeks}
          defaultMonth="2026-10-01"
          showWeekNumber
          weekNumbering="iso"
          referenceDate={reference}
        />
      </Example>
      <Example title="Persian calendar">
        <CalendarPicker
          selected={persian}
          onSelectionChange={setPersian}
          defaultMonth="2024-03-20"
          calendarSystem="persian"
          locale="fa-IR"
          dir="rtl"
          weekStartsOn={6}
          captionLayout="dropdown"
          startMonth="2023-03-21"
          endMonth="2027-03-20"
          translations={translations}
        />
      </Example>
      <Example title="Hijri calendar">
        <CalendarPicker
          selected={hijri}
          onSelectionChange={setHijri}
          defaultMonth="2026-10-24"
          calendarSystem="islamic-umalqura"
          locale="ar-SA"
          dir="rtl"
          weekStartsOn={0}
          captionLayout="dropdown"
          startMonth="2025-01-01"
          endMonth="2027-12-31"
          translations={{
            previousMonth: 'الشهر السابق',
            nextMonth: 'الشهر التالي',
            chooseMonth: 'اختر الشهر',
            chooseYear: 'اختر السنة',
            calendar: 'التقويم',
          }}
        />
      </Example>
      <Example title="Timezone-safe calendar">
        <CalendarPicker
          selected={zone}
          onSelectionChange={setZone}
          defaultMonth="2026-10-01"
          referenceInstant={new Date('2026-10-24T00:30:00Z')}
          timeZone="America/Los_Angeles"
          showTodayButton
        />
        <p class="rv-form-description">
          The reference instant is October 23 in Los Angeles. Selection remains
          an ISO date.
        </p>
      </Example>
      <Example title="Natural weeks and locked navigation">
        <CalendarPicker
          selected={natural}
          onSelectionChange={setNatural}
          defaultMonth="2021-02-01"
          fixedWeeks={false}
          showOutsideDays={false}
          disableNavigation
          captionLayout="dropdown"
          weekStartsOn={1}
        />
      </Example>
    </>
  );
}
