import { Legend as __themeOriginal_Legend } from '@revolist/ui/legend';
import { Dropdown as __themeOriginal_Dropdown } from '@revolist/ui/dropdown/index';
import { ChoiceChips as __themeOriginal_ChoiceChips } from '@revolist/ui/choice-chips/index';
import { ButtonControl } from '@revolist/ui/native-control';
import { FilterBadge as __themeOriginal_FilterBadge } from '@revolist/ui/filter-badge';
import { Fragment, h } from 'preact';
import { Example as Specimen } from './catalog';
import { useRef, useState } from 'preact/hooks';
import {
  AreaChart as __themeOriginal_AreaChart,
  BarChart as __themeOriginal_BarChart,
  LineChart as __themeOriginal_LineChart,
  DistributionChart as __themeOriginal_DistributionChart,
} from '@revolist/ui/distribution-chart';
import { BrushRange as __themeOriginal_BrushRange } from '@revolist/ui/brush-range';
import {
  OptionButton as __themeOriginal_OptionButton,
  HighlightedTextInput as __themeOriginal_HighlightedTextInput,
  InlineFieldGroup as __themeOriginal_InlineFieldGroup,
} from '@revolist/ui/filter-controls';
import {
  TimeGrid as __themeOriginal_TimeGrid,
  timeGridCellKey,
  useTimeGridInteraction,
} from '@revolist/ui/time-grid';
import {
  SegmentedControl as __themeOriginal_SegmentedControl,
  NumberInput as __themeOriginal_NumberInput,
} from '@revolist/ui/controls';
import { withThemePreview } from './theme-preview';

const Legend = withThemePreview(__themeOriginal_Legend, 'Legend');
const Dropdown = withThemePreview(__themeOriginal_Dropdown, 'Dropdown');
const ChoiceChips = withThemePreview(
  __themeOriginal_ChoiceChips,
  'ChoiceChips',
);
const FilterBadge = withThemePreview(
  __themeOriginal_FilterBadge,
  'FilterBadge',
);
const AreaChart = withThemePreview(__themeOriginal_AreaChart, 'AreaChart');
const BarChart = withThemePreview(__themeOriginal_BarChart, 'BarChart');
const LineChart = withThemePreview(__themeOriginal_LineChart, 'LineChart');
const DistributionChart = withThemePreview(
  __themeOriginal_DistributionChart,
  'DistributionChart',
);
const BrushRange = withThemePreview(__themeOriginal_BrushRange, 'BrushRange');
const OptionButton = withThemePreview(
  __themeOriginal_OptionButton,
  'OptionButton',
);
const HighlightedTextInput = withThemePreview(
  __themeOriginal_HighlightedTextInput,
  'HighlightedTextInput',
);
const InlineFieldGroup = withThemePreview(
  __themeOriginal_InlineFieldGroup,
  'InlineFieldGroup',
);
const TimeGrid = withThemePreview(__themeOriginal_TimeGrid, 'TimeGrid');
const SegmentedControl = withThemePreview(
  __themeOriginal_SegmentedControl,
  'SegmentedControl',
);
const NumberInput = withThemePreview(
  __themeOriginal_NumberInput,
  'NumberInput',
);

