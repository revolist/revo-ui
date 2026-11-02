import { Legend } from '@revolist/ui/legend';
import { Dropdown } from '@revolist/ui/dropdown/index';
import { ChoiceChips } from '@revolist/ui/choice-chips/index';
import { ButtonControl } from '@revolist/ui/native-control';
import { FilterBadge } from '@revolist/ui/filter-badge';
import { Fragment, h } from 'preact';
import { Example as Specimen } from './catalog';
import { useRef, useState } from 'preact/hooks';
import { AreaChart, BarChart, LineChart } from '@revolist/ui/distribution-chart';
import { BrushRange } from '@revolist/ui/brush-range';
import {
  OptionButton,
  HighlightedTextInput,
  InlineFieldGroup,
} from '@revolist/ui/filter-controls';
import {
  TimeGrid,
  timeGridCellKey,
  useTimeGridInteraction,
} from '@revolist/ui/time-grid';
import { SegmentedControl, NumberInput } from '@revolist/ui/controls';

const chartData = [12, 24, 15, 10, 40, 8, 46, 23, 30, 18].map(
  (value, index) => ({
    key: String(index),
    value,
    selected: true,
    tooltip: { title: `Bucket ${index + 1}`, details: [`${value} items`] },
  }),
);
const monthlyData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({ key: month, value: [186, 305, 237, 73, 209, 214][index], selected: true, tooltip: { title: month, details: [`${[186, 305, 237, 73, 209, 214][index]} orders`] } }));
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
  (short, index) => ({ weekday: (index + 1) % 7, short, long: short }),
);
export function ChartExamples() {
  const [range, setRange] = useState({ fromValue: 10, toValue: 80 });
  const [chart, setChart] = useState<'bar' | 'line'>('bar');
  return (
    <>
      <Specimen title="Bar chart">
        <BarChart
          ariaLabel="Standalone bar chart"
          height={120}
          data={chartData}
        />
      </Specimen>
      <Specimen title="Line chart">
        <LineChart
          ariaLabel="Standalone line chart"
          height={120}
          data={chartData}
        />
      </Specimen>
      <Specimen title="Bar chart with labels">
        <BarChart ariaLabel="Monthly orders" data={monthlyData} height={150} showGrid showLabels showValues legend="Orders" tooltipIndicator="dot" formatValue={value => `${value}`} />
      </Specimen>
      <Specimen title="Step line">
        <LineChart ariaLabel="Weekly subscriptions" data={monthlyData} height={150} showGrid showLabels interpolation="step" legend="Subscriptions" tooltipIndicator="line" />
      </Specimen>
      <Specimen title="Gradient area">
        <AreaChart ariaLabel="Monthly revenue" data={monthlyData} height={150} showGrid showLabels showPoints={false} areaFill="gradient" legend="Revenue" tooltipIndicator="dashed" renderTooltip={datum => <><strong>{datum.tooltip.title}</strong><span>Revenue · ${datum.value.toLocaleString()}</span></>} />
      </Specimen>
      <Specimen title="Area chart without tooltips">
        <AreaChart ariaLabel="Monthly activity" data={monthlyData} height={120} showLabels tooltip={false} legend="Activity" />
      </Specimen>
      <Specimen title="Distribution and range brush" wide>
        <SegmentedControl
          ariaLabel="Distribution presentation"
          value={chart}
          options={[
            { value: 'bar', label: 'Bar' },
            { value: 'line', label: 'Line' },
          ]}
          onChange={setChart}
        />
        <BrushRange
          chart={{
            type: chart,
            ariaLabel: 'Standalone distribution',
            data: [12, 24, 15, 10, 40, 8, 46, 23, 30, 18].map(
              (value, index) => ({
                key: String(index),
                value,
                selected:
                  index * 10 >= range.fromValue && index * 10 <= range.toValue,
                tooltip: {
                  title: `Bucket ${index + 1}`,
                  details: [`${value} items`],
                },
              }),
            ),
          }}
          slider={{
            min: 0,
            max: 100,
            ...range,
            fromAriaLabel: 'Brush minimum',
            toAriaLabel: 'Brush maximum',
            onRangeChange: setRange,
          }}
          startLabel={range.fromValue}
          selectionLabel="Selected interval"
          endLabel={range.toValue}
        />
      </Specimen>
    </>
  );
}
export function OptionRowsExample() {
  const [preset, setPreset] = useState('top');
  return (
    <Specimen title="Option rows">
      <OptionButton
        label="Standard spacing"
        detail="32px"
        selected={preset === 'top'}
        onClick={() => setPreset(preset === 'top' ? '' : 'top')}
      />
      <OptionButton
        label="Compact spacing"
        detail="24px"
        selected={preset === 'average'}
        onClick={() => setPreset(preset === 'average' ? '' : 'average')}
      />
      <OptionButton label="Unavailable option" detail="Disabled" disabled />
    </Specimen>
  );
}
export function TimeGridExample() {
  const [cells, setCells] = useState(new Set<string>());
  const cellsRef = useRef(cells);
  cellsRef.current = cells;
  const matrixRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState('1:0');
  const [commits, setCommits] = useState(0);
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
      setCells(next);
    },
    onCommit: () => setCommits((count) => count + 1),
  });
  return (
    <Specimen title="Weekly time grid" wide>
      <TimeGrid
        days={days}
        cells={cells}
        focused={focused}
        weekendDays={[0, 6]}
        workingHours={{ startHour: 8, endHour: 18 }}
        gridLabel="Availability slots"
        hourLabel={(hour) => `${String(hour % 24).padStart(2, '0')}:00`}
        cellLabel={(day, start, end, selected) =>
          `${day.long} ${start}–${end}, ${selected ? 'selected' : 'unselected'}`
        }
        matrixRef={matrixRef}
        onFocus={setFocused}
        {...interaction}
      />
      <Legend
        label="Availability legend"
        items={[
          { id: 'selected', label: 'Selected', tone: 'selected' },
          { id: 'outside', label: 'Outside working hours', tone: 'outside' },
          { id: 'weekend', label: 'Weekend', tone: 'muted' },
        ]}
      />
      <output aria-label="Time selection commits">
        {commits} {commits === 1 ? 'change' : 'changes'} committed
      </output>
    </Specimen>
  );
}
export function HighlightedInputExample() {
  const [code, setCode] = useState('value > 100');
  return (
    <Specimen title="Highlighted text input">
      <HighlightedTextInput
        value={code}
        aria-label="Highlighted example"
        highlight={code}
        onInput={(event) => setCode(event.currentTarget.value)}
      />
    </Specimen>
  );
}
export function InlineFieldsExample() {
  const [amount, setAmount] = useState(7);
  const [mode, setMode] = useState('Fixed');
  const [unit, setUnit] = useState('Pixels');
  return (
    <Specimen title="Inline field group">
      <InlineFieldGroup label="Dimensions">
        <Dropdown className="rv-select" source={[{ value: 'Fixed', label: 'Fixed' }, { value: 'Auto', label: 'Auto' }]} config={{ ariaLabel: "Sizing mode" }} value={mode} onChange={value => setMode(String(value))} />
        <NumberInput
          aria-label="Width"
          min={1}
          value={amount}
          onValueChange={(value) => setAmount(value ?? 1)}
        />
        <Dropdown className="rv-select" source={[{ value: 'Pixels', label: 'Pixels' }, { value: 'Percent', label: 'Percent' }]} config={{ ariaLabel: "Size unit" }} value={unit} onChange={value => setUnit(String(value))} />
      </InlineFieldGroup>
    </Specimen>
  );
}

