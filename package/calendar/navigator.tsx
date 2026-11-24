/** @jsxImportSource preact */
import { h } from 'preact';
import { addDays, type ISODateString } from '@revolist/ui-dates';
import { DatePicker, type DatePickerProps } from '../pickers';

export interface CalendarNavigatorProps {
  value: ISODateString;
  today: ISODateString;
  onChange: (date: ISODateString) => void;
  /** Number of days to advance or retreat; defaults to seven. */
  stepDays?: number;
  className?: string;
  labels?: {
    previous?: string;
    next?: string;
    today?: string;
    calendar?: string;
    dialog?: string;
    title?: (value: ISODateString) => string;
  };
  /** Calendar presentation and localization options. */
  calendar?: Omit<
    DatePickerProps,
    'value' | 'onChange' | 'label' | 'openLabel' | 'dateInput' | 'renderTrigger'
  >;
}

/** Date stepping and an accessible shared calendar popup. */
export function CalendarNavigator({
  value,
  today,
  onChange,
  stepDays = 7,
  className,
  labels,
  calendar,
}: CalendarNavigatorProps) {
  const step = Number.isSafeInteger(stepDays) && stepDays > 0 ? stepDays : 7;
  const bounded = (date: ISODateString) => {
    if (calendar?.minDate && date < calendar.minDate) return calendar.minDate;
    if (calendar?.maxDate && date > calendar.maxDate) return calendar.maxDate;
    return date;
  };
  const previous = bounded(addDays(value, -step));
  const next = bounded(addDays(value, step));
  const todayAvailable = bounded(today) === today;

  return (
    <div class={['rv-calendar-navigator', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-label={labels?.previous ?? 'Previous period'}
        disabled={calendar?.disabled || previous >= value}
        onClick={() => onChange(previous)}
      >
        ‹
      </button>
      <button
        type="button"
        disabled={calendar?.disabled || value === today || !todayAvailable}
        onClick={() => onChange(today)}
      >
        {labels?.today ?? 'Today'}
      </button>
      <button
        type="button"
        aria-label={labels?.next ?? 'Next period'}
        disabled={calendar?.disabled || next <= value}
        onClick={() => onChange(next)}
      >
        ›
      </button>
      <DatePicker
        {...calendar}
        popup={{
          ...calendar?.popup,
          className: [
            'rv-calendar-navigator__popup',
            calendar?.popup?.className,
          ]
            .filter(Boolean)
            .join(' '),
        }}
        value={value}
        onChange={(date) => {
          if (date) onChange(date);
        }}
        dateInput={false}
        label={labels?.dialog ?? 'Choose date'}
        openLabel={labels?.calendar ?? 'Choose date'}
        renderTrigger={(trigger) => (
          <button
            {...trigger}
            class="rv-calendar-navigator__trigger"
            title={labels?.title?.(value)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M7 3v4M17 3v4M3 10h18M12 13v5M9.5 15.5h5" />
            </svg>
          </button>
        )}
      />
    </div>
  );
}