const chartData = [12, 24, 15, 10, 40, 8, 46, 23, 30, 18].map(
  (value, index) => ({
    key: String(index),
    value,
    selected: true,
    tooltip: { title: `Bucket ${index + 1}`, details: [`${value} items`] },
  }),
);
const monthlyData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(
  (month, index) => ({
    key: month,
    value: [186, 305, 237, 73, 209, 214][index],
    selected: true,
    tooltip: {
      title: month,
      details: [`${[186, 305, 237, 73, 209, 214][index]} orders`],
    },
  }),
);
const trafficData = monthlyData.map((datum) => ({
  ...datum,
  tooltip: { title: datum.tooltip.title, details: [`${datum.value} visits`] },
}));
const revenueData = monthlyData.map((datum) => ({
  ...datum,
  tooltip: { title: datum.tooltip.title, details: [`$${datum.value} revenue`] },
}));
const subscriptionData = monthlyData.map((datum) => ({
  ...datum,
  tooltip: {
    title: datum.tooltip.title,
    details: [`${datum.value} subscriptions`],
  },
}));
const channelSeries = [
  {
    key: 'desktop',
    label: 'Desktop',
    values: [186, 205, 187, 173, 209, 214],
    color: '#2563eb',
  },
  {
    key: 'mobile',
    label: 'Mobile',
    values: [80, 100, 125, 110, 95, 140],
    color: '#93c5fd',
  },
];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
  (short, index) => ({ weekday: (index + 1) % 7, short, long: short }),
);
export function ChartExamples() {
  const [range, setRange] = useState({ fromValue: 10, toValue: 80 });
  const [chart, setChart] = useState<'bar' | 'line'>('bar');
  return (
    <>
      <Specimen title="Stacked visitors">
        <div class="chart-example-card">
          <strong>Visitors by device</strong>
          <p>Desktop and mobile by month</p>
          <BarChart
            ariaLabel="Stacked visitors by device"
            data={monthlyData}
            series={channelSeries}
            seriesMode="stacked"
            height={150}
            showGrid
            showLabels
          />
        </div>
      </Specimen>
      <Specimen title="Stacked traffic area">
        <div class="chart-example-card">
          <strong>Traffic by device</strong>
          <p>Monthly desktop and mobile traffic</p>
          <AreaChart
            ariaLabel="Stacked traffic by device"
            data={trafficData}
            series={channelSeries}
            seriesMode="stacked"
            height={150}
            areaFill="gradient"
            showGrid
            showLabels
            showPoints={false}
          />
        </div>
      </Specimen>
      <Specimen title="Device trend comparison">
        <div class="chart-example-card">
          <strong>Device trend</strong>
          <p>Compare monthly desktop and mobile traffic</p>
          <LineChart
            ariaLabel="Device trend comparison"
            data={trafficData}
            series={channelSeries}
            height={150}
            showGrid
            showLabels
            interpolation="smooth"
          />
        </div>
      </Specimen>
      <Specimen title="Orders and target">
        <div class="chart-example-card">
          <strong>Orders and target</strong>
          <p>Monthly actuals and target</p>
          <BarChart
            ariaLabel="Orders and target"
            data={monthlyData}
            height={150}
            showGrid
            showLabels
            series={[
              {
                key: 'orders',
                label: 'Orders',
                type: 'bar',
                values: [186, 205, 187, 173, 209, 214],
                color: '#93c5fd',
              },
              {
                key: 'target',
                label: 'Target',
                type: 'line',
                values: [160, 180, 190, 200, 200, 220],
                color: '#2563eb',
              },
            ]}
          />
        </div>
      </Specimen>
      <Specimen title="Visitors by source">
        <div class="chart-example-card">
          <strong>Visitors by source</strong>
          <p>Share of visitors this month</p>
          <DistributionChart
            type="donut"
            ariaLabel="Visitors by source"
            height={190}
            data={[
              {
                key: 'direct',
                value: 520,
                tooltip: { title: 'Direct', details: ['520 visitors'] },
              },
              {
                key: 'search',
                value: 360,
                tooltip: { title: 'Search', details: ['360 visitors'] },
              },
              {
                key: 'social',
                value: 120,
                tooltip: { title: 'Social', details: ['120 visitors'] },
              },
            ]}
            sliceColors={['var(--rv-ui-accent)', '#60a5fa', '#93c5fd']}
            centerLabel="1,000"
            showLabels
          />
        </div>
      </Specimen>
      <Specimen title="Monthly orders overview">
        <div class="chart-example-card">
          <strong>Monthly orders</strong>
          <p>1,224 orders · January–June</p>
          <BarChart
            ariaLabel="Orders overview"
            data={monthlyData}
            height={150}
            showGrid
            showLabels
            barColor={(_datum, index) =>
              index === 1 ? 'var(--rv-ui-accent)' : '#93c5fd'
            }
          />
        </div>
      </Specimen>
      <Specimen title="Revenue trend">
        <div class="chart-example-card">
          <strong>Revenue trend</strong>
          <p>Monthly performance</p>
          <AreaChart
            ariaLabel="Revenue trend"
            data={revenueData}
            height={150}
            areaFill="gradient"
            interpolation="smooth"
            showGrid
            showLabels
            showPoints={false}
            tooltipIndicator="dot"
          />
        </div>
      </Specimen>
      <Specimen title="Subscription trend">
        <div class="chart-example-card">
          <strong>Subscriptions</strong>
          <p>New subscriptions by month</p>
          <LineChart
            ariaLabel="Subscription trend"
            data={subscriptionData}
            height={150}
            interpolation="smooth"
            showGrid
            showLabels
            tooltipIndicator="line"
          />
        </div>
      </Specimen>
      <Specimen title="Traffic and conversions" wide>
        <div class="chart-example-comparison">
          <div class="chart-example-card">
            <strong>Traffic</strong>
            <p>Visits over six months</p>
            <AreaChart
              ariaLabel="Traffic over six months"
              data={trafficData}
              height={130}
              areaFill="gradient"
              showLabels
              showPoints={false}
            />
          </div>
          <div class="chart-example-card">
            <strong>Conversions</strong>
            <p>Orders over six months</p>
            <BarChart
              ariaLabel="Conversions over six months"
              data={monthlyData}
              height={130}
              showLabels
            />
          </div>
        </div>
      </Specimen>
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
        <BarChart
          ariaLabel="Monthly orders"
          data={monthlyData}
          height={150}
          showGrid
          showLabels
          showValues
          legend="Orders"
          tooltipIndicator="dot"
          formatValue={(value) => `${value}`}
        />
      </Specimen>
      <Specimen title="Step line">
        <LineChart
          ariaLabel="Weekly subscriptions"
          data={monthlyData}
          height={150}
          showGrid
          showLabels
          interpolation="step"
          legend="Subscriptions"
          tooltipIndicator="line"
        />
      </Specimen>
      <Specimen title="Gradient area">
        <AreaChart
          ariaLabel="Monthly revenue"
          data={monthlyData}
          height={150}
          showGrid
          showLabels
          showPoints={false}
          areaFill="gradient"
          legend="Revenue"
          tooltipIndicator="dashed"
          renderTooltip={(datum) => (
            <>
              <strong>{datum.tooltip.title}</strong>
              <span>Revenue · ${datum.value.toLocaleString()}</span>
            </>
          )}
        />
      </Specimen>
      <Specimen title="Area chart without tooltips">
        <AreaChart
          ariaLabel="Monthly activity"
          data={monthlyData}
          height={120}
          showLabels
          tooltip={false}
          legend="Activity"
        />
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
      <Specimen title="Dotted traffic bars">
        <div class="chart-example-card">
          <strong>Website traffic</strong>
          <p>Monthly visitor behavior</p>
          <BarChart
            ariaLabel="Website traffic with dotted bars"
            data={trafficData}
            height={150}
            showLabels
            barColor="#64748b"
            barPattern="dots"
          />
        </div>
      </Specimen>
      <Specimen title="Striped acquisition comparison">
        <div class="chart-example-card">
          <strong>User acquisition</strong>
          <p>Compare desktop and mobile traffic</p>
          <BarChart
            ariaLabel="Striped acquisition comparison"
            data={trafficData}
            height={150}
            showLabels
            series={[
              { ...channelSeries[0], label: 'Desktop', pattern: 'stripes' },
              { ...channelSeries[1], label: 'Mobile' },
            ]}
          />
        </div>
      </Specimen>
      <Specimen title="Patterned priority breakdown">
        <div class="chart-example-card">
          <strong>Bug priority</strong>
          <p>Open issues by severity</p>
          <DistributionChart
            type="donut"
            ariaLabel="Open issues by severity"
            height={190}
            showLabels
            data={[
              {
                key: 'critical',
                value: 15,
                tooltip: { title: 'Critical', details: ['15 issues'] },
              },
              {
                key: 'high',
                value: 30,
                tooltip: { title: 'High', details: ['30 issues'] },
              },
              {
                key: 'medium',
                value: 25,
                tooltip: { title: 'Medium', details: ['25 issues'] },
              },
              {
                key: 'low',
                value: 30,
                tooltip: { title: 'Low', details: ['30 issues'] },
              },
            ]}
            sliceColors={['#dc2626', '#475569', '#94a3b8', '#334155']}
            slicePatterns={['stripes', undefined, 'dots', undefined]}
          />
        </div>
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
      <p class="highlighted-example-description">
        An editable expression with caller-provided syntax highlighting.
      </p>
      <HighlightedTextInput
        value={code}
        aria-label="Expression"
        highlight={code
          .split(/(\bvalue\b|\b\d+(?:\.\d+)?\b)/gi)
          .map((part, index) =>
            /^value$/i.test(part) ? (
              <span key={index} class="highlighted-example-variable">
                {part}
              </span>
            ) : /^\d/.test(part) ? (
              <span key={index} class="highlighted-example-number">
                {part}
              </span>
            ) : (
              part
            ),
          )}
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
        <Dropdown
          className="rv-select"
          source={[
            { value: 'Fixed', label: 'Fixed' },
            { value: 'Auto', label: 'Auto' },
          ]}
          config={{ ariaLabel: 'Sizing mode' }}
          value={mode}
          onChange={(value) => setMode(String(value))}
        />
        <NumberInput
          aria-label="Width"
          min={1}
          value={amount}
          onValueChange={(value) => setAmount(value ?? 1)}
        />
        <Dropdown
          className="rv-select"
          source={[
            { value: 'Pixels', label: 'Pixels' },
            { value: 'Percent', label: 'Percent' },
          ]}
          config={{ ariaLabel: 'Size unit' }}
          value={unit}
          onChange={(value) => setUnit(String(value))}
        />
      </InlineFieldGroup>
    </Specimen>
  );
}

