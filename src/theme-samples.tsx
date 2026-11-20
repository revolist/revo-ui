import { h } from 'preact';
import { useId, useRef, useState } from 'preact/hooks';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  CircularProgress,
  Dropdown,
  ProgressBar,
  RadioGroup,
  Switch,
  TextInput,
  Textarea,
  ToggleButton,
} from '@revolist/ui/preact';
import {
  Chip,
  ChoiceChip,
  ChoiceChipInfoButton,
  ChoiceChips,
  FieldGroupHeading,
  FieldHint,
  Legend,
  NumberStepper,
  Panel,
  RatingChoice,
  RatingStar,
  RemoveButton,
  SearchInput,
  SegmentedControl,
  SegmentedSwitch,
  Tabs,
} from '@revolist/ui/preact';
import {
  DialogActions,
  DialogBody,
  DialogCloseButton,
  DialogFooter,
  DialogHeader,
  DialogTitleInput,
  FilterBadge,
  FilterBadgeInfoButton,
  FilterChip,
  Input,
} from '@revolist/ui/preact';
import {
  CalendarDay,
  CalendarHeader,
  CalendarWeekdays,
  DisclosureSummary,
  EditorList,
  EditorListGroup,
  EditorListItem,
  EditorListItemContent,
  EditorPane,
  EditorSplitLayout,
} from '@revolist/ui/preact';
import {
  AiChatEmptyState,
  AiPromptInput,
  AiRequestTrail,
  AiResultView,
  FieldLibrary,
  FieldLibraryList,
  FieldRemoveIcon,
  FieldRow,
  FieldSummary,
  SvgIcon,
} from '@revolist/ui/preact';
import {
  DistributionChart,
  FieldDropIndicator,
  ReorderHandle,
  ReorderList,
  ResourcePickerAvatar,
} from '@revolist/ui/preact';
import {
  ActivityMessage,
  ButtonGroup,
  CountBadge,
  Disclosure,
  EmptyState,
  FieldError,
  FormField,
  FormSection,
  LoadingOverlay,
  Menu,
  MenuItem,
  MenuSeparator,
  Spinner,
  StatusBadge,
  Submenu,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@revolist/ui/preact';
import { Select } from '@revolist/ui/select';
import {
  FieldActions,
  FieldContent,
  FieldGroup,
  FieldIcon,
  FieldItem,
  FieldList,
  FieldRemoveButton,
  FieldStatusBadge,
  HighlightedTextInput,
  IconButton,
  InlineFieldGroup,
  Listbox,
  ListboxGroup,
  ListboxOption,
  ListboxOptionContent,
  NumberInput,
  OptionButton,
  Pagination,
  Pane,
  Rating,
  SelectedField,
  SplitLayout,
  SvgButton,
  TabPanel,
} from '@revolist/ui/preact';
import {
  AiActionStatus,
  AiAssistant,
  AiChat,
  AiChatComposer,
  AiChatContent,
  AiMessage,
  AiMessageActions,
  AiMessageContent,
  AiReasoning,
  AiResult,
  AiResultMetrics,
  AiResultTable,
  AiResultText,
  AiSuggestions,
  AiTask,
  AiTaskItem,
} from '@revolist/ui/preact';
import {
  AreaChart,
  Avatar,
  BarChart,
  Calendar,
  CalendarPicker,
  CollapsibleSection,
  ColorPalette,
  ColorPicker,
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimeField,
  DialogActionFooter,
  DialogForm,
  EditableDialogHeader,
  LineChart,
  MultiSelect,
  SharedResourcePicker,
  SingleValueSlider,
  SliderField,
} from '@revolist/ui/preact';
import type { ISODateString } from '@revolist/ui-dates';
import {
  ComparisonPreview,
  IconChoiceGroup,
  IconToggleButton,
  IconToolbar,
  InspectorSection,
  ResizeHandle,
  StatusFeedbackPanel,
  TimeGrid,
  TypographyControls,
} from '@revolist/ui/preact';
import {
  CalendarMonthGrid,
  CalendarYearGrid,
  DropdownPopupContent,
  PreactRangeSlider,
} from '@revolist/ui/preact';
import {
  BrushRange,
  DurationDraft,
  DurationField,
  HtmlEditor,
  MaskedDraft,
  TemporalDraft,
  TemporalPicker,
} from '@revolist/ui/preact';
import { LookupField } from '@revolist/ui/dropdown/lookup-field';
import {
  AiChangePreview,
  AssigneePicker,
  AssigneePickerLayout,
  ConfirmDialog,
  ControlTooltip,
  Dialog,
  DropdownPopup,
  NumberDraft,
  PdfViewer,
  PdfViewerToolbar,
  Popover,
  TimelineTrack,
  Tooltip,
} from '@revolist/ui/preact';
import { AssigneeField, type AssigneeAssignment } from '@revolist/ui/assignee';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createSamplePdf } from './sample-pdf';
import { presetProps } from '@revolist/ui/presets';
import type { ThemePreview } from './theme-editor';

const samplePdf = createSamplePdf();

