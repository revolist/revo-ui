import { TooltipApiFixture, TooltipExitFixture } from './api';
/** @jsxImportSource preact */
import {
  Listbox,
  ListboxOption,
  useSelectionListTooltips,
} from '@revolist/ui/selection-list';
import { Select } from '@revolist/ui/select';
import { SharedResourcePicker } from '@revolist/ui/resource-picker/index';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import {
  TimelineTrack,
  type TimelineTrackItem,
  type TimelineTrackEvent,
} from '@revolist/ui/timeline-track';
import { IconToolbar } from '@revolist/ui/icon-toolbar';
import { SvgButton } from '@revolist/ui/buttons/svg-button';
import { useTooltip } from '@revolist/ui/surfaces';
import { BarChart } from '@revolist/ui/bar-chart';
import '@revolist/ui/styles.scss';
const longName =
  'Workflow automation for the quarterly international planning review';
function SelectionHints() {
  const filterRef = useSelectionListTooltips('.filter-list-option');
  return (
    <section style={{ width: 220 }}>
      <Listbox label="Task choices" onSelect={() => {}}>
        <ListboxOption value="long" selected label={longName} />
        <ListboxOption value="short" selected={false} label="Short" />
      </Listbox>
      <div ref={filterRef}>
        <label
          class="filter-list-option"
          style={{ display: 'flex', width: 180 }}
        >
          <input type="checkbox" />
          <span style={{ display: 'flex', minWidth: 0, gap: 8 }}>
            <span>1.5.14</span>
            <span
              class="rich-label"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {longName}
            </span>
          </span>
        </label>
      </div>
      <Select aria-label="Department" value="short">
        <option value="short">Short</option>
        <option value="long">{longName}</option>
      </Select>
      <SharedResourcePicker
        resources={[{ id: 'long', name: longName }]}
        selectedResourceIds={[]}
        onChange={() => {}}
        text={{
          groupAriaLabel: 'Owners',
          searchPlaceholder: 'Search',
          searchAriaLabel: 'Search owners',
          emptyResources: 'No owners',
          emptySearch: 'No matches',
        }}
      />
      <SharedResourcePicker
        presentation="dropdown"
        preserveOrder
        resources={[
          { id: 'long', name: longName },
          { id: 'second', name: `Second ${longName}` },
        ]}
        selectedResourceIds={[]}
        onChange={() => {}}
        text={{
          groupAriaLabel: 'Dropdown owners',
          searchPlaceholder: 'Search',
          searchAriaLabel: 'Search dropdown owners',
          emptyResources: 'No owners',
          emptySearch: 'No matches',
        }}
      />
    </section>
  );
}
function Hints() {
  const hint = useTooltip('Formatting help');
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        height: 44,
        width: 300,
      }}
    >
      <IconToolbar
        label="Formatting"
        actions={[{ id: 'bold', label: 'Bold', text: 'B' }]}
        onAction={() => {}}
      />
      <SvgButton label="Clear formatting" />
      <button {...hint.triggerProps}>Help</button>
      {hint.tooltip}
    </div>
  );
}
function BoundaryTimeline() {
  const [rows, setRows] = useState<TimelineTrackItem<TimelineTrackEvent>[]>([
    { id: 'left', event: { start: 0, end: 1, label: 'Left edge' } },
    { id: 'right', event: { start: 22, end: 23, label: 'Right edge' } },
    { id: 'milestone', event: { start: 24, end: 24, label: 'End milestone' } },
    { id: 'full', event: { start: 0, end: 24, label: 'Full range' } },
  ]);
  return (
    <section style={{ width: 320, maxWidth: '100%' }}>
      <TimelineTrack
        rows={rows}
        range={{ start: 0, end: 24 }}
        tooltip={false}
        labels={{ preview: 'Boundary timeline preview' }}
        onSelect={() => {}}
        onEventChange={(id, event) =>
          setRows((current) =>
            current.map((row) => (row.id === id ? { ...row, event } : row)),
          )
        }
      />
    </section>
  );
}
render(
  new URLSearchParams(location.search).has('exit-transition') ? (
    <TooltipExitFixture />
  ) : new URLSearchParams(location.search).has('api') ? (
    <TooltipApiFixture />
  ) : new URLSearchParams(location.search).has('timeline') ? (
    <BoundaryTimeline />
  ) : (
    <main style={{ margin: 30 }}>
      <Hints />
      <style>{`.dropdown-option [data-select-option] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`}</style>
      {!new URLSearchParams(location.search).has('hints') && (
        <>
          <SelectionHints />
          <BarChart
            ariaLabel="Values"
            height={100}
            data={[
              {
                key: 'a',
                value: 2,
                tooltip: { title: 'First', details: ['2 items'] },
              },
            ]}
          />
        </>
      )}
    </main>
  ),
  document.getElementById('app')!,
);