export function ChoiceChipFilterVariants() {
  const [selected, setSelected] = useState(['Critical', 'High']);
  const [visible, setVisible] = useState(true);
  return (
    <>
      <ChoiceChips
        ariaLabel="Colored choices"
        value={selected}
        options={[
          { value: 'Critical', label: 'Critical', color: '#ef4444' },
          { value: 'High', label: 'High', color: '#d97706' },
          { value: 'Normal', label: 'Normal', color: '#16a34a' },
          { value: 'Low', label: 'Low', color: '#2563eb' },
          { value: 'Backlog', label: 'Backlog', color: '#9333ea' },
        ]}
        onChange={(value) =>
          setSelected(
            selected.includes(value)
              ? selected.filter((item) => item !== value)
              : [...selected, value],
          )
        }
      />
      <div
        class="rv-filter-badges"
        role="list"
        aria-label="Active sample filters"
      >
        {visible && (
          <FilterBadge
            role="listitem"
            color="#2563eb"
            label="Priority: 2 selected"
            details="Critical, High · blanks excluded"
            detailsLabel="Details for Priority filter"
            descriptionId="sample-priority-details"
            removeLabel="Remove Priority filter"
            onRemove={() => setVisible(false)}
          />
        )}
        <FilterBadge
          role="listitem"
          label="Region: Europe"
          details="Read-only filter"
          detailsLabel="Details for Region filter"
          descriptionId="sample-region-details"
        />
      </div>
      {!visible && (
        <ButtonControl onClick={() => setVisible(true)}>
          Restore Priority filter
        </ButtonControl>
      )}
    </>
  );
}
