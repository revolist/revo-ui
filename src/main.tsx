import { ApiPage } from './api-page';
import { componentHref, pageKind, redirectLegacyRoute } from './routing';
import { MemberDropdown } from './home-planning';
import { FrameworksPage } from './frameworks';
import { Select } from '@revolist/ui/select';
import { TimePickerExamples } from './time-picker';
import { PdfViewerExamples } from './pdf-viewer';
import { DateTimeField } from '@revolist/ui/date-time';
import { SharedEditorExamples } from './shared-editors';
import { RichTextEditorExample } from './rich-text';
import { ColorsExamples } from './colors';
import { AiExamples } from './ai';
import { AiChatExample } from './ai-chat';
import { AiResultsExample } from './ai-results';
import { ActivityMessage } from '@revolist/ui/activity-message';
import { SelectionListExamples } from './selection-list';
import { DialogCompositionExamples } from './dialog-composition';
import { SvgButton } from '@revolist/ui/buttons/svg-button';
import { SvgIcon } from '@revolist/ui/icons/icon';
import alertCheckIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-check.svg?raw';
import alertWarningIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-exclamation.svg?raw';
import plusIcon from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw';
import { SliderLayoutExamples, TimelineTrackExample } from './sliders';
import { CalendarExamples } from './calendars';
import { Legend } from '@revolist/ui/legend';
import { FormattingExamples } from './formatting';
import {PaginationExamples} from './pagination';
import { FieldConfiguratorExamples } from './field-configurator';
import { ResizeExample } from './resize-example';
import {
  ChartExamples,
  OptionRowsExample,
  ChoiceChipFilterVariants,
  TimeGridExample,
  HighlightedInputExample,
  InlineFieldsExample,
} from './filter-controls';
import { h, render } from 'preact';
import { CatalogShell, Section, Example } from './catalog';
import undoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-left.svg?raw';
import redoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-right.svg?raw';
import exportIcon from '@fortawesome/fontawesome-free/svgs/solid/file-export.svg?raw';
import { useState } from 'preact/hooks';
import { DRAWING_TOOL_PATHS } from '@revolist/ui/native';
import {
  Button,
  IconButton,
  ToggleButton,
  ButtonGroup,
  Checkbox,
  Switch,
  RadioGroup,
  ChoiceChips,
  Tabs,
  TabPanel,
  TextInput,
  Textarea,
  SearchInput,
  NumberInput,
  NumberStepper,
  Combobox,
  MultiSelect,
  SingleValueSlider as Slider,
  PreactRangeSlider as RangeSlider,
  Calendar,
  DatePicker,
  DateRangePicker,
  ColorPicker,
  ColorPalette,
  Avatar,
  SharedResourcePicker as ResourcePicker,
  FormField,
  FieldError,
  FieldHint,
  FormSection,
  Dialog,
  ConfirmDialog,
  Popover,
  Tooltip,
  Menu,
  MenuItem,
  MenuSeparator,
  Submenu,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  Badge,
  CountBadge,
  StatusBadge,
  StatusFeedbackPanel as FeedbackPanel,
  Alert,
  Spinner,
  LoadingOverlay,
  EmptyState,
  Panel,
  ProgressBar,
  CircularProgress,
  Rating,
} from '@revolist/ui/preact';
import {
  renderScalarSlider,
} from '@revolist/ui/native';
import type { CalendarDateRange } from '@revolist/ui/calendar/types';
import type { ISODateString } from '@revolist/dates';
import '@revolist/ui/styles.scss';
import './style.css';

const icon =
  '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7 1h2v6h6v2H9v6H7V9H1V7h6z"/></svg>';
