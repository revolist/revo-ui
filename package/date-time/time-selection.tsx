/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { Button } from '../controls';
import { SvgIcon, chevronDownIcon } from '../icons';
import { Listbox, ListboxOption } from '../selection-list';
import { TimeControl } from './time-control';
import {
  timeSelectionChoices,
  timeSelectionColumns,
  timeSelectionValue,
  clockUses12Hours,
  clockPeriodLabel,
  type TimeColumn,
} from '@revolist/ui-dates';
import type { TemporalPickerText } from './types';

function TimeColumnList({
  label,
  accessibleLabel,
  values,
  selected,
  choices,
  display,
  onSelect,
}: {
  label?: string;
  accessibleLabel: string;
  values: readonly number[];
  selected?: number;
  choices: Map<number, number>;
  display: (value: number) => string;
  onSelect: (seconds: number) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const selectedAvailable = selected !== undefined && choices.has(selected);
  const entry = selectedAvailable
    ? selected
    : values.find((value) => choices.has(value));
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const reveal = () => {
      const item = element.querySelector<HTMLElement>(
        '[aria-selected="true"], [tabindex="0"]',
      );
      if (item && element.clientHeight)
        element.scrollTop =
          item.offsetTop - (element.clientHeight - item.clientHeight) / 2;
    };
    reveal();
    // Popup content first renders in a detached fragment; measure after attachment.
    const observer = new ResizeObserver(reveal);
    observer.observe(element);
    return () => observer.disconnect();
  }, [selected, entry]);
  const choose = (key: string) => {
    const next = choices.get(Number(key));
    if (next !== undefined) onSelect(next);
  };
  return (
    <div class="rv-time-selection__column">
      {label && <span class="rv-time-selection__label">{label}</span>}
      <Listbox
        label={accessibleLabel}
        listRef={list}
        variant="plain"
        className="rv-time-selection__list"
        onSelect={choose}
      >
        {values.map((value) => (
          <ListboxOption
            key={value}
            value={String(value)}
            selected={selected === value && selectedAvailable}
            disabled={!choices.has(value)}
            tabIndex={value === entry ? 0 : -1}
            onClick={() => choose(String(value))}
          >
            {display(value)}
          </ListboxOption>
        ))}
      </Listbox>
    </div>
  );
}
export interface TimeSelectionProps {
  value: string;
  label: string;
  text: TemporalPickerText;
  onChange: (value: string) => void;
  format?: 'locale' | '12h' | '24h';
  precision?: 'minute' | 'second';
  locale?: string;
  min?: string;
  max?: string;
  step?: number;
  /** Calendar compositions keep clock columns behind an explicit toggle. */
  collapsible?: boolean;
}
/** Shared typed entry and bounded clock columns for time-only and date-time pickers. */
export function TimeSelection({
  value,
  label,
  text,
  onChange,
  format = 'locale',
  precision = 'minute',
  locale,
  min,
  max,
  step,
  collapsible = false,
}: TimeSelectionProps) {
  const [expanded, setExpanded] = useState(false);
  const columnsId = useId();
  const twelve = clockUses12Hours(format, locale);
  const choices = useMemo(
    () => timeSelectionChoices({ min, max, step, precision }),
    [min, max, step, precision],
  );
  const model = useMemo(
    () => timeSelectionColumns(choices, value, twelve),
    [choices, value, twelve],
  );
  const numbers = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }),
    [locale],
  );
  const select = (seconds: number) =>
    onChange(timeSelectionValue(seconds, precision));
  const column = (
    kind: TimeColumn,
    name: string,
    values: number[],
    display = (value: number) => numbers.format(value),
  ) => (
    <TimeColumnList
      label={kind === 'period' ? undefined : name}
      accessibleLabel={`${label}: ${name}`}
      values={values}
      selected={model.hasValue ? model[kind] : undefined}
      choices={model.columns[kind]}
      display={display}
      onSelect={select}
    />
  );
  const range = (count: number, start = 0) =>
    Array.from({ length: count }, (_, index) => start + index);
  return (
    <section class="rv-time-selection">
      <div class="rv-time-selection__entry-row">
        <label class="rv-time-selection__entry">
          <span>{label}</span>
          <TimeControl
            value={value}
            label={label}
            format={format}
            precision={precision}
            locale={locale}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
          />
        </label>
        {collapsible && (
          <Button
            variant="ghost"
            className="rv-time-selection__toggle"
            aria-label={text.chooseTime ?? text.time}
            aria-expanded={expanded}
            aria-controls={expanded ? columnsId : undefined}
            onClick={() => setExpanded(!expanded)}
          >
            <SvgIcon svg={chevronDownIcon} />
          </Button>
        )}
      </div>
      {(!collapsible || expanded) && (
        <div id={columnsId} class="rv-time-selection__clock">
          <div
            class={`rv-time-selection__columns${precision === 'second' ? ' rv-time-selection__columns--seconds' : ''}`}
          >
            {column(
              'hour',
              text.hours!,
              range(twelve ? 12 : 24, twelve ? model.period * 12 : 0),
              (value) => numbers.format(twelve ? value % 12 || 12 : value),
            )}
            {column('minute', text.minutes!, range(60))}
            {precision === 'second' &&
              column('second', text.seconds!, range(60))}
          </div>
          {twelve && (
            <div class="rv-time-selection__period">
              {column('period', text.dayPeriod!, [0, 1], (value) =>
                clockPeriodLabel(value, locale),
              )}
            </div>
          )}
          {!choices.length && (
            <p class="rv-time-selection__empty" role="status">
              {text.noTimes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
