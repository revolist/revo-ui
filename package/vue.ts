import { pdfViewerRenderSlots } from './component-metadata';
/** Vue wrappers around the shared Preact implementation. Import styles.css once. */
import * as ui from './preact';
import { createVueAdapter, type VueUiComponent } from './vue-adapter';
export {
  createVueAdapter,
  type VueUiProps,
  type VueAdapterOptions,
} from './vue-adapter';
const dropdownSlots = {
  option: {
    prop: 'renderOption',
    args: ['option', 'selected'],
    skipFactory: true,
  },
  value: { prop: 'renderValue', args: ['option'], skipFactory: true },
  content: { prop: 'renderContent', args: ['content'] },
  noResults: { prop: 'renderNoResults', args: [], skipFactory: true },
} as const;
export const Input = /* @__PURE__ */ createVueAdapter(ui.Input, 'Input');
export const SvgIcon = /* @__PURE__ */ createVueAdapter(ui.SvgIcon, 'SvgIcon');
export const SvgButton = /* @__PURE__ */ createVueAdapter(
  ui.SvgButton,
  'SvgButton',
);
export const DeleteButton = /* @__PURE__ */ createVueAdapter(
  ui.DeleteButton,
  'DeleteButton',
);
export const RemoveButton = /* @__PURE__ */ createVueAdapter(
  ui.RemoveButton,
  'RemoveButton',
);
export const Checkbox = /* @__PURE__ */ createVueAdapter(
  ui.Checkbox,
  'Checkbox',
  { model: { prop: 'checked', callback: 'onChange' } },
);
export const Switch = /* @__PURE__ */ createVueAdapter(ui.Switch, 'Switch', {
  model: { prop: 'checked', callback: 'onChange' },
});
export const SegmentedSwitch = /* @__PURE__ */ createVueAdapter(
  ui.SegmentedSwitch,
  'SegmentedSwitch',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const ChoiceChips = /* @__PURE__ */ createVueAdapter(
  ui.ChoiceChips,
  'ChoiceChips',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const ChoiceChipInfoButton = /* @__PURE__ */ createVueAdapter(
  ui.ChoiceChipInfoButton,
  'ChoiceChipInfoButton',
);
export const ChoiceChip = /* @__PURE__ */ createVueAdapter(
  ui.ChoiceChip,
  'ChoiceChip',
);
export const SearchInput = /* @__PURE__ */ createVueAdapter(
  ui.SearchInput,
  'SearchInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const FilterChip = /* @__PURE__ */ createVueAdapter(
  ui.FilterChip,
  'FilterChip',
);
export const FormField = /* @__PURE__ */ createVueAdapter(
  ui.FormField,
  'FormField',
);
export const DisclosureSummary = /* @__PURE__ */ createVueAdapter(
  ui.DisclosureSummary,
  'DisclosureSummary',
);
export const EditorSplitLayout = /* @__PURE__ */ createVueAdapter(
  ui.EditorSplitLayout,
  'EditorSplitLayout',
);
export const EditorPane = /* @__PURE__ */ createVueAdapter(
  ui.EditorPane,
  'EditorPane',
);
export const EditorList = /* @__PURE__ */ createVueAdapter(
  ui.EditorList,
  'EditorList',
);
export const EditorListItem = /* @__PURE__ */ createVueAdapter(
  ui.EditorListItem,
  'EditorListItem',
);
export const EditorListItemContent = /* @__PURE__ */ createVueAdapter(
  ui.EditorListItemContent,
  'EditorListItemContent',
);
export const EditorListGroup = /* @__PURE__ */ createVueAdapter(
  ui.EditorListGroup,
  'EditorListGroup',
);
export const Calendar = /* @__PURE__ */ createVueAdapter(
  ui.Calendar,
  'Calendar',
);
export const CalendarHeader = /* @__PURE__ */ createVueAdapter(
  ui.CalendarHeader,
  'CalendarHeader',
);
export const CalendarWeekdays = /* @__PURE__ */ createVueAdapter(
  ui.CalendarWeekdays,
  'CalendarWeekdays',
);
export const CalendarDay = /* @__PURE__ */ createVueAdapter(
  ui.CalendarDay,
  'CalendarDay',
);
export const CalendarMonthGrid = /* @__PURE__ */ createVueAdapter(
  ui.CalendarMonthGrid,
  'CalendarMonthGrid',
);
export const CalendarYearGrid = /* @__PURE__ */ createVueAdapter(
  ui.CalendarYearGrid,
  'CalendarYearGrid',
);
export const CalendarPicker = /* @__PURE__ */ createVueAdapter(
  ui.CalendarPicker,
  'CalendarPicker',
  { model: { prop: 'selected', callback: 'onSelectionChange' } },
);
export const SharedResourcePicker = /* @__PURE__ */ createVueAdapter(
  ui.SharedResourcePicker,
  'SharedResourcePicker',
  { model: { prop: 'selectedResourceIds', callback: 'onChange' } },
);
export const ResourcePickerAvatar = /* @__PURE__ */ createVueAdapter(
  ui.ResourcePickerAvatar,
  'ResourcePickerAvatar',
);
export const ColorPalette = /* @__PURE__ */ createVueAdapter(
  ui.ColorPalette,
  'ColorPalette',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const ColorPicker = /* @__PURE__ */ createVueAdapter(
  ui.ColorPicker,
  'ColorPicker',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const Dropdown = /* @__PURE__ */ createVueAdapter(
  ui.Dropdown,
  'Dropdown',
  {
    model: { prop: 'value', callback: 'onChange' },
    renderSlots: dropdownSlots,
  },
);
export const DropdownPopup = /* @__PURE__ */ createVueAdapter(
  ui.DropdownPopup,
  'DropdownPopup',
);
export const DropdownPopupContent = /* @__PURE__ */ createVueAdapter(
  ui.DropdownPopupContent,
  'DropdownPopupContent',
);
export const PreactRangeSlider = /* @__PURE__ */ createVueAdapter(
  ui.PreactRangeSlider,
  'PreactRangeSlider',
);
export const SingleValueSlider = /* @__PURE__ */ createVueAdapter(
  ui.SingleValueSlider,
  'SingleValueSlider',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const SliderField = /* @__PURE__ */ createVueAdapter(
  ui.SliderField,
  'SliderField',
);
export const IconButton: VueUiComponent<typeof ui.IconButton> =
  /* @__PURE__ */ createVueAdapter(ui.IconButton, 'IconButton');
export const ToggleButton: VueUiComponent<
  typeof ui.ToggleButton,
  { model: { prop: 'pressed'; callback: 'onPressedChange' } }
> = /* @__PURE__ */ createVueAdapter(ui.ToggleButton, 'ToggleButton', {
  model: { prop: 'pressed', callback: 'onPressedChange' },
});
export const ButtonGroup = /* @__PURE__ */ createVueAdapter(
  ui.ButtonGroup,
  'ButtonGroup',
);
export const SegmentedControl = /* @__PURE__ */ createVueAdapter(
  ui.SegmentedControl,
  'SegmentedControl',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const Tabs = /* @__PURE__ */ createVueAdapter(ui.Tabs, 'Tabs', {
  model: { prop: 'value', callback: 'onChange' },
});
export const TabPanel = /* @__PURE__ */ createVueAdapter(
  ui.TabPanel,
  'TabPanel',
);
export const RadioGroup = /* @__PURE__ */ createVueAdapter(
  ui.RadioGroup,
  'RadioGroup',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const TextInput = /* @__PURE__ */ createVueAdapter(
  ui.TextInput,
  'TextInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const Textarea = /* @__PURE__ */ createVueAdapter(
  ui.Textarea,
  'Textarea',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const NumberInput = /* @__PURE__ */ createVueAdapter(
  ui.NumberInput,
  'NumberInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const NumberStepper = /* @__PURE__ */ createVueAdapter(
  ui.NumberStepper,
  'NumberStepper',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const DateInput = /* @__PURE__ */ createVueAdapter(
  ui.DateInput,
  'DateInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const TimeInput = /* @__PURE__ */ createVueAdapter(
  ui.TimeInput,
  'TimeInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const DateTimeInput = /* @__PURE__ */ createVueAdapter(
  ui.DateTimeInput,
  'DateTimeInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const Chip = /* @__PURE__ */ createVueAdapter(ui.Chip, 'Chip');
export const FieldHint = /* @__PURE__ */ createVueAdapter(
  ui.FieldHint,
  'FieldHint',
);
export const FieldError = /* @__PURE__ */ createVueAdapter(
  ui.FieldError,
  'FieldError',
);
export const FormSection = /* @__PURE__ */ createVueAdapter(
  ui.FormSection,
  'FormSection',
);
export const Disclosure = /* @__PURE__ */ createVueAdapter(
  ui.Disclosure,
  'Disclosure',
);
export const Panel = /* @__PURE__ */ createVueAdapter(ui.Panel, 'Panel');
export const Toolbar = /* @__PURE__ */ createVueAdapter(ui.Toolbar, 'Toolbar');
export const ToolbarGroup = /* @__PURE__ */ createVueAdapter(
  ui.ToolbarGroup,
  'ToolbarGroup',
);
export const ToolbarSeparator = /* @__PURE__ */ createVueAdapter(
  ui.ToolbarSeparator,
  'ToolbarSeparator',
);
export const Badge = /* @__PURE__ */ createVueAdapter(ui.Badge, 'Badge');
export const CountBadge = /* @__PURE__ */ createVueAdapter(
  ui.CountBadge,
  'CountBadge',
);
export const Spinner = /* @__PURE__ */ createVueAdapter(ui.Spinner, 'Spinner');
export const LoadingOverlay = /* @__PURE__ */ createVueAdapter(
  ui.LoadingOverlay,
  'LoadingOverlay',
);
export const EmptyState = /* @__PURE__ */ createVueAdapter(
  ui.EmptyState,
  'EmptyState',
);
export const Menu = /* @__PURE__ */ createVueAdapter(ui.Menu, 'Menu');
export const MenuItem: VueUiComponent<typeof ui.MenuItem> =
  /* @__PURE__ */ createVueAdapter(ui.MenuItem, 'MenuItem');
export const MenuSeparator = /* @__PURE__ */ createVueAdapter(
  ui.MenuSeparator,
  'MenuSeparator',
);
export const Submenu = /* @__PURE__ */ createVueAdapter(ui.Submenu, 'Submenu');
export const ResizeHandle = /* @__PURE__ */ createVueAdapter(
  ui.ResizeHandle,
  'ResizeHandle',
);
export const Pagination = /* @__PURE__ */ createVueAdapter(
  ui.Pagination,
  'Pagination',
);
export const CircularProgress = /* @__PURE__ */ createVueAdapter(
  ui.CircularProgress,
  'CircularProgress',
);
export const Rating = /* @__PURE__ */ createVueAdapter(ui.Rating, 'Rating', {
  model: { prop: 'value', callback: 'onChange' },
});
export const Button = /* @__PURE__ */ createVueAdapter(ui.Button, 'Button');
export const Pane = /* @__PURE__ */ createVueAdapter(ui.Pane, 'Pane');
export const SplitLayout = /* @__PURE__ */ createVueAdapter(
  ui.SplitLayout,
  'SplitLayout',
);
export const Alert = /* @__PURE__ */ createVueAdapter(ui.Alert, 'Alert');
export const Listbox = /* @__PURE__ */ createVueAdapter(ui.Listbox, 'Listbox');
export const ListboxOption = /* @__PURE__ */ createVueAdapter(
  ui.ListboxOption,
  'ListboxOption',
);
export const ListboxGroup = /* @__PURE__ */ createVueAdapter(
  ui.ListboxGroup,
  'ListboxGroup',
);
export const ListboxOptionContent = /* @__PURE__ */ createVueAdapter(
  ui.ListboxOptionContent,
  'ListboxOptionContent',
);
export const StatusFeedbackPanel = /* @__PURE__ */ createVueAdapter(
  ui.StatusFeedbackPanel,
  'StatusFeedbackPanel',
);
export const StatusBadge = /* @__PURE__ */ createVueAdapter(
  ui.StatusBadge,
  'StatusBadge',
);
export const Combobox = /* @__PURE__ */ createVueAdapter(
  ui.Combobox,
  'Combobox',
  {
    model: { prop: 'value', callback: 'onChange' },
    renderSlots: dropdownSlots,
  },
);
export const MultiSelect = /* @__PURE__ */ createVueAdapter(
  ui.MultiSelect,
  'MultiSelect',
  {
    model: { prop: 'value', callback: 'onChange' },
    renderSlots: dropdownSlots,
  },
);
export const Avatar = /* @__PURE__ */ createVueAdapter(ui.Avatar, 'Avatar');
export const ProgressBar = /* @__PURE__ */ createVueAdapter(
  ui.ProgressBar,
  'ProgressBar',
);
export const Popover = /* @__PURE__ */ createVueAdapter(ui.Popover, 'Popover');
export const Tooltip = /* @__PURE__ */ createVueAdapter(ui.Tooltip, 'Tooltip', {
  renderSlots: { content: { prop: 'renderContent', args: ['context'] } },
});
export const Dialog = /* @__PURE__ */ createVueAdapter(ui.Dialog, 'Dialog');
export const ConfirmDialog = /* @__PURE__ */ createVueAdapter(
  ui.ConfirmDialog,
  'ConfirmDialog',
);
export const DatePicker = /* @__PURE__ */ createVueAdapter(
  ui.DatePicker,
  'DatePicker',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const DateRangePicker = /* @__PURE__ */ createVueAdapter(
  ui.DateRangePicker,
  'DateRangePicker',
  { model: { prop: 'value', callback: 'onChange' } },
);
export const DialogHeader = /* @__PURE__ */ createVueAdapter(
  ui.DialogHeader,
  'DialogHeader',
);
export const DialogBody = /* @__PURE__ */ createVueAdapter(
  ui.DialogBody,
  'DialogBody',
);
export const DialogFooter = /* @__PURE__ */ createVueAdapter(
  ui.DialogFooter,
  'DialogFooter',
);
export const DistributionChart = /* @__PURE__ */ createVueAdapter(
  ui.DistributionChart,
  'DistributionChart',
);
export const BarChart = /* @__PURE__ */ createVueAdapter(
  ui.BarChart,
  'BarChart',
);
export const LineChart = /* @__PURE__ */ createVueAdapter(
  ui.LineChart,
  'LineChart',
);
export const AreaChart = /* @__PURE__ */ createVueAdapter(
  ui.AreaChart,
  'AreaChart',
);
export const BrushRange = /* @__PURE__ */ createVueAdapter(
  ui.BrushRange,
  'BrushRange',
);
export const OptionButton = /* @__PURE__ */ createVueAdapter(
  ui.OptionButton,
  'OptionButton',
);
export const HighlightedTextInput = /* @__PURE__ */ createVueAdapter(
  ui.HighlightedTextInput,
  'HighlightedTextInput',
);
export const InlineFieldGroup = /* @__PURE__ */ createVueAdapter(
  ui.InlineFieldGroup,
  'InlineFieldGroup',
);
export const Legend = /* @__PURE__ */ createVueAdapter(ui.Legend, 'Legend');
export const TimeGrid = /* @__PURE__ */ createVueAdapter(
  ui.TimeGrid,
  'TimeGrid',
);
export const FieldIcon = /* @__PURE__ */ createVueAdapter(
  ui.FieldIcon,
  'FieldIcon',
);
export const FieldSummary = /* @__PURE__ */ createVueAdapter(
  ui.FieldSummary,
  'FieldSummary',
);
export const FieldLibrary = /* @__PURE__ */ createVueAdapter(
  ui.FieldLibrary,
  'FieldLibrary',
);
export const FieldGroupHeading = /* @__PURE__ */ createVueAdapter(
  ui.FieldGroupHeading,
  'FieldGroupHeading',
);
export const FieldGroup = /* @__PURE__ */ createVueAdapter(
  ui.FieldGroup,
  'FieldGroup',
);
export const FieldList = /* @__PURE__ */ createVueAdapter(
  ui.FieldList,
  'FieldList',
);
export const FieldRow = /* @__PURE__ */ createVueAdapter(
  ui.FieldRow,
  'FieldRow',
);
export const FieldContent = /* @__PURE__ */ createVueAdapter(
  ui.FieldContent,
  'FieldContent',
);
export const FieldItem = /* @__PURE__ */ createVueAdapter(
  ui.FieldItem,
  'FieldItem',
);
export const FieldLibraryList = /* @__PURE__ */ createVueAdapter(
  ui.FieldLibraryList,
  'FieldLibraryList',
);
export const SelectedField = /* @__PURE__ */ createVueAdapter(
  ui.SelectedField,
  'SelectedField',
);
export const FieldActions = /* @__PURE__ */ createVueAdapter(
  ui.FieldActions,
  'FieldActions',
);
export const FieldStatusBadge = /* @__PURE__ */ createVueAdapter(
  ui.FieldStatusBadge,
  'FieldStatusBadge',
);
export const FieldRemoveButton = /* @__PURE__ */ createVueAdapter(
  ui.FieldRemoveButton,
  'FieldRemoveButton',
);
export const FieldRemoveIcon = /* @__PURE__ */ createVueAdapter(
  ui.FieldRemoveIcon,
  'FieldRemoveIcon',
);
export const FieldDropIndicator = /* @__PURE__ */ createVueAdapter(
  ui.FieldDropIndicator,
  'FieldDropIndicator',
);
export const DialogForm = /* @__PURE__ */ createVueAdapter(
  ui.DialogForm,
  'DialogForm',
);
export const DialogCloseButton = /* @__PURE__ */ createVueAdapter(
  ui.DialogCloseButton,
  'DialogCloseButton',
);
export const DialogActionFooter = /* @__PURE__ */ createVueAdapter(
  ui.DialogActionFooter,
  'DialogActionFooter',
);
export const DialogActions = /* @__PURE__ */ createVueAdapter(
  ui.DialogActions,
  'DialogActions',
);
export const DialogTitleInput = /* @__PURE__ */ createVueAdapter(
  ui.DialogTitleInput,
  'DialogTitleInput',
);
export const EditableDialogHeader = /* @__PURE__ */ createVueAdapter(
  ui.EditableDialogHeader,
  'EditableDialogHeader',
);
export const ControlTooltip = /* @__PURE__ */ createVueAdapter(
  ui.ControlTooltip,
  'ControlTooltip',
);
export const InspectorSection = /* @__PURE__ */ createVueAdapter(
  ui.InspectorSection,
  'InspectorSection',
);
export const IconChoiceGroup = /* @__PURE__ */ createVueAdapter(
  ui.IconChoiceGroup,
  'IconChoiceGroup',
);
export const IconToggleButton = /* @__PURE__ */ createVueAdapter(
  ui.IconToggleButton,
  'IconToggleButton',
);
export const TypographyControls = /* @__PURE__ */ createVueAdapter(
  ui.TypographyControls,
  'TypographyControls',
);
export const ComparisonPreview = /* @__PURE__ */ createVueAdapter(
  ui.ComparisonPreview,
  'ComparisonPreview',
);
export const FilterBadgeInfoButton = /* @__PURE__ */ createVueAdapter(
  ui.FilterBadgeInfoButton,
  'FilterBadgeInfoButton',
);
export const FilterBadge = /* @__PURE__ */ createVueAdapter(
  ui.FilterBadge,
  'FilterBadge',
);
export const RatingStar = /* @__PURE__ */ createVueAdapter(
  ui.RatingStar,
  'RatingStar',
);
export const RatingChoice = /* @__PURE__ */ createVueAdapter(
  ui.RatingChoice,
  'RatingChoice',
);
export const ReorderList = /* @__PURE__ */ createVueAdapter(
  ui.ReorderList,
  'ReorderList',
  {
    renderSlots: {
      item: { prop: 'renderItem', args: ['item', 'index'] },
      handle: { prop: 'renderHandle', args: ['item', 'index'] },
    },
  },
);
export const ReorderHandle = /* @__PURE__ */ createVueAdapter(
  ui.ReorderHandle,
  'ReorderHandle',
);
export const TimelineTrack = /* @__PURE__ */ createVueAdapter(
  ui.TimelineTrack,
  'TimelineTrack',
);
export const ActivityMessage = /* @__PURE__ */ createVueAdapter(
  ui.ActivityMessage,
  'ActivityMessage',
);
import { NumberDraft as PreactNumberDraft } from './number-input/index';
export const NumberDraft = /* @__PURE__ */ createVueAdapter(
  PreactNumberDraft,
  'NumberDraft',
);
import { MaskedDraft as PreactMaskedDraft } from './masked-input/index';
export const MaskedDraft = /* @__PURE__ */ createVueAdapter(
  PreactMaskedDraft,
  'MaskedDraft',
);
import { DurationField as PreactDurationField } from './duration/index';
export const DurationField = /* @__PURE__ */ createVueAdapter(
  PreactDurationField,
  'DurationField',
  { model: { prop: 'value', callback: 'onChange' } },
);
import { DurationDraft as PreactDurationDraft } from './duration/index';
export const DurationDraft = /* @__PURE__ */ createVueAdapter(
  PreactDurationDraft,
  'DurationDraft',
);
import { HtmlEditor as PreactHtmlEditor } from './rich-text/index';
export const HtmlEditor = /* @__PURE__ */ createVueAdapter(
  PreactHtmlEditor,
  'HtmlEditor',
);
import { TemporalPicker as PreactTemporalPicker } from './date-time/index';
export const TemporalPicker = /* @__PURE__ */ createVueAdapter(
  PreactTemporalPicker,
  'TemporalPicker',
  { model: { prop: 'value', callback: 'onChange' } },
);
import { TemporalDraft as PreactTemporalDraft } from './date-time/index';
export const TemporalDraft = /* @__PURE__ */ createVueAdapter(
  PreactTemporalDraft,
  'TemporalDraft',
);
import { DateTimeField as PreactDateTimeField } from './date-time/index';
export const DateTimeField = /* @__PURE__ */ createVueAdapter(
  PreactDateTimeField,
  'DateTimeField',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
import { AssigneePicker as PreactAssigneePicker } from './assignee/index';
export const AssigneePicker = /* @__PURE__ */ createVueAdapter(
  PreactAssigneePicker,
  'AssigneePicker',
);
import { AssigneeField as PreactAssigneeField } from './assignee/index';
export const AssigneeField = /* @__PURE__ */ createVueAdapter(
  PreactAssigneeField,
  'AssigneeField',
);
import { AssigneePickerLayout as PreactAssigneePickerLayout } from './assignee/index';
export const AssigneePickerLayout = /* @__PURE__ */ createVueAdapter(
  PreactAssigneePickerLayout,
  'AssigneePickerLayout',
);

export const AiPromptInput = /* @__PURE__ */ createVueAdapter(
  ui.AiPromptInput,
  'AiPromptInput',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const AiSuggestions = /* @__PURE__ */ createVueAdapter(
  ui.AiSuggestions,
  'AiSuggestions',
);
export const AiActionStatus = /* @__PURE__ */ createVueAdapter(
  ui.AiActionStatus,
  'AiActionStatus',
);
export const AiChangePreview = /* @__PURE__ */ createVueAdapter(
  ui.AiChangePreview,
  'AiChangePreview',
);
export const AiResult = /* @__PURE__ */ createVueAdapter(
  ui.AiResult,
  'AiResult',
);
export const AiResultView = /* @__PURE__ */ createVueAdapter(
  ui.AiResultView,
  'AiResultView',
);
export const AiResultTable = /* @__PURE__ */ createVueAdapter(
  ui.AiResultTable,
  'AiResultTable',
);
export const AiResultMetrics = /* @__PURE__ */ createVueAdapter(
  ui.AiResultMetrics,
  'AiResultMetrics',
);
export const AiResultText = /* @__PURE__ */ createVueAdapter(
  ui.AiResultText,
  'AiResultText',
);
export const AiAssistant = /* @__PURE__ */ createVueAdapter(
  ui.AiAssistant,
  'AiAssistant',
);
export const AiRequestTrail = /* @__PURE__ */ createVueAdapter(
  ui.AiRequestTrail,
  'AiRequestTrail',
);
export const PdfViewer = /* @__PURE__ */ createVueAdapter(
  ui.PdfViewer,
  'PdfViewer',
  { renderSlots: pdfViewerRenderSlots },
);

import { PdfViewerToolbar as PreactPdfViewerToolbar } from './pdf-viewer/toolbar';
export const PdfViewerToolbar = /* @__PURE__ */ createVueAdapter(
  PreactPdfViewerToolbar,
  'PdfViewerToolbar',
);
export type { PdfViewerToolbarProps } from './pdf-viewer/toolbar';
export type {
  PdfViewerButton,
  PdfViewerButtonOptions,
  PdfViewerToolbarOptions,
  PdfViewerToolbarConfig,
} from './pdf-viewer/toolbar-options';

export type { PdfViewerProps, PdfViewerText } from './pdf-viewer/component';
export { defaultPdfViewerText } from './pdf-viewer/translations';

export const AiChat = /* @__PURE__ */ createVueAdapter(ui.AiChat, 'AiChat');
export const AiChatContent = /* @__PURE__ */ createVueAdapter(
  ui.AiChatContent,
  'AiChatContent',
);
export const AiChatComposer = /* @__PURE__ */ createVueAdapter(
  ui.AiChatComposer,
  'AiChatComposer',
  { model: { prop: 'value', callback: 'onValueChange' } },
);
export const AiChatEmptyState = /* @__PURE__ */ createVueAdapter(
  ui.AiChatEmptyState,
  'AiChatEmptyState',
);
export const AiMessage = /* @__PURE__ */ createVueAdapter(
  ui.AiMessage,
  'AiMessage',
);
export const AiMessageContent = /* @__PURE__ */ createVueAdapter(
  ui.AiMessageContent,
  'AiMessageContent',
);
export const AiMessageActions = /* @__PURE__ */ createVueAdapter(
  ui.AiMessageActions,
  'AiMessageActions',
);
export const AiReasoning = /* @__PURE__ */ createVueAdapter(
  ui.AiReasoning,
  'AiReasoning',
);
export const AiTask = /* @__PURE__ */ createVueAdapter(ui.AiTask, 'AiTask');
export const AiTaskItem = /* @__PURE__ */ createVueAdapter(
  ui.AiTaskItem,
  'AiTaskItem',
);

export const IconToolbar = /* @__PURE__ */ createVueAdapter(
  ui.IconToolbar,
  'IconToolbar',
);

export { createTooltipGroup, TooltipGroup } from './core/tooltip-options';
export type {
  TooltipAnchor,
  TooltipSide,
  TooltipAlign,
  TooltipReason,
  TooltipContent,
  TooltipOffset,
  TooltipOffsetContext,
  TooltipGroupOptions,
  TooltipOptions,
  TooltipControllerOptions,
  TooltipChangeDetails,
  TooltipContentContext,
  TooltipPositionOptions,
} from './core/tooltip-options';