const options = [
  { value: 'table', label: 'Table' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar', disabled: true },
];
const resources = [
  { id: 1, name: 'Morgan Lee', role: 'Designer' },
  { id: 2, name: 'Alex Chen', role: 'Engineer' },
];
function App() {
  const [theme, setTheme] = useState('light'),
    [rtl, setRtl] = useState(false);
  const [togglePressed, setTogglePressed] = useState(true);
  const [selected, setSelected] = useState(true);
  const [mixed, setMixed] = useState<boolean | 'mixed'>('mixed');
  const [notifications, setNotifications] = useState(true);
  const [radioView, setRadioView] = useState('table');
  const [chipView, setChipView] = useState('table');
  const [tabView, setTabView] = useState('table');
  const [selectView, setSelectView] = useState('table');
  const [selectedPerson, setSelectedPerson] = useState('alex');
  const [comboView, setComboView] = useState('table');
  const [multiViews, setMultiViews] = useState(['table']);
  const [dialogView, setDialogView] = useState('table');
  const [projectName, setProjectName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [quantity, setQuantity] = useState(35);
  const [priority, setPriority] = useState(2);
  const [opacity, setOpacity] = useState(35);
  const [nativeSlider, setNativeSlider] = useState(35);
  const [rating, setRating] = useState(3);
  const [range, setRange] = useState({ fromValue: 20, toValue: 80 });
  const [calendarDate, setCalendarDate] = useState<ISODateString>('2026-10-24');
  const [dueDate, setDueDate] = useState<ISODateString>('2026-10-24');
  const [fieldDate, setFieldDate] = useState('2026-10-24');
  const [fieldTime, setFieldTime] = useState('09:00');
  const [fieldDateTime, setFieldDateTime] = useState('2026-10-24T09:00');
  const [secondDate, setSecondDate] = useState<ISODateString>('2026-10-24');
  const [dateRange, setDateRange] = useState<CalendarDateRange>({
    from: '2026-10-20',
    to: '2026-10-24',
  });
  const [month, setMonth] = useState<ISODateString>('2026-10-01');
  const [focused, setFocused] = useState<ISODateString>('2026-10-24');
  const [pickerColor, setPickerColor] = useState<string | undefined>('#2563eb');
  const [paletteColor, setPaletteColor] = useState<string | null>('#2563eb');
  const [people, setPeople] = useState<readonly number[]>([1]);
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [popover, setPopover] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [history, setHistory] = useState({ undo: 3, redo: 0 });
  const [menuAction, setMenuAction] = useState('None');
  const [toolbarAction, setToolbarAction] = useState('None');
  const [drawingTool, setDrawingTool] = useState('select');
  const [confirmation, setConfirmation] = useState('No confirmation yet');
  const [busyButtons, setBusyButtons] = useState(true);
  const [buttonAction, setButtonAction] = useState('No action yet');
  const [groupAction, setGroupAction] = useState('No action yet');
  const [addedCount, setAddedCount] = useState(0);
  if (pageKind() === 'api') return <CatalogShell page="api" theme={theme} rtl={rtl} onThemeChange={setTheme} onRtlChange={setRtl}><ApiPage /></CatalogShell>;
  if (pageKind() === 'frameworks') {
    return <CatalogShell page="frameworks" theme={theme} rtl={rtl} onThemeChange={setTheme} onRtlChange={setRtl}><FrameworksPage /></CatalogShell>;
  }
  if (pageKind() === 'colors') {
    return (
      <CatalogShell page="colors" theme={theme} rtl={rtl} onThemeChange={setTheme} onRtlChange={setRtl}>
        <section id="colors" class="catalog-section" aria-labelledby="colors-title">
          <div class="catalog-section-heading"><div><h1 id="colors-title">Colors</h1><p>Semantic interface colors and usage across every product.</p></div></div>
          <ColorsExamples />
        </section>
      </CatalogShell>
    );
  }
  return (
    <CatalogShell
      theme={theme}
      rtl={rtl}
      onThemeChange={setTheme}
      onRtlChange={setRtl}
    >
      <Section title="Buttons">

        <Example title="Button variants">
          <div class="catalog-row">
            <Button variant="solid" onClick={() => setButtonAction('Solid clicked')}>Solid</Button>
            <SvgButton variant="solid" label="Add task" icon={plusIcon} onClick={() => setButtonAction('Add task clicked')} />
            <Button
              variant="primary"
              onClick={() => setButtonAction('Primary clicked')}
            >
              Primary <span aria-hidden="true">→</span>
            </Button>
            <Button onClick={() => setButtonAction('Outline clicked')}>
              Outline
            </Button>
            <Button
              variant="ghost"
              onClick={() => setButtonAction('Ghost clicked')}
            >
              Ghost
            </Button>
            <Button
              variant="danger"
              onClick={() => setButtonAction('Delete clicked')}
            >
              Delete
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="link" onClick={() => setButtonAction('Link clicked')}>Link action</Button>
            <SvgButton variant="link" label="Add item" visibleLabel="Add item" icon={plusIcon} onClick={() => setButtonAction('Add item clicked')} />
            <Button variant="link" disabled>Disabled link</Button>

            <Button
              size="compact"
              onClick={() => setButtonAction('Compact clicked')}
            >
              Compact
            </Button>
          </div>
          <output aria-label="Button action">{buttonAction}</output>
        </Example>
        <Example title="Rounded buttons">
          <div class="catalog-row">
            <Button rounded variant="solid">Solid pill</Button>
            <Button rounded variant="primary">Primary pill</Button>
            <Button rounded>Outline pill</Button>
            <Button rounded variant="ghost">Ghost pill</Button>
            <Button rounded variant="danger">Danger pill</Button>
            <Button rounded size="compact">Compact pill</Button>
            <Button rounded disabled>Disabled pill</Button>
            <Button rounded href={componentHref('sliders')}>Browse sliders</Button>
          </div>
        </Example>
        <Example title="Busy buttons">
          <div class="catalog-row">
            <Button variant="primary" busy={busyButtons} onClick={() => setButtonAction('Busy action clicked')}>Save changes</Button>
            <Button busy={busyButtons} onClick={() => setButtonAction('Busy outline clicked')}>Upload file</Button>
            <IconButton label="Sync items" icon={icon} busy={busyButtons} onClick={() => setButtonAction('Busy icon clicked')} />
            <ToggleButton busy={busyButtons} pressed={togglePressed} onPressedChange={setTogglePressed}>Busy toggle</ToggleButton>
          </div>
          <ToggleButton pressed={busyButtons} onPressedChange={setBusyButtons}>Busy state</ToggleButton>
        </Example>
        <Example title="Icon button">
          <IconButton
            label="Add item"
            icon={icon}
            onClick={() => setAddedCount((count) => count + 1)}
          />
          <output aria-label="Items added">{addedCount} items added</output>
        </Example>
        <Example title="Button group">
          <ButtonGroup label="Grouped actions">
            <Button onClick={() => setGroupAction('First selected')}>
              First
            </Button>
            <Button onClick={() => setGroupAction('Second selected')}>
              Second
            </Button>
          </ButtonGroup>
          <output aria-label="Grouped action">{groupAction}</output>
        </Example>
        <Example title="Toggle button">
          <ToggleButton
            pressed={togglePressed}
            onPressedChange={setTogglePressed}
          >
            Toggle
          </ToggleButton>
        </Example>
      </Section>
      <Section title="Selection controls">
        <Example title="Checkboxes">
          <Checkbox
            label="Selection"
            checked={selected}
            onChange={setSelected}
          />
          <Checkbox
            label="Mixed selection"
            checked={mixed === true}
            indeterminate={mixed === 'mixed'}
            onChange={setMixed}
          />
          <Checkbox label="Disabled checkbox" checked disabled />
        </Example>
        <Example title="Switches">
          <Switch
            label="Enable notifications"
            checked={notifications}
            onChange={setNotifications}
          />
          <Switch
            label="Disabled switch"
            checked
            disabled
            onChange={() => {}}
          />
        </Example>
        <Example title="Radio choices">
          <RadioGroup
            label="View"
            value={radioView}
            options={options}
            onChange={setRadioView}
          />
        </Example>
        <Example title="Choice chips">
          <ChoiceChips
            ariaLabel="View choices"
            value={chipView}
            options={options}
            onChange={setChipView}
          />
          <ChoiceChipFilterVariants />
        </Example>
        <OptionRowsExample />
      </Section>
      <Section title="Tabs and lists">
        <Example title="Segmented tabs">
          <Tabs
            ariaLabel="Editor tabs"
            value={tabView}
            options={options.map((option) => ({
              ...option,
              id: `tab-${option.value}`,
              ariaControls: `panel-${option.value}`,
            }))}
            onChange={setTabView}
          />
          {options.map((option) => (
            <TabPanel
              id={`panel-${option.value}`}
              labelledBy={`tab-${option.value}`}
              active={tabView === option.value}
            >
              {option.label} content
            </TabPanel>
          ))}
        </Example>
        <SelectionListExamples />
      </Section>
      <Section title="Inputs and forms">
        <Example title="Text input">
          <FormField label="Project name" hint="A short descriptive name">
            <TextInput
              value={projectName}
              onValueChange={setProjectName}
              placeholder="Project name"
            />
          </FormField>
        </Example>
        <Example title="Message">
          <FormField label="Description">
            <Textarea
              aria-label="Quick message"
              placeholder="Message"
              rows={3}
            />
          </FormField>
        </Example>
        <Example title="Search input">
          <SearchInput
            value={searchText}
            onInput={(event) => setSearchText(event.currentTarget.value)}
            placeholder="Search"
            aria-label="Search catalog"
          />
        </Example>
        <Example title="Number input">
          <FormField label="Quantity">
            <NumberInput
              aria-label="Quantity"
              value={quantity}
              onValueChange={(value) => setQuantity(value ?? 0)}
            />
          </FormField>
        </Example>
        <Example title="Number stepper">
          <NumberStepper
            label="Priority"
            value={priority}
            min={0}
            max={100}
            onChange={setPriority}
            decreaseLabel="Decrease priority"
            increaseLabel="Increase priority"
          />
        </Example>
        <Example title="Form fields and validation">
          <FormSection
            title="Details"
            description="Labels and hints remain associated with their inputs."
          >
            <FormField label="Read only">
              <TextInput
                aria-label="Read only example"
                value="Read only"
                readOnly
              />
            </FormField>
            <FormField label="Invalid input">
              <TextInput
                aria-label="Invalid example"
                aria-invalid="true"
                aria-describedby="example-error"
              />
              <FieldError id="example-error">Enter a project name.</FieldError>
            </FormField>
          </FormSection>
        </Example>
        <HighlightedInputExample />
        <InlineFieldsExample />
      </Section>
      <Section title="Selects, chips and resources">
        <Example title="Select">
          <Select aria-label="View" value={selectView} onValueChange={setSelectView}>
            {options.map(option => <option value={option.value} disabled={option.disabled}>{option.label}</option>)}
          </Select>
        </Example>
        <Example title="User select with images">
          <MemberDropdown label="Choose a team member" value={selectedPerson} onChange={setSelectedPerson} />
        </Example>
        <Example title="Searchable select">
          <Combobox
            source={options}
            value={comboView}
            onChange={(next) =>
              setComboView(Array.isArray(next) ? next[0] : next)
            }
            config={{ ariaLabel: 'Searchable view' }}
          />
        </Example>
        <Example title="Multiple selection">
          <MultiSelect
            source={options}
            value={multiViews}
            onChange={(values) =>
              setMultiViews(Array.isArray(values) ? values : [values])
            }
            config={{ ariaLabel: 'Multiple views' }}
          />
        </Example>
        <Example title="Avatar">
          <Avatar value="Morgan Lee" label="Morgan Lee" />
        </Example>
        <Example title="Resource selection">
          <ResourcePicker
            resources={resources}
            selectedResourceIds={people}
            onChange={setPeople}
            text={{
              groupAriaLabel: 'Assignees',
              searchPlaceholder: 'Search people',
              searchAriaLabel: 'Search people',
              emptyResources: 'No resources',
              emptySearch: 'No matches',
            }}
          />
        </Example>
      </Section>
      <Section title="Timeline track">
        <TimelineTrackExample />
      </Section>
      <Section title="Sliders">
        <SliderLayoutExamples />
        <Example title="Scalar slider">
          <FormField label="Opacity">
            <Slider
              min={0}
              max={100}
              value={opacity}
              ariaLabel="Opacity"
              onChange={setOpacity}
            />
          </FormField>
        </Example>
        <Example title="Range slider">
          <RangeSlider
            min={0}
            max={100}
            {...range}
            showRangeInputs
            showRangeDisplay
            fromAriaLabel="Minimum amount"
            toAriaLabel="Maximum amount"
            onRangeChange={setRange}
          />
        </Example>
        <Example title="Disabled slider">
          <Slider
            min={0}
            max={100}
            value={50}
            ariaLabel="Disabled slider"
            disabled
            onChange={() => {}}
          />
        </Example>
        <Example title="Native slider">
          {renderScalarSlider(h, {
            min: 0,
            max: 100,
            step: 1,
            value: nativeSlider,
            label: 'Compact slider',
            onChange: setNativeSlider,
          })}
        </Example>
      </Section>
      <Section title="Field configurators" columns={2}>
        <FieldConfiguratorExamples />
      </Section>
      <Section title="Activity messages">
        <Example title="Chat-style activity">
          <ActivityMessage avatar={<Avatar value="https://i.pravatar.cc/96?img=9" initials="PS" label="Priya Shah" />}
            timestamp={<time dateTime="2026-10-25T16:01:00">4:01 PM</time>}
            header={<><strong>Priya Shah</strong> updated the owner</>}
            actions={<Button variant="link">View change ↗</Button>}>
            <p>Portfolio ownership transferred to Sam Carter.</p>
          </ActivityMessage>
        </Example>
      </Section>
      <Section title="Formatting controls"><FormattingExamples /></Section>
      <Section title="Charts and range selection">
        <ChartExamples />
      </Section>
      <Section title="Calendar and dates">
        <Example title="Calendar">
          <Calendar
            month={month}
            focusedDate={focused}
            referenceDate="2026-10-24"
            selection={{ from: calendarDate, to: calendarDate }}
            onMonthChange={setMonth}
            onFocusedDateChange={setFocused}
            onSelect={setCalendarDate}
          />
        </Example>
        <Example title="Legend">
          <Legend label="Calendar legend" items={[
            { id: 'working', label: 'Working day', marker: 'outline' },
            { id: 'closed', label: 'Non-working', color: 'var(--rv-ui-text-muted)' },
            { id: 'exception', label: 'Exception', tone: 'selected' },
            { id: 'inherited', label: 'Inherited', marker: 'dashed' },
          ]} />
        </Example>
        <CalendarExamples />
        <SharedEditorExamples />
        <Example title="Date pickers">
          <DatePicker
            label="Due date"
            openLabel="Choose due date"
            value={dueDate}
            onChange={(next) => {
              if (next) setDueDate(next);
            }}
          />
          <DatePicker
            label="Second date"
            openLabel="Choose second date"
            value={secondDate}
            onChange={(next) => {
              if (next) setSecondDate(next);
            }}
          />
        </Example>
        <Example title="Date range" wide>
          <DateRangePicker
            label="Project dates"
            fromLabel="Start date"
            toLabel="Finish date"
            openLabel="Choose date range"
            value={dateRange}
            onChange={setDateRange}
          />
        </Example>
        <Example title="Date and time fields">
          <DateTimeField aria-label="Date field" value={fieldDate} onValueChange={setFieldDate}
            picker={{ text: { chooseDate: 'Choose field date' } }} />
          <DateTimeField aria-label="Time field" kind="time" value={fieldTime} onValueChange={setFieldTime}
            picker={{ timeFormat: '24h', text: { chooseTime: 'Choose field time' } }} />
          <DateTimeField aria-label="Date and time field" kind="datetime" value={fieldDateTime} onValueChange={setFieldDateTime}
            picker={{ timeFormat: '24h', text: { chooseDate: 'Choose field date and time' } }} />
        </Example>
        <TimePickerExamples />
        <TimeGridExample />
      </Section>
      <Section title="Color">
        <Example title="Color picker">
          <ColorPicker
            label="Accent"
            value={pickerColor}
            defaultLabel="Default"
            customLabel="Custom color"
            customHexLabel="Hex color"
            invalidColor="Enter a valid hex color"
            colorLabels={{}}
            onChange={setPickerColor}
          />
        </Example>
        <Example title="Color palette" wide>
          <ColorPalette
            value={paletteColor}
            ariaLabel="Color swatches"
            defaultLabel="Default"
            colorAriaLabel={(option) => option.label}
            onChange={setPaletteColor}
          />
        </Example>
      </Section>
      <Section title="Dialogs and floating surfaces">
        <DialogCompositionExamples />
        <Example title="Dialog, confirmation and popover triggers" wide>
          <div class="catalog-row">
            <Button onClick={() => setDialog(true)}>Open dialog</Button>
            <Button onClick={() => setConfirm(true)}>Confirm action</Button>
            <Button
              ref={setAnchor}
              onClick={() => setPopover(!popover)}
              aria-expanded={popover}
            >
              Open popover
            </Button>
          </div>
          <output aria-label="Confirmation result">{confirmation}</output>
        </Example>
        <Popover
          open={popover}
          anchor={anchor}
          onClose={() => setPopover(false)}
          label="Quick settings"
        >
          <TextInput aria-label="Popover input" placeholder="Quick setting" />
        </Popover>
        <Example title="Tooltip">
          <Tooltip text="Keyboard and pointer tooltip">
            <Button>Tooltip trigger</Button>
          </Tooltip>
        </Example>
        <Dialog
          open={dialog}
          title="Edit project"
          closeLabel="Close editor"
          onClose={() => setDialog(false)}
          footer={<Button onClick={() => setDialog(false)}>Save</Button>}
        >
          <FormField label="Dialog name">
            <TextInput placeholder="Name" />
          </FormField>
          <Combobox
            source={options}
            value={dialogView}
            onChange={(next) =>
              setDialogView(Array.isArray(next) ? next[0] : next)
            }
            config={{ ariaLabel: 'Dialog view', topLayer: true }}
          />
          <Button onClick={() => setConfirm(true)}>
            Open nested confirmation
          </Button>
        </Dialog>
        <ConfirmDialog
          open={confirm}
          title="Confirm changes"
          closeLabel="Close confirmation"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setConfirmation('Confirmed');
            setConfirm(false);
          }}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
        >
          Apply the selected changes?
        </ConfirmDialog>
      </Section>
      <Section title="Menus and toolbars">
        <Example title="Drawing toolbar">
          <Toolbar label="Drawing tools" className="rv-toolbar--surface">
            {(['select', 'rectangle', 'line', 'arrow', 'note'] as const).map(tool => (
              <IconButton key={tool} label={tool === 'select' ? 'Select tool' : `${tool[0].toUpperCase()}${tool.slice(1)} tool`}
                aria-pressed={drawingTool === tool}
                icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${DRAWING_TOOL_PATHS[tool]}"/></svg>`}
                onClick={() => setDrawingTool(tool)} />
            ))}
          </Toolbar>
          <FieldHint>Choose a drawing tool. Drawing behavior stays in Charts.</FieldHint>
          <div class="catalog-row"><IconButton label="Drawing unavailable" disabled icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${DRAWING_TOOL_PATHS.rectangle}"/></svg>`} /><FieldHint>Drawing unavailable</FieldHint></div>
        </Example>
        <Example title="Document toolbar">
          <Toolbar label="Document actions">
            <ToolbarGroup label="History">
              <IconButton
                label="Undo"
                icon={undoIcon}
                badge={history.undo}
                disabled={!history.undo}
                onClick={() =>
                  setHistory(({ undo, redo }) => ({
                    undo: undo - 1,
                    redo: redo + 1,
                  }))
                }
              />
              <IconButton
                label="Redo"
                icon={redoIcon}
                badge={history.redo}
                disabled={!history.redo}
                onClick={() =>
                  setHistory(({ undo, redo }) => ({
                    undo: undo + 1,
                    redo: redo - 1,
                  }))
                }
              />
            </ToolbarGroup>
            <ToolbarSeparator />
            <IconButton
              label="Export"
              icon={exportIcon}
              onClick={() => setToolbarAction('Export requested')}
            />
          </Toolbar>
          <FieldHint>History badges show available steps.</FieldHint>
          <output aria-label="Toolbar action">{toolbarAction}</output>
        </Example>
        <Example title="Menu and submenu">
          <Menu label="Example menu" onClose={() => setMenuAction('Closed')}>
            <MenuItem onClick={() => setMenuAction('Open')}>Open</MenuItem>
            <MenuItem disabled>Unavailable</MenuItem>
            <MenuSeparator />
            <Submenu label="More actions">
              <MenuItem onClick={() => setMenuAction('Duplicate')}>
                Duplicate
              </MenuItem>
            </Submenu>
          </Menu>
          <output aria-label="Last action" aria-live="polite">
            {menuAction}
          </output>
        </Example>
      </Section>
      <Section title="Status and feedback">
        <Example title="Badges">
          <Badge>Draft</Badge>
          <CountBadge count={12} label="12 tasks" />
          <StatusBadge tone="warning" label="Needs attention" />
        </Example>
        <Example title="Alerts">
          <Alert tone="success" icon={<SvgIcon svg={alertCheckIcon} />}>Changes saved</Alert>
          <Alert tone="danger" icon={<SvgIcon svg={alertWarningIcon} />}
            title="A value needs attention"
            description="Review the highlighted field and try again."
          />
        </Example>
        <Example title="Activity panel">
          <FeedbackPanel
            title="Activity"
            ariaLabel="Activity"
            items={[{ id: 'saved', title: 'Project saved', tone: 'success' }]}
          />
        </Example>
        <Example title="Spinner">
          <Spinner label="Loading preview" />
        </Example>
        <Example title="Loading overlay">
          <LoadingOverlay busy label="Loading content">
            <Panel>Loading content placeholder</Panel>
          </LoadingOverlay>
        </Example>
        <Example title="Empty state">
          <EmptyState
            title="No results"
            description="Try changing your filters."
          />
        </Example>
      </Section>
      <Section title="Layout">
        <Example title="Split panes" wide>
          <ResizeExample rtl={rtl} />
        </Example>
      </Section>
      <Section title="Pagination"><PaginationExamples /></Section>
      <Section title="Progress and rating">
        <Example title="Progress bar">
          <ProgressBar value={35} ariaLabel="Completion" />
        </Example>
        <Example title="Circular progress">
          <CircularProgress value={35} label="Circular completion" />
        </Example>
        <Example title="Read only rating">
          <Rating label="Quality" value={3} />
        </Example>
        <Example title="Interactive rating">
          <Rating
            label="Interactive quality"
            value={rating}
            onChange={setRating}
          />
        </Example>
      </Section>
      <Section title="HTML Editor" columns={1}><RichTextEditorExample /></Section>
      <Section title="PDF viewer" columns={1}><PdfViewerExamples /></Section>
      <Section title="AI assistant"><AiExamples /><AiChatExample /><AiResultsExample /></Section>
    </CatalogShell>
  );
}
redirectLegacyRoute();
const appRoot = document.getElementById('app')!;
// The production homepage is pre-rendered; replace it before attaching live controls.
appRoot.replaceChildren();
render(<App />, appRoot);
