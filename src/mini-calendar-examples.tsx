import { addDays, type ISODateString } from '@revolist/ui-dates';
import { Button, MiniCalendar } from '@revolist/ui/preact';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Example } from './catalog';

const reference = '2026-11-21';

export function MiniCalendarExamples() {
  const [startDate, setStartDate] = useState<ISODateString>(reference);
  const [value, setValue] = useState<ISODateString>(reference);

  return (
    <>
      <Example title="Mini calendar">
        <div class="mini-calendar-demo">
          <MiniCalendar
            label="Delivery date"
            referenceDate={reference}
            startDate={startDate}
            onStartDateChange={setStartDate}
            value={value}
            onValueChange={setValue}
          />
          <div class="catalog-row">
            <Button
              size="compact"
              onClick={() => {
                setStartDate(reference);
                setValue(reference);
              }}
            >
              Today
            </Button>
            <output>{value}</output>
          </div>
        </div>
      </Example>
      <Example title="Mini calendar week">
        <MiniCalendar
          label="Shift date"
          referenceDate={reference}
          defaultStartDate="2026-11-16"
          defaultValue="2026-11-19"
          days={7}
          minDate="2026-11-16"
          maxDate={addDays('2026-11-16', 20)}
          isDisabled={(day) => day === '2026-11-18'}
        />
      </Example>
      <Example title="Localized mini calendar">
        <MiniCalendar
          label="تاریخ تحویل"
          referenceDate={reference}
          defaultStartDate={reference}
          defaultValue="2026-11-22"
          days={3}
          locale="fa-IR-u-ca-gregory"
          dir="rtl"
          translations={{ previous: '{days} روز قبل', next: '{days} روز بعد' }}
        />
      </Example>
    </>
  );
}