const names = new Set([
  'Alert',
  'Badge',
  'Button',
  'Checkbox',
  'CircularProgress',
  'Dropdown',
  'ProgressBar',
  'RadioGroup',
  'Switch',
  'TextInput',
  'Textarea',
  'ToggleButton',
  'Chip',
  'ChoiceChip',
  'ChoiceChipInfoButton',
  'FieldGroupHeading',
  'FieldHint',
  'Legend',
  'Panel',
  'RatingChoice',
  'RatingStar',
  'RemoveButton',
  'ChoiceChips',
  'NumberStepper',
  'SearchInput',
  'SegmentedControl',
  'SegmentedSwitch',
  'Tabs',
  'DialogActions',
  'DialogBody',
  'DialogCloseButton',
  'DialogFooter',
  'DialogHeader',
  'DialogTitleInput',
  'FilterBadge',
  'FilterBadgeInfoButton',
  'FilterChip',
  'Input',
  'CalendarDay',
  'CalendarHeader',
  'CalendarWeekdays',
  'DisclosureSummary',
  'EditorList',
  'EditorListGroup',
  'EditorListItem',
  'EditorListItemContent',
  'EditorPane',
  'EditorSplitLayout',
  'AiChatEmptyState',
  'AiPromptInput',
  'AiRequestTrail',
  'AiResultView',
  'FieldLibrary',
  'FieldLibraryList',
  'FieldRemoveIcon',
  'FieldRow',
  'FieldSummary',
  'SvgIcon',
  'DistributionChart',
  'FieldDropIndicator',
  'ReorderHandle',
  'ReorderList',
  'ResourcePickerAvatar',
  'ActivityMessage',
  'ButtonGroup',
  'CountBadge',
  'Disclosure',
  'EmptyState',
  'FieldError',
  'FormField',
  'FormSection',
  'LoadingOverlay',
  'Menu',
  'MenuItem',
  'MenuSeparator',
  'Select',
  'Spinner',
  'StatusBadge',
  'Submenu',
  'Toolbar',
  'ToolbarGroup',
  'ToolbarSeparator',
  'FieldActions',
  'FieldContent',
  'FieldGroup',
  'FieldIcon',
  'FieldItem',
  'FieldList',
  'FieldRemoveButton',
  'FieldStatusBadge',
  'HighlightedTextInput',
  'IconButton',
  'InlineFieldGroup',
  'Listbox',
  'ListboxGroup',
  'ListboxOption',
  'ListboxOptionContent',
  'NumberInput',
  'OptionButton',
  'Pagination',
  'Pane',
  'Rating',
  'SelectedField',
  'SplitLayout',
  'SvgButton',
  'TabPanel',
  'AiActionStatus',
  'AiAssistant',
  'AiChat',
  'AiChatComposer',
  'AiChatContent',
  'AiMessage',
  'AiMessageActions',
  'AiMessageContent',
  'AiReasoning',
  'AiResult',
  'AiResultMetrics',
  'AiResultTable',
  'AiResultText',
  'AiSuggestions',
  'AiTask',
  'AiTaskItem',
  'AreaChart',
  'Avatar',
  'BarChart',
  'Calendar',
  'CalendarPicker',
  'CollapsibleSection',
  'ColorPalette',
  'ColorPicker',
  'Combobox',
  'DatePicker',
  'DateRangePicker',
  'DateTimeField',
  'DialogActionFooter',
  'DialogForm',
  'EditableDialogHeader',
  'LineChart',
  'MultiSelect',
  'SharedResourcePicker',
  'SingleValueSlider',
  'SliderField',
  'ComparisonPreview',
  'IconChoiceGroup',
  'IconToggleButton',
  'IconToolbar',
  'InspectorSection',
  'ResizeHandle',
  'StatusFeedbackPanel',
  'TimeGrid',
  'TypographyControls',
  'CalendarMonthGrid',
  'CalendarYearGrid',
  'DropdownPopupContent',
  'PreactRangeSlider',
  'BrushRange',
  'DurationDraft',
  'DurationField',
  'HtmlEditor',
  'LookupField',
  'MaskedDraft',
  'TemporalDraft',
  'TemporalPicker',
  'AiChangePreview',
  'AssigneeField',
  'AssigneePicker',
  'AssigneePickerLayout',
  'ConfirmDialog',
  'ControlTooltip',
  'Dialog',
  'DropdownPopup',
  'NumberDraft',
  'PdfViewer',
  'PdfViewerToolbar',
  'Popover',
  'TimelineTrack',
  'Tooltip',
]);
export const hasThemeSample = (name: string) => names.has(name);

