/** @jsxImportSource preact */
import { h, type ComponentChildren } from 'preact';
import { parseIsoDate, type ISODateString } from '@revolist/ui-dates';

export interface CalendarDayProps {
  readonly date: ISODateString;
  readonly label: string;
  readonly className?: string;
  readonly outside: boolean;
  readonly hidden: boolean;
  readonly disabled: boolean;
  readonly focused: boolean;
  readonly selected: boolean;
  readonly previewed: boolean;
  readonly previewInvalid?: boolean;
  readonly previewDescriptionId?: string;
  readonly rangeStart: boolean;
  readonly rangeEnd: boolean;
  readonly previewStart: boolean;
  readonly previewEnd: boolean;
  readonly today: boolean;
  readonly content?: ComponentChildren;
  readonly setRef: (
    date: ISODateString,
    element: HTMLButtonElement | null,
  ) => void;
  readonly onFocus: (date: ISODateString) => void;
  readonly onPreview: (date?: ISODateString) => void;
  readonly onKeyDown: (
    event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>,
    date: ISODateString,
  ) => void;
  readonly onSelect: (date: ISODateString) => void;
}

export function CalendarDay(props: CalendarDayProps) {
  const classes = [
    'revo-calendar__day',
    props.className,
    props.outside && 'outside',
    props.disabled && 'disabled',
    props.selected && 'in-range',
    props.previewed && 'in-preview',
    props.previewInvalid && 'in-invalid-preview',
    props.rangeStart && 'range-start',
    props.rangeEnd && 'range-end',
    props.previewStart && 'preview-start',
    props.previewEnd && 'preview-end',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={(element) => props.setRef(props.date, element)}
      type="button"
      role="gridcell"
      data-calendar-date={props.date}
      class={classes}
      disabled={props.disabled || props.hidden}
      tabIndex={!props.hidden && props.focused ? 0 : -1}
      aria-hidden={props.hidden || undefined}
      aria-selected={props.selected || undefined}
      aria-invalid={props.previewInvalid || undefined}
      aria-describedby={
        props.previewInvalid ? props.previewDescriptionId : undefined
      }
      aria-current={props.today ? 'date' : undefined}
      aria-label={props.label}
      onFocus={() => {
        props.onFocus(props.date);
        props.onPreview(props.date);
      }}
      onMouseEnter={() => props.onPreview(props.date)}
      onMouseLeave={() => props.onPreview()}
      onKeyDown={(event) => props.onKeyDown(event, props.date)}
      onClick={() => props.onSelect(props.date)}
    >
      {props.content ?? parseIsoDate(props.date).getUTCDate()}
    </button>
  );
}
