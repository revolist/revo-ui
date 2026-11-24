import { CalendarNavigatorExample, AppearanceConfiguratorExample, SearchActionBarExample, MetricPanelExample, NativePresentationExamples } from './shared-control-examples';
import { ReleaseTimelineExample } from './release-timeline-example';
import { ToastExamples } from './toast-examples';
import { CircularSliderExamples } from './circular-slider-examples';
import { CursorExamples } from './cursor-examples';
import {
  ActionBarExamples,
  BackupHistoryExamples,
  HistoryReviewExamples,
} from './history-and-actions';
import { FileTree, fileTreeFromPaths } from '@revolist/ui/preact';
import { CommandPaletteExamples } from './command-palette-examples';
import { FilterBar } from '@revolist/ui/preact';
import { Cascader } from '@revolist/ui/preact';
import { Attachments } from '@revolist/ui/preact';
import { Trace } from '@revolist/ui/preact';
import { ActivityTimeline } from '@revolist/ui/preact';
import { Stepper } from '@revolist/ui/preact';
import { Tree } from '@revolist/ui/preact';
import { AutocompleteExamples } from './autocomplete';
import {
  TooltipPlacementExamples,
  TooltipTimingExamples,
  TooltipStateExamples,
  TooltipContentExamples,
  TooltipBoundaryExample,
  TooltipControllerExample,
} from './tooltips';
import { CollapsibleSection as __themeOriginal_CollapsibleSection } from '@revolist/ui/preact';
import { AccessibilityPage } from './accessibility';
import { ApiPage } from './api-page';
import { componentHref, pageKind, redirectLegacyRoute } from './routing';
import { MemberDropdown } from './home-planning';
import { FrameworksPage } from './frameworks';
import { Select as __themeOriginal_Select } from '@revolist/ui/select';
import { TimePickerExamples } from './time-picker';
import { PdfViewerExamples } from './pdf-viewer';
import { DateTimeField as __themeOriginal_DateTimeField } from '@revolist/ui/date-time';
import {
  SharedEditorExamples,
  DurationEffortExample,
  RemoteLookupExample,
  AssigneeFieldExample,
} from './shared-editors';
import { RichTextEditorExample } from './rich-text';
import { CustomizePage } from './customize-page';
import { AiExamples } from './ai';
import { AiChatExample } from './ai-chat';
import { AiResultsExample } from './ai-results';
import { ActivityMessage as __themeOriginal_ActivityMessage } from '@revolist/ui/activity-message';
import { SelectionListExamples } from './selection-list';
import { DialogCompositionExamples } from './dialog-composition';
import { SvgButton as __themeOriginal_SvgButton } from '@revolist/ui/buttons/svg-button';
import { SvgIcon as __themeOriginal_SvgIcon } from '@revolist/ui/icons/icon';
import alertCheckIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-check.svg?raw';
import alertWarningIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-exclamation.svg?raw';
import plusIcon from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw';
import { SliderLayoutExamples, TimelineTrackExample } from './sliders';
import { MiniCalendarExamples } from './mini-calendar-examples';
import { CalendarExamples, DateTimeCalendarExample } from './calendars';
import { Legend as __themeOriginal_Legend } from '@revolist/ui/legend';
import { FormattingExamples } from './formatting';
import { PaginationExamples } from './pagination';
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
import { IconToolbarExample } from './icon-toolbar';
import { CatalogShell, Section, Example } from './catalog';
import undoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-left.svg?raw';
import redoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-right.svg?raw';
import exportIcon from '@fortawesome/fontawesome-free/svgs/solid/file-export.svg?raw';
import { useState } from 'preact/hooks';
import { DRAWING_TOOL_PATHS } from '@revolist/ui/native';
import {
  Button as __themeOriginal_Button,
  IconButton as __themeOriginal_IconButton,
  ToggleButton as __themeOriginal_ToggleButton,
  ButtonGroup as __themeOriginal_ButtonGroup,
  Checkbox as __themeOriginal_Checkbox,
  Switch as __themeOriginal_Switch,
  RadioGroup as __themeOriginal_RadioGroup,
  ChoiceChips as __themeOriginal_ChoiceChips,
  Tabs as __themeOriginal_Tabs,
  TabPanel as __themeOriginal_TabPanel,
  TextInput as __themeOriginal_TextInput,
  Textarea as __themeOriginal_Textarea,
  SearchInput as __themeOriginal_SearchInput,
  NumberInput as __themeOriginal_NumberInput,
  NumberStepper as __themeOriginal_NumberStepper,
  Combobox as __themeOriginal_Combobox,
  MultiSelect as __themeOriginal_MultiSelect,
  SingleValueSlider as __themeOriginal_SingleValueSlider,
  PreactRangeSlider as __themeOriginal_PreactRangeSlider,
  Calendar as __themeOriginal_Calendar,
  DatePicker as __themeOriginal_DatePicker,
  DateRangePicker as __themeOriginal_DateRangePicker,
  ColorPicker as __themeOriginal_ColorPicker,
  ColorPalette as __themeOriginal_ColorPalette,
  Avatar as __themeOriginal_Avatar,
  SharedResourcePicker as __themeOriginal_SharedResourcePicker,
  FormField as __themeOriginal_FormField,
  FieldError as __themeOriginal_FieldError,
  FieldHint as __themeOriginal_FieldHint,
  FormSection as __themeOriginal_FormSection,
  Dialog as __themeOriginal_Dialog,
  ConfirmDialog as __themeOriginal_ConfirmDialog,
  Popover as __themeOriginal_Popover,
  Tooltip as __themeOriginal_Tooltip,
  Menu as __themeOriginal_Menu,
  MenuItem as __themeOriginal_MenuItem,
  MenuSeparator as __themeOriginal_MenuSeparator,
  Submenu as __themeOriginal_Submenu,
  Toolbar as __themeOriginal_Toolbar,
  ToolbarGroup as __themeOriginal_ToolbarGroup,
  ToolbarSeparator as __themeOriginal_ToolbarSeparator,
  Badge as __themeOriginal_Badge,
  CountBadge as __themeOriginal_CountBadge,
  StatusBadge as __themeOriginal_StatusBadge,
  StatusFeedbackPanel as __themeOriginal_StatusFeedbackPanel,
  Alert as __themeOriginal_Alert,
  Spinner as __themeOriginal_Spinner,
  LoadingOverlay as __themeOriginal_LoadingOverlay,
  EmptyState as __themeOriginal_EmptyState,
  Panel as __themeOriginal_Panel,
  ProgressBar as __themeOriginal_ProgressBar,
  CircularProgress as __themeOriginal_CircularProgress,
  Rating as __themeOriginal_Rating,
} from '@revolist/ui/preact';
import { renderScalarSlider } from '@revolist/ui/native';
import type { CalendarDateRange } from '@revolist/ui/calendar/types';
import type { ISODateString } from '@revolist/ui-dates';
import '@revolist/ui/styles.scss';
import './style.css';
import { withThemePreview } from './theme-preview';