function Sample({
  name,
  preset,
}: {
  name: string;
  preset?: ThemePreview['preset'];
}) {
  const id = useId();
  const matrixRef = useRef<HTMLDivElement>(null);
  const popupAnchor = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<AssigneeAssignment[]>([]);
  const [rows, setRows] = useState([
    { id: 'one', event: { start: 2, end: 6, label: 'Work' } },
  ]);
  const [gridFocus, setGridFocus] = useState('1:0');
  const [gridCells, setGridCells] = useState<ReadonlySet<string>>(new Set());
  const [typography, setTypography] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    fontFamily?: string;
    fontSize?: number;
  }>({});
  const icon = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /></svg>';
  const [checked, setChecked] = useState(true);
  const [value, setValue] = useState('one');
  const [number, setNumber] = useState(1);
  const [range, setRange] = useState({ fromValue: 2, toValue: 8 });
  const [date, setDate] = useState<ISODateString>('2026-11-20');
  const [fieldDate, setFieldDate] = useState('2026-11-20');
  const [duration, setDuration] = useState('2h');
  const [month, setMonth] = useState<ISODateString>('2026-11-01');
  const [dateRange, setDateRange] = useState<{
    from: ISODateString;
    to: ISODateString;
  }>({
    from: '2026-11-20',
    to: '2026-11-22',
  });
  const [color, setColor] = useState<string | null>('#2563eb');
  const [selected, setSelected] = useState<readonly string[]>(['one']);
  const options = [
    { label: 'First', value: 'one' },
    { label: 'Second', value: 'two' },
  ];
  const shared = presetProps(preset) as { preset: any };
  switch (name) {
    case 'AiChangePreview':
      return open ? (
        <AiChangePreview
          {...shared}
          summary="Review changes"
          onApply={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <Button onClick={() => setOpen(true)}>Open preview</Button>
      );
    case 'AssigneeField':
      return open ? (
        <AssigneeField
          {...shared}
          value={assignments}
          options={{ source: [{ value: 'one', label: 'Alex Kim' }] }}
          save={(next) => {
            setAssignments(next);
            setOpen(false);
          }}
          cancel={() => setOpen(false)}
        />
      ) : (
        <Button onClick={() => setOpen(true)}>Open assignees</Button>
      );
    case 'AssigneePicker':
      return open ? (
        <AssigneePicker
          {...shared}
          id={`${id}-picker`}
          options={[{ value: 'one', label: 'Alex Kim' }]}
          value={assignments}
          change={setAssignments}
          defaultUnits={100}
          apply={() => setOpen(false)}
          cancel={() => setOpen(false)}
        />
      ) : (
        <Button onClick={() => setOpen(true)}>Open picker</Button>
      );
    case 'AssigneePickerLayout':
      return open ? (
        <AssigneePickerLayout
          {...shared}
          id={`${id}-picker`}
          options={[{ value: 'one', label: 'Alex Kim' }]}
          value={assignments}
          change={setAssignments}
          defaultUnits={100}
          apply={() => setOpen(false)}
          cancel={() => setOpen(false)}
          query={value}
          onQueryChange={setValue}
        >
          <p>Picker content</p>
        </AssigneePickerLayout>
      ) : (
        <Button onClick={() => setOpen(true)}>Open picker</Button>
      );
    case 'ConfirmDialog':
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open confirmation</Button>
          <ConfirmDialog
            {...shared}
            open={open}
            title="Confirm"
            closeLabel="Close"
            onClose={() => setOpen(false)}
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={() => setOpen(false)}
          >
            Continue?
          </ConfirmDialog>
        </>
      );
    case 'ControlTooltip':
      return (
        <>
          <Button ref={setAnchor} onClick={() => setOpen(!open)}>
            Toggle tooltip
          </Button>
          <ControlTooltip
            {...shared}
            id={`${id}-tooltip`}
            text="Example tooltip"
            anchor={anchor}
            visible={open}
          />
        </>
      );
    case 'Dialog':
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open dialog</Button>
          <Dialog
            {...shared}
            open={open}
            title="Example dialog"
            closeLabel="Close"
            onClose={() => setOpen(false)}
          >
            Dialog content
          </Dialog>
        </>
      );
    case 'DropdownPopup':
      return (
        <>
          <div ref={popupAnchor}>
            <Button onClick={() => setOpen(!open)}>Toggle popup</Button>
          </div>
          {open && (
            <DropdownPopup
              {...shared}
              triggerRef={popupAnchor}
              onClose={() => setOpen(false)}
            >
              <p>Popup content</p>
            </DropdownPopup>
          )}
        </>
      );
    case 'NumberDraft':
      return open ? (
        <NumberDraft
          {...shared}
          value={number}
          options={{ label: 'Number' }}
          apply={(next) => {
            setNumber(next ?? 0);
            setOpen(false);
          }}
          cancel={() => setOpen(false)}
        />
      ) : (
        <Button onClick={() => setOpen(true)}>Edit number</Button>
      );
    case 'PdfViewer':
      return (
        <PdfViewer
          {...shared}
          source={samplePdf}
          workerSrc={workerSrc}
          height={300}
        />
      );
    case 'PdfViewerToolbar':
      return (
        <PdfViewer
          source={samplePdf}
          workerSrc={workerSrc}
          height={300}
          renderToolbar={(_controller, _state, props) => (
            <PdfViewerToolbar {...props} {...shared} />
          )}
        />
      );
    case 'Popover':
      return (
        <>
          <Button ref={setAnchor} onClick={() => setOpen(!open)}>
            Toggle popover
          </Button>
          <Popover
            {...shared}
            open={open}
            anchor={anchor}
            onClose={() => setOpen(false)}
            label="Example"
          >
            Popover content
          </Popover>
        </>
      );
    case 'TimelineTrack':
      return (
        <TimelineTrack
          {...shared}
          rows={rows}
          selected={value}
          range={{ start: 0, end: 10 }}
          onSelect={(next) => setValue(String(next))}
          onEventChange={(key, event) =>
            setRows((previous) =>
              previous.map((row) => (row.id === key ? { ...row, event } : row)),
            )
          }
        />
      );
    case 'Tooltip':
      return (
        <Tooltip {...shared} text="Example tooltip">
          <Button>Show tooltip</Button>
        </Tooltip>
      );
    case 'BrushRange':
      return (
        <BrushRange
          {...shared}
          slider={{
            min: 0,
            max: 10,
            ...range,
            fromAriaLabel: 'Minimum',
            toAriaLabel: 'Maximum',
            onRangeChange: setRange,
          }}
          startLabel="0"
          selectionLabel={`${range.fromValue}–${range.toValue}`}
          endLabel="10"
        />
      );
    case 'DurationDraft':
      return (
        <DurationDraft
          {...shared}
          value="2h"
          options={{ defaultUnit: 'hour' }}
          apply={(next) => setValue(next ? String(next.value) : '')}
          cancel={() => setValue('')}
        />
      );
    case 'DurationField':
      return (
        <DurationField
          {...shared}
          value={duration}
          defaultUnit="hour"
          label="Duration"
          onChange={(next) =>
            setDuration(next ? `${next.value} ${next.unit}` : '')
          }
        />
      );
    case 'HtmlEditor':
      return (
        <HtmlEditor
          {...shared}
          value="<p>Example text</p>"
          onApply={setValue}
          onCancel={() => setValue('')}
        />
      );
    case 'LookupField':
      return (
        <LookupField
          {...shared}
          initial={null}
          context={null}
          options={{
            dataSource: {
              search: async () => ({ items: options }),
              resolve: async ({ ids }) =>
                options.filter((item) => ids.includes(item.value)),
            },
          }}
          apply={(next) => setValue(String(next ?? ''))}
          cancel={() => setValue('')}
        />
      );
    case 'MaskedDraft':
      return (
        <MaskedDraft
          {...shared}
          value="1234"
          options={{ mask: '00-00', label: 'Code' }}
          apply={(next) => setValue(next ?? '')}
          cancel={() => setValue('')}
        />
      );
    case 'TemporalDraft':
      return (
        <TemporalDraft
          {...shared}
          value="2026-11-20"
          options={{ kind: 'date' }}
          apply={(next) => setValue(String(next ?? ''))}
          cancel={() => setValue('')}
        />
      );
    case 'TemporalPicker':
      return (
        <TemporalPicker
          {...shared}
          kind="date"
          value={fieldDate}
          onChange={(next) => typeof next === 'string' && setFieldDate(next)}
        />
      );
    case 'CalendarMonthGrid':
      return (
        <div role="grid" aria-label="Calendar">
          <CalendarMonthGrid
            {...shared}
            dates={[
              '2026-11-16',
              '2026-11-17',
              '2026-11-18',
              '2026-11-19',
              '2026-11-20',
              '2026-11-21',
              '2026-11-22',
            ]}
            month="2026-11-01"
            focusedDate={date}
            showOutsideDays
            allowOutsideMonthSelection
            isDisabled={() => false}
            formatDayLabel={(day) => day}
            setDayRef={() => {}}
            onFocus={setDate}
            onPreview={() => {}}
            onKeyDown={() => {}}
            onSelect={setDate}
          />
        </div>
      );
    case 'CalendarYearGrid':
      return (
        <CalendarYearGrid
          {...shared}
          month={month}
          locale="en"
          ariaLabel="Months"
          onSelect={setMonth}
          onEscape={() => {}}
        />
      );
    case 'DropdownPopupContent':
      return (
        <DropdownPopupContent
          {...shared}
          options={options}
          value={value}
          onChange={(next) =>
            setValue(String(Array.isArray(next) ? next[0] : next))
          }
          config={{}}
          multiSelect={false}
          search
          searchPlaceholder="Search"
          listboxId={`${id}-list`}
          searchId={`${id}-search`}
          onClose={() => {}}
        />
      );
    case 'PreactRangeSlider':
      return (
        <PreactRangeSlider
          {...shared}
          min={0}
          max={10}
          {...range}
          fromAriaLabel="Minimum"
          toAriaLabel="Maximum"
          onRangeChange={setRange}
        />
      );
    case 'ComparisonPreview':
      return (
        <ComparisonPreview
          {...shared}
          originalValue="1234"
          formatted="1,234"
          labels={{
            title: 'Preview',
            original: 'Original',
            formatted: 'Formatted',
            hint: 'Example',
          }}
        />
      );
    case 'IconChoiceGroup':
      return (
        <IconChoiceGroup
          {...shared}
          ariaLabel="Alignment"
          value={value}
          onChange={setValue}
          options={[
            { value: 'one', label: 'First', icon },
            { value: 'two', label: 'Second', icon },
          ]}
        />
      );
    case 'IconToggleButton':
      return (
        <IconToggleButton
          {...shared}
          label="Bold"
          icon={icon}
          value={checked}
          onChange={setChecked}
        />
      );
    case 'IconToolbar':
      return (
        <IconToolbar
          {...shared}
          label="Actions"
          actions={[{ id: 'one', label: 'Toggle', icon, pressed: checked }]}
          onAction={() => setChecked(!checked)}
        />
      );
    case 'InspectorSection':
      return (
        <InspectorSection
          {...shared}
          title="Formatting"
          icon={icon}
          expandLabel="Expand"
          collapseLabel="Collapse"
        >
          Options
        </InspectorSection>
      );
    case 'ResizeHandle':
      return (
        <ResizeHandle
          {...shared}
          label="Resize"
          value={number}
          min={0}
          max={20}
          onChange={setNumber}
        />
      );
    case 'StatusFeedbackPanel':
      return (
        <StatusFeedbackPanel
          {...shared}
          title="Status"
          items={[{ id: 'one', title: 'Ready', tone: 'success' }]}
        />
      );
    case 'TimeGrid':
      return (
        <TimeGrid
          {...shared}
          days={[{ weekday: 1, short: 'Mon', long: 'Monday' }]}
          cells={gridCells}
          focused={gridFocus}
          weekendDays={[]}
          gridLabel="Availability"
          hourLabel={(hour) => String(hour)}
          cellLabel={(day, start, end) => `${day.long} ${start}-${end}`}
          matrixRef={matrixRef}
          onFocus={setGridFocus}
          onKeyDown={() => {}}
          onClick={(_event, day, hour) =>
            setGridCells((previous) => {
              const next = new Set(previous);
              const key = `${day}:${hour}`;
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            })
          }
          onPointerDown={() => {}}
          onPointerEnter={() => {}}
        />
      );
    case 'TypographyControls':
      return (
        <TypographyControls
          {...shared}
          value={typography}
          onChange={(patch) =>
            setTypography((previous) => ({ ...previous, ...patch }))
          }
          labels={{
            fontFamily: 'Font',
            defaultFont: 'Default',
            fontSize: 'Size',
            typographySection: 'Style',
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            strike: 'Strike',
          }}
          icons={{ bold: icon, italic: icon, underline: icon, strike: icon }}
        />
      );
    case 'AreaChart':
      return (
        <AreaChart
          {...shared}
          ariaLabel="Activity"
          data={[
            { key: 'one', value: 4, tooltip: { title: 'First' } },
            { key: 'two', value: 7, tooltip: { title: 'Second' } },
          ]}
        />
      );
    case 'BarChart':
      return (
        <BarChart
          {...shared}
          ariaLabel="Activity"
          data={[
            { key: 'one', value: 4, tooltip: { title: 'First' } },
            { key: 'two', value: 7, tooltip: { title: 'Second' } },
          ]}
        />
      );
    case 'LineChart':
      return (
        <LineChart
          {...shared}
          ariaLabel="Activity"
          data={[
            { key: 'one', value: 4, tooltip: { title: 'First' } },
            { key: 'two', value: 7, tooltip: { title: 'Second' } },
          ]}
        />
      );
    case 'Avatar':
      return <Avatar {...shared} value="Alex Kim" label="Alex Kim" />;
    case 'Calendar':
      return (
        <Calendar
          {...shared}
          month={month}
          focusedDate={date}
          referenceDate="2026-11-20"
          selection={{ from: date, to: date }}
          onMonthChange={setMonth}
          onFocusedDateChange={setDate}
          onSelect={setDate}
        />
      );
    case 'CalendarPicker':
      return (
        <CalendarPicker
          {...shared}
          selected={date}
          onSelectionChange={(next) => next && setDate(next)}
          defaultMonth="2026-11-01"
          referenceDate="2026-11-20"
        />
      );
    case 'CollapsibleSection':
      return (
        <CollapsibleSection {...shared} title="Details">
          Section content
        </CollapsibleSection>
      );
    case 'ColorPalette':
      return (
        <ColorPalette
          {...shared}
          value={color}
          ariaLabel="Colors"
          defaultLabel="Default"
          colorAriaLabel={(option) => option.label}
          onChange={setColor}
        />
      );
    case 'ColorPicker':
      return (
        <ColorPicker
          {...shared}
          label="Color"
          value={color ?? undefined}
          defaultLabel="Default"
          customLabel="Custom color"
          customHexLabel="Hex color"
          invalidColor="Invalid color"
          colorLabels={{}}
          onChange={(next) => setColor(next ?? null)}
        />
      );
    case 'Combobox':
      return (
        <Combobox
          {...shared}
          source={options}
          value={value}
          onChange={(next) =>
            setValue(String(Array.isArray(next) ? next[0] : next))
          }
          config={{ ariaLabel: 'Option' }}
        />
      );
    case 'DatePicker':
      return (
        <DatePicker
          {...shared}
          label="Date"
          openLabel="Choose date"
          value={date}
          onChange={(next) => next && setDate(next)}
        />
      );
    case 'DateRangePicker':
      return (
        <DateRangePicker
          {...shared}
          label="Dates"
          fromLabel="Start"
          toLabel="End"
          openLabel="Choose dates"
          value={dateRange}
          onChange={setDateRange}
        />
      );
    case 'DateTimeField':
      return (
        <DateTimeField
          {...shared}
          aria-label="Date"
          value={fieldDate}
          onValueChange={setFieldDate}
        />
      );
    case 'DialogActionFooter':
      return (
        <DialogActionFooter
          {...shared}
          cancel={{ onClick: () => setChecked(false) }}
          save={{ onClick: () => setChecked(true) }}
        />
      );
    case 'DialogForm':
      return (
        <DialogForm
          {...shared}
          aria-label="Dialog"
          onSubmit={(event) => event.preventDefault()}
        >
          Form content
        </DialogForm>
      );
    case 'EditableDialogHeader':
      return (
        <EditableDialogHeader
          {...shared}
          titleId={`${id}-title`}
          title={value}
          inputLabel="Title"
          closeLabel="Close"
          inputProps={{
            value,
            onInput: (event) => setValue(event.currentTarget.value),
          }}
          onClose={() => setChecked(false)}
        />
      );
    case 'MultiSelect':
      return (
        <MultiSelect
          {...shared}
          source={options}
          value={[...selected]}
          onChange={(next) => setSelected(Array.isArray(next) ? next : [next])}
          config={{ ariaLabel: 'Options' }}
        />
      );
    case 'SharedResourcePicker':
      return (
        <SharedResourcePicker
          {...shared}
          resources={[
            { id: 'one', name: 'Alex Kim' },
            { id: 'two', name: 'Sam Lee' },
          ]}
          selectedResourceIds={selected}
          onChange={setSelected}
          text={{
            groupAriaLabel: 'People',
            searchPlaceholder: 'Search',
            searchAriaLabel: 'Search',
            emptyResources: 'No people',
            emptySearch: 'No matches',
          }}
        />
      );
    case 'SingleValueSlider':
      return (
        <SingleValueSlider
          {...shared}
          min={0}
          max={10}
          value={number}
          ariaLabel="Value"
          onChange={setNumber}
        />
      );
    case 'SliderField':
      return (
        <SliderField
          {...shared}
          label="Value"
          ariaLabel="Value"
          min={0}
          max={10}
          value={number}
          onChange={setNumber}
        />
      );
    case 'AiActionStatus':
      return <AiActionStatus {...shared} phase="completed" message="Ready" />;
    case 'AiAssistant':
      return (
        <AiAssistant {...shared}>
          <AiMessage from="assistant">Hello</AiMessage>
        </AiAssistant>
      );
    case 'AiChat':
      return (
        <AiChat {...shared}>
          <AiMessage from="assistant">Hello</AiMessage>
        </AiChat>
      );
    case 'AiChatComposer':
      return (
        <AiChatComposer
          {...shared}
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue('')}
        />
      );
    case 'AiChatContent':
      return (
        <AiChatContent {...shared}>
          <AiMessage from="assistant">Hello</AiMessage>
        </AiChatContent>
      );
    case 'AiMessage':
      return (
        <AiMessage {...shared} from="assistant">
          Hello
        </AiMessage>
      );
    case 'AiMessageActions':
      return (
        <AiMessageActions {...shared}>
          <Button>Copy</Button>
        </AiMessageActions>
      );
    case 'AiMessageContent':
      return <AiMessageContent {...shared}>Hello</AiMessageContent>;
    case 'AiReasoning':
      return <AiReasoning {...shared}>Summary</AiReasoning>;
    case 'AiResult':
      return <AiResult {...shared} summary="Found matching rows" />;
    case 'AiResultMetrics':
      return (
        <AiResultMetrics
          {...shared}
          result={{
            kind: 'metrics',
            title: 'Summary',
            items: [{ label: 'Total', value: 12 }],
          }}
        />
      );
    case 'AiResultTable':
      return (
        <AiResultTable
          {...shared}
          result={{
            kind: 'table',
            title: 'Results',
            columns: [{ label: 'Name' }],
            rows: [['Alex']],
          }}
        />
      );
    case 'AiResultText':
      return (
        <AiResultText
          {...shared}
          result={{ kind: 'text', title: 'Result', text: 'Example result' }}
        />
      );
    case 'AiSuggestions':
      return (
        <AiSuggestions
          {...shared}
          items={['Show results', 'Summarize']}
          onSelect={setValue}
        />
      );
    case 'AiTask':
      return (
        <AiTask {...shared} title="Analyze">
          Completed successfully
        </AiTask>
      );
    case 'AiTaskItem':
      return <AiTaskItem {...shared}>Analysis complete</AiTaskItem>;
    case 'FieldActions':
      return (
        <FieldActions {...shared}>
          <Button>Save</Button>
        </FieldActions>
      );
    case 'FieldContent':
      return <FieldContent {...shared}>Name</FieldContent>;
    case 'FieldGroup':
      return (
        <FieldGroup {...shared} heading="Fields">
          Name
        </FieldGroup>
      );
    case 'FieldIcon':
      return (
        <FieldIcon
          {...shared}
          svg={'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /></svg>'}
        />
      );
    case 'FieldItem':
      return <FieldItem {...shared}>Name</FieldItem>;
    case 'FieldList':
      return (
        <FieldList {...shared} empty={false} placeholder="No fields">
          <FieldRow>Name</FieldRow>
        </FieldList>
      );
    case 'FieldRemoveButton':
      return (
        <FieldRemoveButton {...shared} onClick={() => setChecked(!checked)} />
      );
    case 'FieldStatusBadge':
      return (
        <FieldStatusBadge {...shared} label="Active" active>
          Active
        </FieldStatusBadge>
      );
    case 'HighlightedTextInput':
      return (
        <HighlightedTextInput
          {...shared}
          aria-label="Expression"
          value={value}
          highlight={value}
          onInput={(event) => setValue(event.currentTarget.value)}
        />
      );
    case 'IconButton':
      return (
        <IconButton {...shared} label="Save">
          Save
        </IconButton>
      );
    case 'InlineFieldGroup':
      return (
        <InlineFieldGroup {...shared} label="Fields">
          <TextInput aria-label="Name" value={value} onValueChange={setValue} />
        </InlineFieldGroup>
      );
    case 'Listbox':
      return (
        <Listbox {...shared} label="Options" onSelect={setValue}>
          <ListboxOption value="one" selected={value === 'one'} label="First" />
          <ListboxOption
            value="two"
            selected={value === 'two'}
            label="Second"
          />
        </Listbox>
      );
    case 'ListboxGroup':
      return (
        <Listbox label="Options" onSelect={setValue}>
          <ListboxGroup {...shared} label="Group">
            <ListboxOption value="one" selected label="First" />
          </ListboxGroup>
        </Listbox>
      );
    case 'ListboxOption':
      return (
        <Listbox label="Options" onSelect={() => setChecked(!checked)}>
          <ListboxOption
            {...shared}
            value="one"
            selected={checked}
            label="First"
          />
        </Listbox>
      );
    case 'ListboxOptionContent':
      return (
        <ListboxOptionContent {...shared} label="First" description="Details" />
      );
    case 'NumberInput':
      return (
        <NumberInput
          {...shared}
          aria-label="Quantity"
          value={number}
          onValueChange={(next) => setNumber(next ?? 0)}
        />
      );
    case 'OptionButton':
      return (
        <OptionButton
          {...shared}
          label="Option"
          detail="Details"
          selected={checked}
          onClick={() => setChecked(!checked)}
        />
      );
    case 'Pagination':
      return (
        <Pagination
          {...shared}
          page={number - 1}
          pageCount={5}
          onChange={(next) => setNumber(next + 1)}
          label="Pages"
          previousLabel="Previous"
          nextLabel="Next"
        />
      );
    case 'Pane':
      return (
        <Pane {...shared}>
          <div class="theme-pane-sample-content">Pane content</div>
        </Pane>
      );
    case 'Rating':
      return (
        <Rating
          {...shared}
          label="Rating"
          value={number}
          onChange={setNumber}
        />
      );
    case 'SelectedField':
      return (
        <ul>
          <SelectedField {...shared} label="Name" />
        </ul>
      );
    case 'SplitLayout':
      return (
        <SplitLayout {...shared}>
          <Pane>
            <div class="theme-pane-sample-content">Pane content</div>
          </Pane>
        </SplitLayout>
      );
    case 'SvgButton':
      return (
        <SvgButton {...shared} label="Save">
          Save
        </SvgButton>
      );
    case 'TabPanel':
      return (
        <>
          <span id={`${id}-tab`}>Details</span>
          <TabPanel
            {...shared}
            id={`${id}-panel`}
            labelledBy={`${id}-tab`}
            active
          >
            Panel content
          </TabPanel>
        </>
      );
    case 'ActivityMessage':
      return (
        <ActivityMessage
          {...shared}
          avatar="AK"
          timestamp="Today"
          header="Alex"
        >
          Updated the project.
        </ActivityMessage>
      );
    case 'ButtonGroup':
      return (
        <ButtonGroup {...shared} label="Actions">
          <Button>Save</Button>
          <Button>Cancel</Button>
        </ButtonGroup>
      );
    case 'CountBadge':
      return <CountBadge {...shared} label="Three items" count={3} />;
    case 'Disclosure':
      return (
        <Disclosure {...shared} summary="Details">
          Additional information
        </Disclosure>
      );
    case 'EmptyState':
      return (
        <EmptyState
          {...shared}
          title="No results"
          description="Try another search."
        />
      );
    case 'FieldError':
      return <FieldError {...shared}>Please enter a value.</FieldError>;
    case 'FormField':
      return (
        <FormField {...shared} label="Name" hint="Enter a name">
          <TextInput value={value} onValueChange={setValue} />
        </FormField>
      );
    case 'FormSection':
      return (
        <FormSection {...shared} title="Details">
          <TextInput aria-label="Name" value={value} onValueChange={setValue} />
        </FormSection>
      );
    case 'LoadingOverlay':
      return (
        <LoadingOverlay {...shared} busy={checked} label="Loading">
          <Button onClick={() => setChecked(!checked)}>Content</Button>
        </LoadingOverlay>
      );
    case 'Menu':
      return (
        <Menu {...shared} label="Actions">
          <MenuItem>Copy</MenuItem>
        </Menu>
      );
    case 'MenuItem':
      return (
        <Menu label="Actions">
          <MenuItem {...shared}>Copy</MenuItem>
        </Menu>
      );
    case 'MenuSeparator':
      return (
        <Menu label="Actions">
          <MenuItem>Copy</MenuItem>
          <MenuSeparator {...shared} />
          <MenuItem>Paste</MenuItem>
        </Menu>
      );
    case 'Select':
      return (
        <Select
          {...shared}
          aria-label="Option"
          value={value}
          onValueChange={setValue}
        >
          <option value="one">First</option>
          <option value="two">Second</option>
        </Select>
      );
    case 'Spinner':
      return <Spinner {...shared} label="Loading" />;
    case 'StatusBadge':
      return <StatusBadge {...shared} label="Ready" />;
    case 'Submenu':
      return (
        <Submenu {...shared} label="More">
          <MenuItem>Copy</MenuItem>
        </Submenu>
      );
    case 'Toolbar':
      return (
        <Toolbar {...shared} label="Actions">
          <Button>Save</Button>
        </Toolbar>
      );
    case 'ToolbarGroup':
      return (
        <Toolbar label="Actions">
          <ToolbarGroup {...shared} label="Editing">
            <Button>Save</Button>
          </ToolbarGroup>
        </Toolbar>
      );
    case 'ToolbarSeparator':
      return (
        <Toolbar label="Actions">
          <Button>Save</Button>
          <ToolbarSeparator {...shared} />
          <Button>Cancel</Button>
        </Toolbar>
      );
    case 'DistributionChart':
      return (
        <DistributionChart
          {...shared}
          ariaLabel="Activity"
          data={[
            { key: 'one', value: 4, tooltip: { title: 'First' } },
            { key: 'two', value: 7, tooltip: { title: 'Second' } },
          ]}
        />
      );
    case 'FieldDropIndicator':
      return (
        <div style={{ position: 'relative', height: 24 }}>
          <FieldDropIndicator {...shared} position="before" />
        </div>
      );
    case 'ReorderHandle':
      return <ReorderHandle {...shared} aria-label="Reorder" />;
    case 'ReorderList':
      return (
        <ReorderList
          {...shared}
          items={['First', 'Second']}
          itemKey={(item) => item}
          renderItem={(item) => item}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
        />
      );
    case 'ResourcePickerAvatar':
      return (
        <ResourcePickerAvatar
          {...shared}
          resource={{ id: 'one', name: 'Alex Kim' }}
        />
      );
    case 'AiChatEmptyState':
      return <AiChatEmptyState {...shared} />;
    case 'AiPromptInput':
      return (
        <AiPromptInput
          {...shared}
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue('')}
        />
      );
    case 'AiRequestTrail':
      return (
        <AiRequestTrail
          {...shared}
          items={checked ? [{ id: 'one', label: 'Filter rows' }] : []}
          onRemove={() => setChecked(false)}
        />
      );
    case 'AiResultView':
      return (
        <AiResultView
          {...shared}
          result={{ kind: 'text', title: 'Result', text: 'Example result' }}
        />
      );
    case 'FieldLibrary':
      return (
        <FieldLibrary {...shared} title="Available fields">
          Name
        </FieldLibrary>
      );
    case 'FieldLibraryList':
      return <FieldLibraryList {...shared}>Name</FieldLibraryList>;
    case 'FieldRemoveIcon':
      return <FieldRemoveIcon {...shared} />;
    case 'FieldRow':
      return (
        <ul>
          <FieldRow {...shared}>Name</FieldRow>
        </ul>
      );
    case 'FieldSummary':
      return (
        <details>
          <FieldSummary {...shared}>Fields</FieldSummary>
          <p>Content</p>
        </details>
      );
    case 'SvgIcon':
      return (
        <SvgIcon
          {...shared}
          svg={'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /></svg>'}
        />
      );
    case 'CalendarDay':
      return (
        <div role="grid" aria-label="Calendar">
          <div role="row">
            <CalendarDay
              {...shared}
              date="2026-11-20"
              label="November 20"
              outside={false}
              hidden={false}
              disabled={false}
              focused
              selected={checked}
              previewed={false}
              rangeStart={false}
              rangeEnd={false}
              previewStart={false}
              previewEnd={false}
              today={false}
              setRef={() => {}}
              onFocus={() => {}}
              onPreview={() => {}}
              onKeyDown={() => {}}
              onSelect={() => setChecked(!checked)}
            />
          </div>
        </div>
      );
    case 'CalendarHeader':
      return (
        <CalendarHeader
          {...shared}
          label={`Month ${number}`}
          previousLabel="Previous"
          nextLabel="Next"
          onPrevious={() => setNumber(number - 1)}
          onNext={() => setNumber(number + 1)}
        />
      );
    case 'CalendarWeekdays':
      return (
        <div role="grid" aria-label="Calendar">
          <CalendarWeekdays
            {...shared}
            dates={['2026-11-16', '2026-11-17']}
            locale="en"
            format={(date) => (date.endsWith('16') ? 'Mon' : 'Tue')}
          />
        </div>
      );
    case 'DisclosureSummary':
      return (
        <details>
          <DisclosureSummary {...shared}>Details</DisclosureSummary>
          <p>Content</p>
        </details>
      );
    case 'EditorPane':
      return (
        <EditorPane {...shared}>
          <div class="theme-pane-sample-content">Pane content</div>
        </EditorPane>
      );
    case 'EditorSplitLayout':
      return (
        <EditorSplitLayout {...shared}>
          <EditorPane>
            <div class="theme-pane-sample-content">Pane content</div>
          </EditorPane>
        </EditorSplitLayout>
      );
    case 'EditorList':
      return (
        <EditorList {...shared} label="Options" onSelect={setValue}>
          <EditorListItem
            value="one"
            selected={value === 'one'}
            label="First"
          />
          <EditorListItem
            value="two"
            selected={value === 'two'}
            label="Second"
          />
        </EditorList>
      );
    case 'EditorListGroup':
      return (
        <EditorList label="Options" onSelect={setValue}>
          <EditorListGroup {...shared} label="Group">
            <EditorListItem value="one" selected label="First" />
          </EditorListGroup>
        </EditorList>
      );
    case 'EditorListItem':
      return (
        <EditorList label="Options" onSelect={() => setChecked(!checked)}>
          <EditorListItem
            {...shared}
            value="one"
            selected={checked}
            label="First"
          />
        </EditorList>
      );
    case 'EditorListItemContent':
      return (
        <EditorListItemContent
          {...shared}
          label="First"
          description="Details"
        />
      );
    case 'Input':
      return (
        <Input
          {...shared}
          aria-label="Input"
          value={value}
          onInput={(event) => setValue(event.currentTarget.value)}
        />
      );
    case 'DialogActions':
      return (
        <DialogActions {...shared}>
          <Button>Save</Button>
        </DialogActions>
      );
    case 'DialogBody':
      return <DialogBody {...shared}>Dialog content</DialogBody>;
    case 'DialogCloseButton':
      return <DialogCloseButton {...shared} aria-label="Close" />;
    case 'DialogFooter':
      return <DialogFooter {...shared}>Dialog footer</DialogFooter>;
    case 'DialogHeader':
      return <DialogHeader {...shared}>Dialog title</DialogHeader>;
    case 'DialogTitleInput':
      return (
        <DialogTitleInput
          {...shared}
          aria-label="Title"
          value={value}
          onInput={(event) => setValue(event.currentTarget.value)}
        />
      );
    case 'FilterBadge':
      return <FilterBadge {...shared} label="Active filter" />;
    case 'FilterBadgeInfoButton':
      return (
        <FilterBadgeInfoButton
          {...shared}
          aria-label="Filter details"
          data-tooltip="Filter details"
        />
      );
    case 'FilterChip':
      return (
        <FilterChip
          {...shared}
          removeLabel="Remove filter"
          onRemove={() => setChecked(!checked)}
        >
          Active filter
        </FilterChip>
      );
    case 'ChoiceChips':
      return (
        <ChoiceChips
          {...shared}
          ariaLabel="Choices"
          value={value}
          options={options}
          onChange={setValue}
        />
      );
    case 'NumberStepper':
      return (
        <NumberStepper
          {...shared}
          value={number}
          onChange={setNumber}
          label="Quantity"
          decreaseLabel="Decrease"
          increaseLabel="Increase"
        />
      );
    case 'SearchInput':
      return (
        <SearchInput
          {...shared}
          aria-label="Search"
          value={value}
          onValueChange={setValue}
        />
      );
    case 'SegmentedControl':
      return (
        <SegmentedControl
          {...shared}
          ariaLabel="Options"
          value={value}
          options={options}
          onChange={setValue}
        />
      );
    case 'SegmentedSwitch':
      return (
        <SegmentedSwitch
          {...shared}
          ariaLabel="Options"
          value={value}
          options={options}
          onChange={setValue}
        />
      );
    case 'Tabs':
      return (
        <Tabs
          {...shared}
          ariaLabel="Options"
          value={value}
          options={options}
          onChange={setValue}
        />
      );
    case 'Chip':
      return <Chip {...shared}>Active</Chip>;
    case 'ChoiceChip':
      return (
        <ChoiceChip
          {...shared}
          selected={checked}
          onSelect={() => setChecked(!checked)}
        >
          Option
        </ChoiceChip>
      );
    case 'ChoiceChipInfoButton':
      return (
        <ChoiceChipInfoButton
          {...shared}
          aria-label="More information"
          data-tooltip="More information"
        />
      );
    case 'RemoveButton':
      return <RemoveButton {...shared} onClick={() => setChecked(!checked)} />;
    case 'FieldGroupHeading':
      return <FieldGroupHeading {...shared}>Fields</FieldGroupHeading>;
    case 'FieldHint':
      return <FieldHint {...shared}>Helpful information</FieldHint>;
    case 'Legend':
      return (
        <Legend
          {...shared}
          label="Legend"
          items={[{ id: 'selected', label: 'Selected', tone: 'selected' }]}
        />
      );
    case 'Panel':
      return (
        <Panel {...shared} label="Panel">
          Panel content
        </Panel>
      );
    case 'RatingChoice':
      return (
        <RatingChoice
          {...shared}
          filled={checked}
          selected={checked}
          label="One star"
          onClick={() => setChecked(!checked)}
        />
      );
    case 'RatingStar':
      return <RatingStar {...shared} filled />;
    case 'Alert':
      return (
        <Alert {...shared} title="Saved">
          Your changes are ready.
        </Alert>
      );
    case 'Badge':
      return <Badge {...shared}>Active</Badge>;
    case 'Button':
      return <Button {...shared}>Save</Button>;
    case 'Checkbox':
      return (
        <Checkbox
          {...shared}
          label="Enabled"
          checked={checked}
          onChange={setChecked}
        />
      );
    case 'CircularProgress':
      return <CircularProgress {...shared} label="Progress" value={65} />;
    case 'Dropdown':
      return (
        <Dropdown
          {...shared}
          source={[
            { label: 'First', value: 'one' },
            { label: 'Second', value: 'two' },
          ]}
          value={value}
          onChange={(next) => setValue(String(next))}
          config={{ ariaLabel: 'Choose an option' }}
        />
      );
    case 'ProgressBar':
      return <ProgressBar {...shared} value={65} ariaLabel="Progress" />;
    case 'RadioGroup':
      return (
        <RadioGroup
          {...shared}
          label="Options"
          value={value}
          options={[
            { label: 'First', value: 'one' },
            { label: 'Second', value: 'two' },
          ]}
          onChange={setValue}
        />
      );
    case 'Switch':
      return (
        <Switch
          {...shared}
          label="Enabled"
          checked={checked}
          onChange={setChecked}
        />
      );
    case 'TextInput':
      return (
        <TextInput
          {...shared}
          aria-label="Text"
          value={value}
          onValueChange={setValue}
        />
      );
    case 'Textarea':
      return (
        <Textarea
          {...shared}
          aria-label="Text"
          value={value}
          onValueChange={setValue}
        />
      );
    case 'ToggleButton':
      return (
        <ToggleButton
          {...shared}
          pressed={checked}
          onPressedChange={setChecked}
        >
          Pinned
        </ToggleButton>
      );
    default:
      return null;
  }
}

export function ThemeSamples({ preview }: { preview: ThemePreview }) {
  if (!hasThemeSample(preview.component)) return null;
  return (
    <div class="theme-samples">
      <div>
        <span>Customized</span>
        <Sample
          key={`${preview.component}-custom`}
          name={preview.component}
          preset={preview.preset}
        />
      </div>
    </div>
  );
}
