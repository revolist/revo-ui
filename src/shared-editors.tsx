import { Dropdown } from '@revolist/ui/dropdown/index';
import { LookupField } from '@revolist/ui/dropdown/lookup-field';
import { AssigneeField, type AssigneeAssignment } from '@revolist/ui/assignee';
import { Button } from '@revolist/ui/controls';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  TemporalPicker,
  renderTemporalValue,
  DateTimeField,
  type TemporalPickerOptions,
} from '@revolist/ui/date-time';
import { DurationField, type ParsedDuration } from '@revolist/ui/duration';
import { Input } from '@revolist/ui/native-control';
import type { TemporalControlValue } from '@revolist/dates';
import { Example } from './catalog';
export function SharedEditorExamples() {
  const [selection, setSelection] = useState<'single' | 'range' | 'multiple'>(
    'range',
  );
  const [kind, setKind] = useState<'date' | 'datetime' | 'time'>('datetime');
  const [value, setValue] = useState<TemporalControlValue>({
    from: '2026-10-12T09:00',
    to: '2026-10-17T17:00',
  });
  const [months, setMonths] = useState(1);
  const [weeks, setWeeks] = useState(true);
  const [caption, setCaption] = useState<'label' | 'dropdown'>('dropdown');
  const [date, setDate] = useState('2026-10-12T09:00');
  const options: TemporalPickerOptions = {
    kind,
    selection,
    precision: 'second',
    timeFormat: '24h',
    calendar: {
      numberOfMonths: months,
      showWeekNumber: weeks,
      captionLayout: caption,
      defaultMonth: '2026-10-01',
      minDate: '2026-01-01',
      maxDate: '2027-12-31',
      showTodayButton: true,
      isDateDisabled: (date) => date === '2026-10-18',
      ...(selection === 'range'
        ? {
            presets: [
              {
                label: 'Launch week',
                selection: {
                  from: '2026-10-12' as const,
                  to: '2026-10-17' as const,
                },
              },
            ],
          }
        : {}),
    },
  };
  return (
    <>
      <Example title="Shared date/time editor options" wide>
        <div class="catalog-temporal-demo">
          <div class="catalog-temporal-layout">
            <fieldset class="catalog-temporal-settings">
              <legend>Configuration</legend>
              <label>
                <span>Value</span>
                <Dropdown
                  className="rv-select"
                  source={[
                    { value: 'date', label: 'Date' },
                    { value: 'datetime', label: 'Date and time' },
                    { value: 'time', label: 'Time' },
                  ]}
                  value={kind}
                  onChange={(value) => {
                    const next = String(value) as typeof kind;
                    setKind(next);
                    setValue(null);
                    if (next !== 'date' && selection === 'multiple')
                      setSelection('single');
                  }}
                  config={{ ariaLabel: 'Value' }}
                />
              </label>
              <label>
                <span>Selection</span>
                <Dropdown
                  className="rv-select"
                  source={[
                    { value: 'single', label: 'Single' },
                    { value: 'range', label: 'Range' },
                    ...(kind === 'date'
                      ? [{ value: 'multiple', label: 'Multiple dates' }]
                      : []),
                  ]}
                  value={selection}
                  onChange={(next) => {
                    setSelection(String(next) as typeof selection);
                    setValue(null);
                  }}
                  config={{ ariaLabel: 'Selection' }}
                />
              </label>
              <label>
                <span>Months</span>
                <Dropdown
                  className="rv-select"
                  source={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                  ]}
                  value={String(months)}
                  onChange={(next) => setMonths(Number(String(next)))}
                  config={{ ariaLabel: 'Months' }}
                />
              </label>
              <label>
                <span>Caption</span>
                <Dropdown
                  className="rv-select"
                  source={[
                    { value: 'label', label: 'Label' },
                    { value: 'dropdown', label: 'Month/year dropdowns' },
                  ]}
                  value={caption}
                  onChange={(next) =>
                    setCaption(String(next) as typeof caption)
                  }
                  config={{ ariaLabel: 'Caption' }}
                />
              </label>
              <label class="catalog-temporal-check">
                <Input
                  type="checkbox"
                  checked={weeks}
                  onChange={(event) => setWeeks(event.currentTarget.checked)}
                />{' '}
                Week numbers
              </label>
            </fieldset>
            <div class="catalog-temporal-preview">
              <span class="catalog-temporal-caption">Live preview</span>
              <TemporalPicker {...options} value={value} onChange={setValue} />
            </div>
          </div>
          <div class="catalog-temporal-result">
            <span>Selected value</span>
            <output aria-label="Selected date/time value">
              {value == null
                ? 'No date selected'
                : typeof value === 'string'
                  ? value
                  : Array.isArray(value)
                    ? value.join(' · ') || 'No date selected'
                    : [value.from, value.to].filter(Boolean).join(' → ')}
            </output>
          </div>
        </div>
      </Example>
      <Example title="Date value cells">
        {renderTemporalValue(h, {
          values: ['Oct 12–17'],
          fullValue: 'Oct 12, 2026 – Oct 17, 2026',
        })}
        {renderTemporalValue(h, {
          values: ['Oct 12', 'Oct 15', 'Oct 20'],
          fullValue: 'Oct 12, 2026; Oct 15, 2026; Oct 20, 2026',
          multiple: true,
        })}
      </Example>
      <Example title="Date field with calendar and time popup">
        <DateTimeField
          value={date}
          kind="datetime"
          onValueChange={setDate}
          picker={{
            timeFormat: '24h',
            calendar: { captionLayout: 'dropdown' },
          }}
        />
      </Example>
    </>
  );
}