const CollapsibleSection = withThemePreview(
  __themeOriginal_CollapsibleSection,
  'CollapsibleSection',
);
const Select = withThemePreview(__themeOriginal_Select, 'Select');
const DateTimeField = withThemePreview(
  __themeOriginal_DateTimeField,
  'DateTimeField',
);
const ActivityMessage = withThemePreview(
  __themeOriginal_ActivityMessage,
  'ActivityMessage',
);
const SvgButton = withThemePreview(__themeOriginal_SvgButton, 'SvgButton');
const SvgIcon = withThemePreview(__themeOriginal_SvgIcon, 'SvgIcon');
const Legend = withThemePreview(__themeOriginal_Legend, 'Legend');
const Button = withThemePreview(__themeOriginal_Button, 'Button');
const IconButton = withThemePreview(__themeOriginal_IconButton, 'IconButton');
const ToggleButton = withThemePreview(
  __themeOriginal_ToggleButton,
  'ToggleButton',
);
const ButtonGroup = withThemePreview(
  __themeOriginal_ButtonGroup,
  'ButtonGroup',
);
const Checkbox = withThemePreview(__themeOriginal_Checkbox, 'Checkbox');
const Switch = withThemePreview(__themeOriginal_Switch, 'Switch');
const RadioGroup = withThemePreview(__themeOriginal_RadioGroup, 'RadioGroup');
const ChoiceChips = withThemePreview(
  __themeOriginal_ChoiceChips,
  'ChoiceChips',
);
const Tabs = withThemePreview(__themeOriginal_Tabs, 'Tabs');
const TabPanel = withThemePreview(__themeOriginal_TabPanel, 'TabPanel');
const TextInput = withThemePreview(__themeOriginal_TextInput, 'TextInput');
const Textarea = withThemePreview(__themeOriginal_Textarea, 'Textarea');
const SearchInput = withThemePreview(
  __themeOriginal_SearchInput,
  'SearchInput',
);
const NumberInput = withThemePreview(
  __themeOriginal_NumberInput,
  'NumberInput',
);
const NumberStepper = withThemePreview(
  __themeOriginal_NumberStepper,
  'NumberStepper',
);
const Combobox = withThemePreview(__themeOriginal_Combobox, 'Combobox');
const MultiSelect = withThemePreview(
  __themeOriginal_MultiSelect,
  'MultiSelect',
);
const SingleValueSlider = withThemePreview(
  __themeOriginal_SingleValueSlider,
  'SingleValueSlider',
);
const PreactRangeSlider = withThemePreview(
  __themeOriginal_PreactRangeSlider,
  'PreactRangeSlider',
);
const Calendar = withThemePreview(__themeOriginal_Calendar, 'Calendar');
const DatePicker = withThemePreview(__themeOriginal_DatePicker, 'DatePicker');
const DateRangePicker = withThemePreview(
  __themeOriginal_DateRangePicker,
  'DateRangePicker',
);
const ColorPicker = withThemePreview(
  __themeOriginal_ColorPicker,
  'ColorPicker',
);
const ColorPalette = withThemePreview(
  __themeOriginal_ColorPalette,
  'ColorPalette',
);
const Avatar = withThemePreview(__themeOriginal_Avatar, 'Avatar');
const SharedResourcePicker = withThemePreview(
  __themeOriginal_SharedResourcePicker,
  'SharedResourcePicker',
);
const FormField = withThemePreview(__themeOriginal_FormField, 'FormField');
const FieldError = withThemePreview(__themeOriginal_FieldError, 'FieldError');
const FieldHint = withThemePreview(__themeOriginal_FieldHint, 'FieldHint');
const FormSection = withThemePreview(
  __themeOriginal_FormSection,
  'FormSection',
);
const Dialog = withThemePreview(__themeOriginal_Dialog, 'Dialog');
const ConfirmDialog = withThemePreview(
  __themeOriginal_ConfirmDialog,
  'ConfirmDialog',
);
const Popover = withThemePreview(__themeOriginal_Popover, 'Popover');
const Tooltip = withThemePreview(__themeOriginal_Tooltip, 'Tooltip');
const Menu = withThemePreview(__themeOriginal_Menu, 'Menu');
const MenuItem = withThemePreview(__themeOriginal_MenuItem, 'MenuItem');
const MenuSeparator = withThemePreview(
  __themeOriginal_MenuSeparator,
  'MenuSeparator',
);
const Submenu = withThemePreview(__themeOriginal_Submenu, 'Submenu');
const Toolbar = withThemePreview(__themeOriginal_Toolbar, 'Toolbar');
const ToolbarGroup = withThemePreview(
  __themeOriginal_ToolbarGroup,
  'ToolbarGroup',
);
const ToolbarSeparator = withThemePreview(
  __themeOriginal_ToolbarSeparator,
  'ToolbarSeparator',
);
const Badge = withThemePreview(__themeOriginal_Badge, 'Badge');
const CountBadge = withThemePreview(__themeOriginal_CountBadge, 'CountBadge');
const StatusBadge = withThemePreview(
  __themeOriginal_StatusBadge,
  'StatusBadge',
);
const StatusFeedbackPanel = withThemePreview(
  __themeOriginal_StatusFeedbackPanel,
  'StatusFeedbackPanel',
);
const Alert = withThemePreview(__themeOriginal_Alert, 'Alert');
const Spinner = withThemePreview(__themeOriginal_Spinner, 'Spinner');
const LoadingOverlay = withThemePreview(
  __themeOriginal_LoadingOverlay,
  'LoadingOverlay',
);
const EmptyState = withThemePreview(__themeOriginal_EmptyState, 'EmptyState');
const Panel = withThemePreview(__themeOriginal_Panel, 'Panel');
const ProgressBar = withThemePreview(
  __themeOriginal_ProgressBar,
  'ProgressBar',
);
const CircularProgress = withThemePreview(
  __themeOriginal_CircularProgress,
  'CircularProgress',
);
const Rating = withThemePreview(__themeOriginal_Rating, 'Rating');

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
  const [workspaceName, setWorkspaceName] = useState('');
  const [setupMessage, setSetupMessage] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<string[]>(['src']);
  const [timelineMessage, setTimelineMessage] = useState('');
  const [activeFilters, setActiveFilters] = useState([
    { id: 'status', label: 'Status', value: 'Open' },
  ]);
  const [filterSearch, setFilterSearch] = useState('');
  const [files, setFiles] = useState([
    { id: 'brief', name: 'Brief.pdf', description: '240 KB', state: 'Ready' },
  ]);
  const [workflowStep, setWorkflowStep] = useState('review');
  const [theme, setTheme] = useState(() =>
      document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
    ),
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
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [fieldDate, setFieldDate] = useState('2026-10-24');
  const [fieldTime, setFieldTime] = useState('09:00');
  const [fieldDateTime, setFieldDateTime] = useState('2026-10-24T09:00');
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
  if (pageKind() === 'accessibility')
    return (
      <CatalogShell
        page="accessibility"
        theme={theme}
        rtl={rtl}
        onThemeChange={setTheme}
        onRtlChange={setRtl}
      >
        <AccessibilityPage />
      </CatalogShell>
    );
  if (pageKind() === 'api')
    return (
      <CatalogShell
        page="api"
        theme={theme}
        rtl={rtl}
        onThemeChange={setTheme}
        onRtlChange={setRtl}
      >
        <ApiPage />
      </CatalogShell>
    );
  if (pageKind() === 'frameworks') {
    return (
      <CatalogShell
        page="frameworks"
        theme={theme}
        rtl={rtl}
        onThemeChange={setTheme}
        onRtlChange={setRtl}
      >
        <FrameworksPage />
      </CatalogShell>
    );
  }
  if (pageKind() === 'customize') {
    return (
      <CatalogShell
        page="customize"
        theme={theme}
        rtl={rtl}
        onThemeChange={setTheme}
        onRtlChange={setRtl}
      >
        <CustomizePage />
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
      <Section title="Cursor" columns={2}>
        <CursorExamples />
      </Section>
      <Section title="History" columns={1}>
        <HistoryReviewExamples />
        <BackupHistoryExamples />
      </Section>
      <Section title="Tree">
        <Example title="Project hierarchy">
          <Tree
            label="Files"
            defaultExpanded={['projects']}
            nodes={[
              {
                id: 'projects',
                label: 'Projects',
                children: [
                  { id: 'brief', label: 'Product brief' },
                  { id: 'notes', label: 'Meeting notes' },
                ],
              },
              {
                id: 'archive',
                label: 'Archive',
                children: [{ id: 'old', label: 'Previous work' }],
              },
            ]}
          />
        </Example>
        <Example title="Team structure">
          <Tree
            label="Teams"
            defaultExpanded={['design']}
            defaultValue="research"
            nodes={[
              {
                id: 'design',
                label: 'Design',
                children: [
                  { id: 'research', label: 'Research' },
                  { id: 'systems', label: 'Design systems' },
                ],
              },
              {
                id: 'ops',
                label: 'Operations',
                children: [
                  {
                    id: 'archived',
                    label: 'Archived projects',
                    disabled: true,
                  },
                ],
              },
            ]}
          />
        </Example>
        <Example title="Changed files">
          <div class="catalog-row">
            <Button onClick={() => setExpandedPaths(['src', 'docs'])}>
              Expand all
            </Button>
            <Button onClick={() => setExpandedPaths([])}>Collapse all</Button>
          </div>

          <FileTree
            label="Project changes"
            defaultValue="src/main.ts"
            expanded={expandedPaths}
            onExpandedChange={setExpandedPaths}
            nodes={[
              {
                type: 'folder',
                name: 'src',
                path: 'src',
                children: [
                  {
                    type: 'file',
                    name: 'main.ts',
                    path: 'src/main.ts',
                    status: 'modified',
                  },
                  {
                    type: 'file',
                    name: 'format.ts',
                    path: 'src/format.ts',
                    status: 'added',
                  },
                ],
              },
              {
                type: 'folder',
                name: 'docs',
                path: 'docs',
                children: [
                  { type: 'file', name: 'notes.md', path: 'docs/notes.md' },
                ],
              },
              {
                type: 'file',
                name: 'legacy.md',
                path: 'legacy.md',
                status: 'deleted',
              },
            ]}
          />
        </Example>
        <Example title="Files from paths">
          <FileTree
            label="Generated files"
            nodes={fileTreeFromPaths([
              'src/main.ts',
              'src/format.ts',
              'README.md',
              'src/main.ts',
            ])}
          />
        </Example>
      </Section>
      <Section title="Stepper">
        <Example title="Workflow progress">
          <Stepper
            label="Setup"
            value={workflowStep}
            onValueChange={setWorkflowStep}
            steps={[
              { id: 'details', label: 'Details' },
              { id: 'review', label: 'Review' },
              { id: 'finish', label: 'Finish' },
            ]}
          />
        </Example>
        <Example title="Vertical setup">
          <Stepper
            label="Workspace setup"
            orientation="vertical"
            linear
            id="workspace-setup"
            previousLabel="Back"
            nextLabel="Next"
            isStepValid={(index) =>
              index !== 0 || workspaceName.trim().length > 0
            }
            onStepInvalid={() => setSetupMessage('Enter a workspace name.')}
            onStepChange={() => setSetupMessage('')}
            completedContent={<p>Workspace ready</p>}
            steps={[
              {
                id: 'name',
                label: 'Name',
                description: 'Workspace details',
                content: (
                  <div>
                    <TextInput
                      aria-label="Workspace name"
                      value={workspaceName}
                      onInput={(event) =>
                        setWorkspaceName(event.currentTarget.value)
                      }
                    />
                    <p aria-live="polite">{setupMessage}</p>
                  </div>
                ),
              },
              {
                id: 'confirm',
                label: 'Confirm',
                content: <p>Review {workspaceName}.</p>,
              },
            ]}
          />
        </Example>
        <Example title="Vertical keyboard navigation">
          <Stepper
            label="Review stages"
            orientation="vertical"
            defaultStep={0}
            steps={[
              { id: 'draft', label: 'Draft' },
              { id: 'disabled', label: 'Unavailable', disabled: true },
              { id: 'proof', label: 'Proofread' },
            ]}
          />
        </Example>
        <Example title="Accordion checklist">
          <Stepper
            label="Project launch checklist"
            id="launch-checklist"
            layout="accordion"
            defaultStep={1}
            nextLabel="Done, next step"
            completedContent={<p>Launch checklist complete</p>}
            steps={[
              {
                id: 'brief',
                label: 'Set the project brief',
                description: '5 min',
                content: (
                  <p>Agree on the scope, owners, and success criteria.</p>
                ),
              },
              {
                id: 'review',
                label: 'Review the launch plan',
                description: '10 min',
                content: (
                  <>
                    <p>
                      Confirm the launch date and make sure each task has an
                      owner.
                    </p>
                    <p>
                      <strong>Have ready:</strong> The project brief and
                      milestone dates.
                    </p>
                  </>
                ),
              },
              {
                id: 'invite',
                label: 'Invite collaborators',
                description: '5 min',
                content: (
                  <p>
                    Share the workspace with the launch team and confirm access.
                  </p>
                ),
              },
            ]}
          />
        </Example>
        <Example title="Right-to-left progress">
          <Stepper
            label="إعداد المشروع"
            dir="rtl"
            orientation="horizontal"
            defaultStep={1}
            steps={[
              { id: 'details', label: 'التفاصيل' },
              { id: 'review', label: 'المراجعة' },
              { id: 'finish', label: 'إنهاء' },
            ]}
          />
        </Example>
      </Section>
      <Section title="Activity timeline">
        <Example title="Project activity">
          <ActivityTimeline
            label="Project activity"
            entries={[
              {
                id: 'created',
                avatar: <Avatar value="Alex" label="Alex" />,
                header: 'Alex',
                content: 'Created the project',
                timestamp: 'Monday',
                actions: (
                  <Button onClick={() => setTimelineMessage('Opened project')}>
                    Open project
                  </Button>
                ),
              },
              {
                id: 'updated',
                avatar: <Avatar value="Morgan" label="Morgan" />,
                header: 'Morgan',
                content: 'Updated the plan',
                timestamp: 'Tuesday',
              },
            ]}
          />
          <p aria-live="polite">{timelineMessage}</p>
        </Example>
      </Section>
      <Section title="Attachments">
        <Example title="Attachments">
          <Attachments
            label="Attachments"
            items={files}
            removeLabel={(item) => `Remove ${item.name}`}
            onRemove={(id) =>
              setFiles((previous) => previous.filter((item) => item.id !== id))
            }
          />
        </Example>
      </Section>
      <Section title="Cascader">
        <Example title="Cascader">
          <Cascader
            label="Location"
            placeholder="Choose a location"
            nodes={[
              {
                id: 'eu',
                label: 'Europe',
                children: [
                  { id: 'pt', label: 'Portugal' },
                  { id: 'fr', label: 'France' },
                ],
              },
            ]}
          />
        </Example>
        <Example title="Choose a team">
          <Cascader
            label="Team"
            placeholder="Select a team"
            nodes={[
              {
                id: 'product',
                label: 'Product',
                children: [
                  {
                    id: 'design',
                    label: 'Design',
                    children: [
                      { id: 'research', label: 'Research' },
                      { id: 'systems', label: 'Design systems' },
                    ],
                  },
                  { id: 'planning', label: 'Planning' },
                ],
              },
              {
                id: 'ops',
                label: 'Operations',
                children: [{ id: 'finance', label: 'Finance' }],
              },
            ]}
          />
        </Example>
      </Section>
      <Section title="Command palette" columns={4}>
        <CommandPaletteExamples />
      </Section>
      <Section title="Buttons">
        <Example title="Button variants">
          <div class="catalog-row">
            <Button
              variant="solid"
              onClick={() => setButtonAction('Solid clicked')}
            >
              Solid
            </Button>
            <SvgButton
              variant="solid"
              label="Add task"
              icon={plusIcon}
              onClick={() => setButtonAction('Add task clicked')}
            />
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
            <Button
              variant="link"
              onClick={() => setButtonAction('Link clicked')}
            >
              Link action
            </Button>
            <SvgButton
              variant="link"
              label="Add item"
              visibleLabel="Add item"
              icon={plusIcon}
              onClick={() => setButtonAction('Add item clicked')}
            />
            <Button variant="link" disabled>
              Disabled link
            </Button>

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
            <Button rounded variant="solid">
              Solid pill
            </Button>
            <Button rounded variant="primary">
              Primary pill
            </Button>
            <Button rounded>Outline pill</Button>
            <Button rounded variant="ghost">
              Ghost pill
            </Button>
            <Button rounded variant="danger">
              Danger pill
            </Button>
            <Button rounded size="compact">
              Compact pill
            </Button>
            <Button rounded disabled>
              Disabled pill
            </Button>
            <Button rounded href={componentHref('sliders')}>
              Browse sliders
            </Button>
          </div>
        </Example>
        <Example title="Busy buttons">
          <div class="catalog-row">
            <Button
              variant="primary"
              busy={busyButtons}
              onClick={() => setButtonAction('Busy action clicked')}
            >
              Save changes
            </Button>
            <Button
              busy={busyButtons}
              onClick={() => setButtonAction('Busy outline clicked')}
            >
              Upload file
            </Button>
            <IconButton
              label="Sync items"
              icon={icon}
              busy={busyButtons}
              onClick={() => setButtonAction('Busy icon clicked')}
            />
            <ToggleButton
              busy={busyButtons}
              pressed={togglePressed}
              onPressedChange={setTogglePressed}
            >
              Busy toggle
            </ToggleButton>
          </div>
          <ToggleButton pressed={busyButtons} onPressedChange={setBusyButtons}>
            Busy state
          </ToggleButton>
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
        <SearchActionBarExample />
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
        <Example title="Filter bar">
          <FilterBar
            label="Filters"
            filters={activeFilters}
            search={filterSearch}
            searchLabel="Search records"
            onSearchChange={setFilterSearch}
            removeLabel={(filter) => `Remove ${filter.label}`}
            onRemove={(id) =>
              setActiveFilters((previous) =>
                previous.filter((filter) => filter.id !== id),
              )
            }
            clearLabel="Clear filters"
            onClear={() => setActiveFilters([])}
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
      <Section title="Multi/selects, autocomplete">
        <Example title="Select">
          <Select
            aria-label="View"
            value={selectView}
            onValueChange={setSelectView}
          >
            {options.map((option) => (
              <option value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </Select>
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
        <AutocompleteExamples />
        <RemoteLookupExample />
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
      </Section>
      <Section title="Resource selection">
        <Example title="User select with images">
          <MemberDropdown
            label="Choose a team member"
            value={selectedPerson}
            onChange={setSelectedPerson}
          />
        </Example>
        <Example title="Avatar">
          <Avatar value="Morgan Lee" label="Morgan Lee" />
        </Example>
        <Example title="Resource selection">
          <SharedResourcePicker
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
        <ReleaseTimelineExample />
      </Section>
      <Section title="Sliders">
        <SliderLayoutExamples />
        <Example title="Scalar slider">
          <FormField label="Opacity">
            <SingleValueSlider
              min={0}
              max={100}
              value={opacity}
              ariaLabel="Opacity"
              onChange={setOpacity}
            />
          </FormField>
        </Example>
        <Example title="Range slider">
          <PreactRangeSlider
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
          <SingleValueSlider
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
        <CircularSliderExamples />
      </Section>
      <Section title="Field configurators" columns={2}>
        <AppearanceConfiguratorExample />
        <FieldConfiguratorExamples />
      </Section>
      <Section title="Activity messages">
        <Example title="Chat-style activity">
          <ActivityMessage
            avatar={
              <Avatar
                value="https://i.pravatar.cc/96?img=9"
                initials="PS"
                label="Priya Shah"
              />
            }
            timestamp={<time dateTime="2026-10-25T16:01:00">4:01 PM</time>}
            header={
              <>
                <strong>Priya Shah</strong> updated the owner
              </>
            }
            actions={<Button variant="link">View change ↗</Button>}
          >
            <p>Portfolio ownership transferred to Sam Carter.</p>
          </ActivityMessage>
        </Example>
      </Section>
      <Section title="Formatting controls">
        <FormattingExamples />
      </Section>
      <Section title="Charts and range selection">
        <ChartExamples />
      </Section>
      <Section title="Calendar and dates">
        <CalendarNavigatorExample />
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

        <MiniCalendarExamples />
        <CalendarExamples />
        <Example title="Date pickers">
          <DatePicker
            label="Due date"
            openLabel="Choose due date"
            value={dueDate}
            open={dueDateOpen}
            onOpenChange={setDueDateOpen}
            onChange={(next) => {
              if (next) setDueDate(next);
            }}
          />
          <form>
            <DatePicker
              label="Second date"
              openLabel="Choose second date"
              defaultValue="2026-10-24"
              defaultMonth="2026-10-01"
              dateInput={{ format: 'eu' }}
              name="secondDate"
              required
              clearable
              clearLabel="Clear second date"
              closeOnSelect={false}
            />
          </form>
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
      </Section>
      <Section title="Time pickers">
        <Example title="Time field">
          <DateTimeField
            aria-label="Time field"
            kind="time"
            value={fieldTime}
            onValueChange={setFieldTime}
            picker={{
              timeFormat: '24h',
              text: { chooseTime: 'Choose field time' },
            }}
          />
        </Example>
        <TimePickerExamples />
      </Section>
      <Section title="Date and time fields">
        <Example title="Date and time fields">
          <DateTimeField
            aria-label="Date field"
            value={fieldDate}
            onValueChange={setFieldDate}
            picker={{ text: { chooseDate: 'Choose field date' } }}
          />
          <DateTimeField
            aria-label="Date and time field"
            kind="datetime"
            value={fieldDateTime}
            onValueChange={setFieldDateTime}
            picker={{
              timeFormat: '24h',
              text: { chooseDate: 'Choose field date and time' },
            }}
          />
        </Example>
        <SharedEditorExamples />
        <DateTimeCalendarExample />
      </Section>
      <Section title="Duration and effort">
        <DurationEffortExample />
      </Section>
      <Section title="Assignee field">
        <AssigneeFieldExample />
      </Section>
      <Section title="Legend">
        <Example title="Legend">
          <Legend
            label="Calendar legend"
            items={[
              { id: 'working', label: 'Working day', marker: 'outline' },
              {
                id: 'closed',
                label: 'Non-working',
                color: 'var(--rv-ui-text-muted)',
              },
              { id: 'exception', label: 'Exception', tone: 'selected' },
              { id: 'inherited', label: 'Inherited', marker: 'dashed' },
            ]}
          />
        </Example>
      </Section>
      <Section title="Weekly time grid">
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
      <Section title="Accordion">
        <Example title="Accordion sections" wide>
          <div class="catalog-accordion">
            <CollapsibleSection
              title="Project details"
              description="Each section expands independently."
              defaultOpen
            >
              <TextInput
                aria-label="Accordion project name"
                placeholder="Project name"
              />
            </CollapsibleSection>
            <CollapsibleSection
              title="Display settings"
              description="Collapsed content keeps its draft values."
            >
              <TextInput
                aria-label="Accordion display label"
                placeholder="Display label"
              />
            </CollapsibleSection>
            <CollapsibleSection title="How does this work?">
              <p>
                Use Enter or Space to toggle a section. Multiple sections can
                stay open.
              </p>
            </CollapsibleSection>
          </div>
        </Example>
        <Example title="Trace">
          <Trace
            label="Run"
            steps={[
              {
                id: 'one',
                title: 'Search records',
                status: 'Complete',
                tone: 'success',
                details: 'Found 12 records',
              },
              { id: 'two', title: 'Prepare report', status: 'Running' },
            ]}
          />
        </Example>
      </Section>
      <Section title="Tooltip">
        <TooltipPlacementExamples />
        <TooltipTimingExamples />
        <TooltipStateExamples />
        <TooltipContentExamples />
        <TooltipBoundaryExample />
        <TooltipControllerExample />
        <Example title="Tooltip">
          <Tooltip text="Keyboard and pointer tooltip">
            <Button>Tooltip trigger</Button>
          </Tooltip>
        </Example>
      </Section>
      <Section title="Menus and toolbars">
        <IconToolbarExample />
        <Example title="Drawing toolbar">
          <Toolbar label="Drawing tools" className="rv-toolbar--surface">
            {(['select', 'rectangle', 'line', 'arrow', 'note'] as const).map(
              (tool) => (
                <IconButton
                  key={tool}
                  label={
                    tool === 'select'
                      ? 'Select tool'
                      : `${tool[0].toUpperCase()}${tool.slice(1)} tool`
                  }
                  aria-pressed={drawingTool === tool}
                  icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${DRAWING_TOOL_PATHS[tool]}"/></svg>`}
                  onClick={() => setDrawingTool(tool)}
                />
              ),
            )}
          </Toolbar>
          <FieldHint>
            Choose a drawing tool. Drawing behavior stays in Charts.
          </FieldHint>
          <div class="catalog-row">
            <IconButton
              label="Drawing unavailable"
              disabled
              icon={`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${DRAWING_TOOL_PATHS.rectangle}"/></svg>`}
            />
            <FieldHint>Drawing unavailable</FieldHint>
          </div>
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
        <ActionBarExamples />
      </Section>
      <Section title="Status and feedback">
        <ToastExamples />
        <Example title="Badges">
          <Badge>Draft</Badge>
          <CountBadge count={12} label="12 tasks" />
          <StatusBadge tone="warning" label="Needs attention" />
        </Example>
        <Example title="Alerts">
          <Alert tone="success" icon={<SvgIcon svg={alertCheckIcon} />}>
            Changes saved
          </Alert>
          <Alert
            tone="danger"
            icon={<SvgIcon svg={alertWarningIcon} />}
            title="A value needs attention"
            description="Review the highlighted field and try again."
          />
        </Example>
        <Example title="Activity panel">
          <StatusFeedbackPanel
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
        <MetricPanelExample />
        <NativePresentationExamples />
        <Example title="Split panes" wide>
          <ResizeExample rtl={rtl} />
        </Example>
      </Section>
      <Section title="Pagination">
        <PaginationExamples />
      </Section>
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
      <Section title="HTML Editor" columns={1}>
        <RichTextEditorExample />
      </Section>
      <Section title="PDF viewer" columns={1}>
        <PdfViewerExamples />
      </Section>
      <Section title="AI assistant">
        <AiExamples />
        <AiChatExample />
        <AiResultsExample />
      </Section>
    </CatalogShell>
  );
}
if (!redirectLegacyRoute()) {
  const appRoot = document.getElementById('app')!;
  // Keep prerendered content intact while a legacy URL navigates to its owner.
  appRoot.replaceChildren();
  render(<App />, appRoot);
}