export function ChoiceChipFilterVariants() {
  const [selected, setSelected] = useState(['Critical', 'High']);
  const [visible, setVisible] = useState(true);
  return <>
    <ChoiceChips ariaLabel="Colored choices" value={selected}
      options={[
        { value: 'Critical', label: 'Critical', color: '#ef4444' },
        { value: 'High', label: 'High', color: '#d97706' },
        { value: 'Normal', label: 'Normal', color: '#16a34a' },
        { value: 'Low', label: 'Low', color: '#2563eb' },
        { value: 'Backlog', label: 'Backlog', color: '#9333ea' },
      ]}
      onChange={value => setSelected(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value])}
    />
    <div class="rv-filter-badges" role="list" aria-label="Active sample filters">
      {visible && <FilterBadge role="listitem" color="#2563eb" label="Priority: 2 selected" details="Critical, High · blanks excluded" detailsLabel="Details for Priority filter" descriptionId="sample-priority-details" removeLabel="Remove Priority filter" onRemove={() => setVisible(false)} />}
      <FilterBadge role="listitem" label="Region: Europe" details="Read-only filter" detailsLabel="Details for Region filter" descriptionId="sample-region-details" />
    </div>
    {!visible && <ButtonControl onClick={() => setVisible(true)}>Restore Priority filter</ButtonControl>}
  </>;
}
