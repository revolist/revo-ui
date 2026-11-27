import { h } from 'preact';
import type { ISODateString } from '@revolist/ui-dates';
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  CalendarNavigator,
  MetricPanel,
  MetricTile,
  SearchActionBar,
  Button,
} from '@revolist/ui/preact';
import {
  AppearanceConfigurator,
  type AppearanceConfiguratorState,
} from '@revolist/ui/appearance-configurator';
import { createBenchmarkCardContent } from '@revolist/ui/benchmark-card';
import {
  createMetricProgressRow,
  createRecordNavigation,
} from '@revolist/ui/native';
import { Example } from './catalog';

export function CalendarNavigatorExample() {
  const [date, setDate] = useState<ISODateString>('2026-11-21');
  return (
    <Example title="Calendar navigator">
      <CalendarNavigator value={date} today="2026-11-21" onChange={setDate} />
      <output>{date}</output>
    </Example>
  );
}

export function AppearanceConfiguratorExample() {
  const initial: AppearanceConfiguratorState = {
    density: 'comfortable',
    columnLines: true,
    rowStripes: false,
    resizable: true,
    movable: true,
  };
  const [state, setState] = useState(initial);
  return (
    <Example title="Appearance configurator">
      <AppearanceConfigurator
        labels={{
          appearance: 'Appearance',
          density: 'Density',
          columnLines: 'Column lines',
          rowStripes: 'Row stripes',
          columns: 'Columns',
          resizable: 'Resizable',
          movable: 'Movable',
          reset: 'Reset',
        }}
        densityOptions={[
          { value: 'comfortable', label: 'Comfortable' },
          { value: 'compact', label: 'Compact' },
        ]}
        state={state}
        onChange={(patch) => setState({ ...state, ...patch })}
        onReset={() => setState(initial)}
      />
    </Example>
  );
}

export function SearchActionBarExample() {
  const [value, setValue] = useState('');
  return (
    <Example title="Search action bar">
      <SearchActionBar
        aria-label="Search projects"
        placeholder="Search projects"
        value={value}
        onValueChange={setValue}
        actions={<Button>Filter</Button>}
      />
    </Example>
  );
}

export function MetricPanelExample() {
  return (
    <Example title="Metric panel" wide>
      <MetricPanel
        label="Overview"
        items={[
          { label: 'Revenue', value: '$31.4M', detail: '+3.5%' },
          { label: 'Orders', value: '253,441', detail: '+3.4%' },
          { label: 'Returns', value: '6.2%', detail: '0.0 pts' },
        ]}
      />
      <MetricPanel label="Distribution summaries">
        <MetricTile label="Revenue" value="$1.72M" detail="+21.8%" summary={{ markerColor: 'var(--rv-ui-accent)' }}>
          <small>Range: $55K–$711K</small>
        </MetricTile>
        <MetricTile label="Hiring" value="8,198" detail="+6.5%" summary={{ markerColor: 'var(--rv-ui-success)' }}>
          <small>Range: −5%–19%</small>
        </MetricTile>
      </MetricPanel>
    </Example>
  );
}

function NativePreview({
  kind,
}: {
  kind: 'benchmark' | 'progress' | 'navigation';
}) {
  const host = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const node =
      kind === 'benchmark'
        ? createBenchmarkCardContent(document, {
            title: 'On-time delivery',
            description: 'Last quarter',
            value: '85%',
            detail: '548 of 642 orders',
            change: '+10 points',
            changeTone: 'positive',
            benchmark: 'Average 75%',
            progress: { value: 85, label: 'On-time delivery 85%' },
          })
        : kind === 'progress'
          ? createMetricProgressRow(document, {
              label: 'Budget spent',
              meterLabel: 'Budget spent',
              value: 72,
              maximum: 100,
              formattedValue: '72%',
              detail: 'This quarter',
            })
          : createRecordNavigation(document, {
              index,
              count: 3,
              label: `${index + 1} of 3`,
              previousLabel: 'Previous record',
              nextLabel: 'Next record',
              onPrevious: () => setIndex((value) => value - 1),
              onNext: () => setIndex((value) => value + 1),
            });
    container.replaceChildren(node);
    return () => {
      container.replaceChildren();
    };
  }, [kind, index]);
  return <div ref={host} />;
}

export function NativePresentationExamples() {
  return (
    <>
      <Example title="Benchmark card">
        <NativePreview kind="benchmark" />
      </Example>
      <Example title="Metric progress row">
        <NativePreview kind="progress" />
      </Example>
      <Example title="Record navigation">
        <NativePreview kind="navigation" />
      </Example>
    </>
  );
}