export function RemoteLookupExample() {
  const [lookup, setLookup] = useState<
    string | number | (string | number)[] | null
  >(null);
  const [lookupOpen, setLookupOpen] = useState(false);
  return (
    <Example title="Remote lookup field">
      {lookupOpen ? (
        <LookupField
          initial={lookup}
          context={null}
          options={{
            dataSource: {
              search: async ({ query }) => ({
                items: [
                  { value: 'launch', label: 'Launch' },
                  { value: 'design', label: 'Design' },
                ].filter((option) =>
                  option.label.toLowerCase().includes(query.toLowerCase()),
                ),
              }),
              resolve: async ({ ids }) =>
                ids.map((value) => ({ value, label: String(value) })),
            },
          }}
          apply={(next) => {
            setLookup(next);
            setLookupOpen(false);
          }}
          cancel={() => setLookupOpen(false)}
        />
      ) : (
        <Button onClick={() => setLookupOpen(true)}>
          Select linked record
        </Button>
      )}
      <output>{JSON.stringify(lookup)}</output>
    </Example>
  );
}

export function DurationEffortExample() {
  const [duration, setDuration] = useState<ParsedDuration | null>({
    value: 2,
    unit: 'day',
    elapsed: false,
  });
  return (
    <Example title="Duration and effort">
      <DurationField
        slider={{ max: 100, step: 0.25 }}
        unitButtons
        defaultUnit="day"
        value={duration}
        onChange={setDuration}
        allowElapsed
      />
      <output>{JSON.stringify(duration)}</output>
    </Example>
  );
}

export function AssigneeFieldExample() {
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assignees, setAssignees] = useState<AssigneeAssignment[]>([
    { value: 'ana', units: 100 },
  ]);
  return (
    <Example title="Assignee allocation field">
      {assigneeOpen ? (
        <AssigneeField
          value={assignees}
          options={{
            source: [
              { value: 'ana', label: 'Ana', role: 'Engineer' },
              { value: 'bea', label: 'Bea', role: 'Designer' },
            ],
          }}
          save={(next) => {
            setAssignees(next);
            setAssigneeOpen(false);
          }}
          cancel={() => setAssigneeOpen(false)}
        />
      ) : (
        <Button onClick={() => setAssigneeOpen(true)}>Assign people</Button>
      )}
      <output>{JSON.stringify(assignees)}</output>
    </Example>
  );
}
