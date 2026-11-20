/** @jsxImportSource preact */
import type { ClassPreset } from '../presets/types';
import chevronLeftIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg?raw';
import chevronRightIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';
import { h, type ComponentChildren } from 'preact';
import type { ISODateString } from '@revolist/ui-dates';

export function CalendarHeader({
  preset,
  className = '',
  label,
  previousLabel,
  nextLabel,
  labelAction,
  caption,
  showLabel = true,
  showPrevious = true,
  showNext = true,
  previousDisabled = false,
  nextDisabled = false,
  onPrevious,
  onNext,
}: {
  preset?: ClassPreset;
  className?: string;
  label: string;
  previousLabel: string;
  nextLabel: string;
  caption?: ComponentChildren;
  labelAction?: {
    ariaLabel: string;
    onClick: () => void;
    ref?: (element: HTMLButtonElement | null) => void;
  };
  showLabel?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <header
      class={`revo-calendar__header ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {showPrevious ? (
        <button
          type="button"
          aria-label={previousLabel}
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: chevronLeftIcon }}
          />
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
      {showLabel && caption ? (
        caption
      ) : showLabel && labelAction ? (
        <button
          ref={labelAction.ref}
          type="button"
          class="revo-calendar__month-label revo-calendar__month-label-button"
          aria-label={labelAction.ariaLabel}
          onClick={labelAction.onClick}
        >
          <span aria-live="polite">{label}</span>
        </button>
      ) : showLabel ? (
        <strong class="revo-calendar__month-label" aria-live="polite">
          {label}
        </strong>
      ) : (
        <span aria-hidden="true" />
      )}
      {showNext ? (
        <button
          type="button"
          aria-label={nextLabel}
          disabled={nextDisabled}
          onClick={onNext}
        >
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: chevronRightIcon }}
          />
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  );
}

export function CalendarWeekdays({
  preset,
  className = '',
  dates,
  locale,
  format,
  weekNumberLabel,
}: {
  preset?: ClassPreset;
  className?: string;
  dates: readonly ISODateString[];
  weekNumberLabel?: string;
  locale: string;
  format: (date: ISODateString, locale: string) => string;
}) {
  return (
    <div
      class={`revo-calendar__weekdays ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="row"
    >
      {weekNumberLabel && (
        <span role="columnheader" aria-label={weekNumberLabel}>
          #
        </span>
      )}
      {dates.map((date) => (
        <span key={date} role="columnheader">
          {format(date, locale)}
        </span>
      ))}
    </div>
  );
}
