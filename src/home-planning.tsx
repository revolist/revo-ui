/** @jsxImportSource preact */
import { useRef, useState } from 'preact/hooks';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ProgressBar,
} from '@revolist/ui/preact';
import { Dropdown } from '@revolist/ui/dropdown/index';
import {
  TimeGrid,
  timeGridCellKey,
  useTimeGridInteraction,
} from '@revolist/ui/time-grid';
import { Legend } from '@revolist/ui/legend';
import { BarChart } from '@revolist/ui/distribution-chart';
import alex from './assets/people/contact-1.jpg?url';
import sam from './assets/people/contact-2.jpg?url';
const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
].map((long, index) => ({
  weekday: (index + 1) % 7,
  short: long.slice(0, 3),
  long,
}));
const members = [
  { id: 'alex', name: 'Alex Morgan', role: 'Product designer', photo: alex },
  { id: 'sam', name: 'Sam Rivera', role: 'Frontend engineer', photo: sam },
];
const priorities = [
  'Prepare the weekly review',
  'Protect time for deep work',
  'Share a progress update',
];
const defaults = (member: string) =>
  new Set(
    (member === 'alex'
      ? [
          [1, 8],
          [1, 10],
          [2, 10],
          [3, 8],
          [3, 10],
          [4, 14],
          [5, 10],
        ]
      : [
          [1, 10],
          [2, 8],
          [2, 10],
          [4, 8],
          [5, 14],
        ]
    ).flatMap(([day, hour]) => [
      timeGridCellKey(day, hour),
      timeGridCellKey(day, hour + 1),
    ]),
  );
export interface PlanningChartText {
  title: string;
  label: string;
  day: (long: string, short: string) => string;
  hours: (day: string, count: number) => string;
}

export const defaultPlanningChartText: PlanningChartText = {
  title: 'Focus hours by day',
  label: 'Focus hours by day',
  day: (_long, short) => short,
  hours: (day, count) => `${day}: ${count} ${count === 1 ? 'hour' : 'hours'}`,
};

export function WeeklyPlanning({
  controlsHref,
  showCaption = true,
  chartText = defaultPlanningChartText,
}: {
  controlsHref: string;
  showCaption?: boolean;
  chartText?: PlanningChartText;
}) {
  const [member, setMember] = useState('alex');
  const [schedules, setSchedules] = useState<Record<string, Set<string>>>({
    alex: defaults('alex'),
    sam: defaults('sam'),
  });
  const [completed, setCompleted] = useState<Record<string, string[]>>({
    alex: [priorities[0]],
    sam: [],
  });
  const [focused, setFocused] = useState('1:8');
  const matrixRef = useRef<HTMLDivElement>(null);
  const cells = schedules[member];
  const cellsRef = useRef(cells);
  cellsRef.current = cells;
  const interaction = useTimeGridInteraction({
    days,
    matrixRef,
    onFocus: setFocused,
    onPaint: (day, hour, selected) => {
      const next = new Set(cellsRef.current);
      for (const value of [hour, hour + 1]) {
        const key = timeGridCellKey(day, value);
        if (selected) next.add(key);
        else next.delete(key);
      }
      cellsRef.current = next;
      setSchedules((current) => ({ ...current, [member]: next }));
    },
    onCommit: () => {},
  });
  const person = members.find((item) => item.id === member)!;
  const dailyHours = days.map((day) => {
    const value = Array.from({ length: 24 }, (_, hour) =>
      cells.has(timeGridCellKey(day.weekday, hour)) ? 1 : 0,
    ).reduce<number>((sum, selected) => sum + selected, 0);
    return {
      key: String(day.weekday),
      value,
      tooltip: {
        title: chartText.day(day.long, day.short),
        details: [chartText.hours(day.long, value)],
      },
    };
  });
  return (
    <article class="home-widget home-weekly-planner">
      <div class="planning-layout">
        <div class="planning-grid-panel">
          <div class="planning-member-actions">
            <MemberDropdown
              value={member}
              label="Planning team member"
              onChange={(value) => {
                setMember(value);
                setFocused('1:8');
              }}
            />
            <Button
              onClick={() => {
                setSchedules((current) => ({
                  ...current,
                  [member]: defaults(member),
                }));
                setCompleted((current) => ({
                  ...current,
                  [member]: member === 'alex' ? [priorities[0]] : [],
                }));
              }}
            >
              Reset week
            </Button>
          </div>

          <div class="widget-between">
            <div class="planning-person">
              <Avatar
                value={person.photo}
                label={person.name}
                initials={person.name.slice(0, 1)}
                size={32}
              />
              <div>
                <strong>{person.name}</strong>
                <span>{person.role}</span>
              </div>
            </div>
            <Badge variant="neutral">Typical week</Badge>
          </div>
          <TimeGrid
            days={days}
            cells={cells}
            focused={focused}
            weekendDays={[0, 6]}
            workingHours={{ startHour: 8, endHour: 18 }}
            gridLabel="Weekly focus plan"
            hourLabel={(hour) => `${String(hour).padStart(2, '0')}:00`}
            cellLabel={(day, start, end, selected) =>
              `${day.long} ${start}–${end}, ${selected ? 'selected' : 'unselected'}`
            }
            matrixRef={matrixRef}
            onFocus={setFocused}
            {...interaction}
          />
          <Legend
            label="Planning legend"
            items={[
              { id: 'focus', label: 'Focus time', tone: 'selected' },
              { id: 'outside', label: 'Outside work hours', tone: 'outside' },
              { id: 'weekend', label: 'Weekend', tone: 'muted' },
            ]}
          />
        </div>
        <aside class="planning-summary" aria-label="Weekly priorities">
          <div class="planning-capacity">
            <div class="widget-between">
              <strong>Focus capacity</strong>
              <output aria-label="Planned focus hours">
                {cells.size}h / 40h
              </output>
            </div>
            <ProgressBar
              value={Math.min(100, (cells.size / 40) * 100)}
              ariaLabel="Planned weekly capacity"
            />
          </div>
          <div class="planning-chart">
            <strong>{chartText.title}</strong>
            <BarChart
              ariaLabel={chartText.label}
              data={dailyHours}
              barColor={(datum) =>
                datum.value ? 'var(--rv-ui-accent)' : undefined
              }
              height={72}
              showLabels
              showValues
              formatValue={(value) => String(value)}
            />
          </div>
          <div class="widget-between">
            <strong>This week's priorities</strong>
            <Badge variant="neutral">
              {completed[member].length}/{priorities.length}
            </Badge>
          </div>
          <div class="planning-priority-list">
            {priorities.map((label) => (
              <Checkbox
                key={`${member}-${label}`}
                label={label}
                checked={completed[member].includes(label)}
                onChange={(checked) =>
                  setCompleted((current) => ({
                    ...current,
                    [member]: checked
                      ? [...current[member], label]
                      : current[member].filter((item) => item !== label),
                  }))
                }
              />
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}

/** Gallery composition of the shared Dropdown and Avatar controls. */
export function MemberDropdown({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Dropdown
      className="rv-select"
      config={{ ariaLabel: label, topLayer: true }}
      source={members.map((item) => ({ value: item.id, label: item.name }))}
      value={value}
      onChange={(next) => onChange(String(next))}
      renderValue={(_h, option) => {
        const person = members.find((item) => item.id === option.value)!;
        return (
          <span class="planning-member-option">
            <Avatar
              value={person.photo}
              label=""
              initials={person.name.slice(0, 1)}
              size={16}
            />
            <span>{person.name}</span>
          </span>
        );
      }}
      renderOption={(_h, option) => {
        const person = members.find((item) => item.id === option.value)!;
        return (
          <span class="planning-member-option">
            <Avatar
              value={person.photo}
              label=""
              initials={person.name.slice(0, 1)}
              size={16}
            />
            <span>{person.name}</span>
          </span>
        );
      }}
    />
  );
}
