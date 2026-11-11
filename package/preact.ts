export * from './preact-raw';
import * as ui from './preact-raw';
import { registerComponentStyles } from './core/component-styles';
import {
  baseStyles,
  layoutStyles,
  calendarStyles,
  pickerStyles,
  fieldsStyles,
  feedbackStyles,
  dialogsStyles,
  chartsStyles,
  formattingStyles,
  timelineStyles,
  aiStyles,
  pdfStyles,
} from './component-style-families';

// Keep metadata attached to returned component values so unused families tree-shake.
export const Input: typeof ui.Input = /* @__PURE__ */ registerComponentStyles(
  ui.Input,
  baseStyles,
);
export const SvgIcon: typeof ui.SvgIcon =
  /* @__PURE__ */ registerComponentStyles(ui.SvgIcon, baseStyles);
export const SvgButton: typeof ui.SvgButton =
  /* @__PURE__ */ registerComponentStyles(ui.SvgButton, baseStyles);
export const DeleteButton: typeof ui.DeleteButton =
  /* @__PURE__ */ registerComponentStyles(ui.DeleteButton, baseStyles);
export const RemoveButton: typeof ui.RemoveButton =
  /* @__PURE__ */ registerComponentStyles(ui.RemoveButton, baseStyles);
export const Checkbox: typeof ui.Checkbox =
  /* @__PURE__ */ registerComponentStyles(ui.Checkbox, baseStyles);
export const Switch: typeof ui.Switch = /* @__PURE__ */ registerComponentStyles(
  ui.Switch,
  baseStyles,
);
export const SegmentedSwitch: typeof ui.SegmentedSwitch =
  /* @__PURE__ */ registerComponentStyles(ui.SegmentedSwitch, baseStyles);
export const ChoiceChips: typeof ui.ChoiceChips =
  /* @__PURE__ */ registerComponentStyles(ui.ChoiceChips, layoutStyles);
export const ChoiceChipInfoButton: typeof ui.ChoiceChipInfoButton =
  /* @__PURE__ */ registerComponentStyles(
    ui.ChoiceChipInfoButton,
    layoutStyles,
  );
export const ChoiceChip: typeof ui.ChoiceChip =
  /* @__PURE__ */ registerComponentStyles(ui.ChoiceChip, layoutStyles);
export const SearchInput: typeof ui.SearchInput =
  /* @__PURE__ */ registerComponentStyles(ui.SearchInput, layoutStyles);
export const FilterChip: typeof ui.FilterChip =
  /* @__PURE__ */ registerComponentStyles(ui.FilterChip, layoutStyles);
export const FormField: typeof ui.FormField =
  /* @__PURE__ */ registerComponentStyles(ui.FormField, layoutStyles);
export const DisclosureSummary: typeof ui.DisclosureSummary =
  /* @__PURE__ */ registerComponentStyles(ui.DisclosureSummary, layoutStyles);
export const EditorSplitLayout: typeof ui.EditorSplitLayout =
  /* @__PURE__ */ registerComponentStyles(ui.EditorSplitLayout, layoutStyles);
export const EditorPane: typeof ui.EditorPane =
  /* @__PURE__ */ registerComponentStyles(ui.EditorPane, layoutStyles);
export const EditorList: typeof ui.EditorList =
  /* @__PURE__ */ registerComponentStyles(ui.EditorList, layoutStyles);
export const EditorListItem: typeof ui.EditorListItem =
  /* @__PURE__ */ registerComponentStyles(ui.EditorListItem, layoutStyles);
export const EditorListItemContent: typeof ui.EditorListItemContent =
  /* @__PURE__ */ registerComponentStyles(
    ui.EditorListItemContent,
    layoutStyles,
  );
export const EditorListGroup: typeof ui.EditorListGroup =
  /* @__PURE__ */ registerComponentStyles(ui.EditorListGroup, layoutStyles);
export const Calendar: typeof ui.Calendar =
  /* @__PURE__ */ registerComponentStyles(ui.Calendar, calendarStyles);
export const CalendarHeader: typeof ui.CalendarHeader =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarHeader, calendarStyles);
export const CalendarWeekdays: typeof ui.CalendarWeekdays =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarWeekdays, calendarStyles);
export const CalendarDay: typeof ui.CalendarDay =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarDay, calendarStyles);
export const CalendarMonthGrid: typeof ui.CalendarMonthGrid =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarMonthGrid, calendarStyles);
export const CalendarYearGrid: typeof ui.CalendarYearGrid =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarYearGrid, calendarStyles);
export const CalendarPicker: typeof ui.CalendarPicker =
  /* @__PURE__ */ registerComponentStyles(ui.CalendarPicker, pickerStyles);
export const SharedResourcePicker: typeof ui.SharedResourcePicker =
  /* @__PURE__ */ registerComponentStyles(
    ui.SharedResourcePicker,
    pickerStyles,
  );
export const ResourcePickerAvatar: typeof ui.ResourcePickerAvatar =
  /* @__PURE__ */ registerComponentStyles(
    ui.ResourcePickerAvatar,
    pickerStyles,
  );
export const ColorPalette: typeof ui.ColorPalette =
  /* @__PURE__ */ registerComponentStyles(ui.ColorPalette, layoutStyles);
export const ColorPicker: typeof ui.ColorPicker =
  /* @__PURE__ */ registerComponentStyles(ui.ColorPicker, pickerStyles);
export const Dropdown: typeof ui.Dropdown =
  /* @__PURE__ */ registerComponentStyles(ui.Dropdown, baseStyles);
export const DropdownPopup: typeof ui.DropdownPopup =
  /* @__PURE__ */ registerComponentStyles(ui.DropdownPopup, baseStyles);
export const DropdownPopupContent: typeof ui.DropdownPopupContent =
  /* @__PURE__ */ registerComponentStyles(ui.DropdownPopupContent, baseStyles);
export const PreactRangeSlider: typeof ui.PreactRangeSlider =
  /* @__PURE__ */ registerComponentStyles(ui.PreactRangeSlider, fieldsStyles);
export const SingleValueSlider: typeof ui.SingleValueSlider =
  /* @__PURE__ */ registerComponentStyles(ui.SingleValueSlider, fieldsStyles);
export const SliderField: typeof ui.SliderField =
  /* @__PURE__ */ registerComponentStyles(ui.SliderField, fieldsStyles);
export const IconButton: typeof ui.IconButton =
  /* @__PURE__ */ registerComponentStyles(ui.IconButton, baseStyles);
export const ToggleButton: typeof ui.ToggleButton =
  /* @__PURE__ */ registerComponentStyles(ui.ToggleButton, baseStyles);
export const ButtonGroup: typeof ui.ButtonGroup =
  /* @__PURE__ */ registerComponentStyles(ui.ButtonGroup, baseStyles);
export const SegmentedControl: typeof ui.SegmentedControl =
  /* @__PURE__ */ registerComponentStyles(ui.SegmentedControl, baseStyles);
export const Tabs: typeof ui.Tabs = /* @__PURE__ */ registerComponentStyles(
  ui.Tabs,
  layoutStyles,
);
export const TabPanel: typeof ui.TabPanel =
  /* @__PURE__ */ registerComponentStyles(ui.TabPanel, layoutStyles);
export const RadioGroup: typeof ui.RadioGroup =
  /* @__PURE__ */ registerComponentStyles(ui.RadioGroup, baseStyles);
export const TextInput: typeof ui.TextInput =
  /* @__PURE__ */ registerComponentStyles(ui.TextInput, baseStyles);
export const Textarea: typeof ui.Textarea =
  /* @__PURE__ */ registerComponentStyles(ui.Textarea, baseStyles);
export const NumberInput: typeof ui.NumberInput =
  /* @__PURE__ */ registerComponentStyles(ui.NumberInput, baseStyles);
export const NumberStepper: typeof ui.NumberStepper =
  /* @__PURE__ */ registerComponentStyles(ui.NumberStepper, layoutStyles);
export const DateInput: typeof ui.DateInput =
  /* @__PURE__ */ registerComponentStyles(ui.DateInput, baseStyles);
export const TimeInput: typeof ui.TimeInput =
  /* @__PURE__ */ registerComponentStyles(ui.TimeInput, baseStyles);
export const DateTimeInput: typeof ui.DateTimeInput =
  /* @__PURE__ */ registerComponentStyles(ui.DateTimeInput, baseStyles);
export const Chip: typeof ui.Chip = /* @__PURE__ */ registerComponentStyles(
  ui.Chip,
  baseStyles,
);
export const FieldHint: typeof ui.FieldHint =
  /* @__PURE__ */ registerComponentStyles(ui.FieldHint, fieldsStyles);
export const FieldError: typeof ui.FieldError =
  /* @__PURE__ */ registerComponentStyles(ui.FieldError, fieldsStyles);
export const FormSection: typeof ui.FormSection =
  /* @__PURE__ */ registerComponentStyles(ui.FormSection, layoutStyles);
export const Disclosure: typeof ui.Disclosure =
  /* @__PURE__ */ registerComponentStyles(ui.Disclosure, layoutStyles);
export const Panel: typeof ui.Panel = /* @__PURE__ */ registerComponentStyles(
  ui.Panel,
  layoutStyles,
);
export const Toolbar: typeof ui.Toolbar =
  /* @__PURE__ */ registerComponentStyles(ui.Toolbar, layoutStyles);
export const ToolbarGroup: typeof ui.ToolbarGroup =
  /* @__PURE__ */ registerComponentStyles(ui.ToolbarGroup, layoutStyles);
export const ToolbarSeparator: typeof ui.ToolbarSeparator =
  /* @__PURE__ */ registerComponentStyles(ui.ToolbarSeparator, layoutStyles);
export const Badge: typeof ui.Badge = /* @__PURE__ */ registerComponentStyles(
  ui.Badge,
  layoutStyles,
);
export const CountBadge: typeof ui.CountBadge =
  /* @__PURE__ */ registerComponentStyles(ui.CountBadge, layoutStyles);
export const Spinner: typeof ui.Spinner =
  /* @__PURE__ */ registerComponentStyles(ui.Spinner, baseStyles);
export const LoadingOverlay: typeof ui.LoadingOverlay =
  /* @__PURE__ */ registerComponentStyles(ui.LoadingOverlay, layoutStyles);
export const EmptyState: typeof ui.EmptyState =
  /* @__PURE__ */ registerComponentStyles(ui.EmptyState, layoutStyles);
export const Menu: typeof ui.Menu = /* @__PURE__ */ registerComponentStyles(
  ui.Menu,
  layoutStyles,
);
export const MenuItem: typeof ui.MenuItem =
  /* @__PURE__ */ registerComponentStyles(ui.MenuItem, layoutStyles);
export const MenuSeparator: typeof ui.MenuSeparator =
  /* @__PURE__ */ registerComponentStyles(ui.MenuSeparator, layoutStyles);
export const Submenu: typeof ui.Submenu =
  /* @__PURE__ */ registerComponentStyles(ui.Submenu, layoutStyles);
export const ResizeHandle: typeof ui.ResizeHandle =
  /* @__PURE__ */ registerComponentStyles(ui.ResizeHandle, layoutStyles);
export const Pagination: typeof ui.Pagination =
  /* @__PURE__ */ registerComponentStyles(ui.Pagination, feedbackStyles);
export const CircularProgress: typeof ui.CircularProgress =
  /* @__PURE__ */ registerComponentStyles(ui.CircularProgress, feedbackStyles);
export const Rating: typeof ui.Rating = /* @__PURE__ */ registerComponentStyles(
  ui.Rating,
  feedbackStyles,
);
export const Button: typeof ui.Button = /* @__PURE__ */ registerComponentStyles(
  ui.Button,
  baseStyles,
);
export const Pane: typeof ui.Pane = /* @__PURE__ */ registerComponentStyles(
  ui.Pane,
  layoutStyles,
);
export const SplitLayout: typeof ui.SplitLayout =
  /* @__PURE__ */ registerComponentStyles(ui.SplitLayout, layoutStyles);
export const Alert: typeof ui.Alert = /* @__PURE__ */ registerComponentStyles(
  ui.Alert,
  layoutStyles,
);
export const Listbox: typeof ui.Listbox =
  /* @__PURE__ */ registerComponentStyles(ui.Listbox, layoutStyles);
export const ListboxOption: typeof ui.ListboxOption =
  /* @__PURE__ */ registerComponentStyles(ui.ListboxOption, layoutStyles);
export const ListboxGroup: typeof ui.ListboxGroup =
  /* @__PURE__ */ registerComponentStyles(ui.ListboxGroup, layoutStyles);
export const ListboxOptionContent: typeof ui.ListboxOptionContent =
  /* @__PURE__ */ registerComponentStyles(
    ui.ListboxOptionContent,
    layoutStyles,
  );
export const StatusFeedbackPanel: typeof ui.StatusFeedbackPanel =
  /* @__PURE__ */ registerComponentStyles(
    ui.StatusFeedbackPanel,
    feedbackStyles,
  );
export const StatusBadge: typeof ui.StatusBadge =
  /* @__PURE__ */ registerComponentStyles(ui.StatusBadge, feedbackStyles);
export const Combobox: typeof ui.Combobox =
  /* @__PURE__ */ registerComponentStyles(ui.Combobox, layoutStyles);
export const MultiSelect: typeof ui.MultiSelect =
  /* @__PURE__ */ registerComponentStyles(ui.MultiSelect, layoutStyles);
export const Avatar: typeof ui.Avatar = /* @__PURE__ */ registerComponentStyles(
  ui.Avatar,
  feedbackStyles,
);
export const ProgressBar: typeof ui.ProgressBar =
  /* @__PURE__ */ registerComponentStyles(ui.ProgressBar, feedbackStyles);
export const Popover: typeof ui.Popover =
  /* @__PURE__ */ registerComponentStyles(ui.Popover, layoutStyles);
export const Tooltip: typeof ui.Tooltip =
  /* @__PURE__ */ registerComponentStyles(ui.Tooltip, baseStyles);
export const Dialog: typeof ui.Dialog = /* @__PURE__ */ registerComponentStyles(
  ui.Dialog,
  dialogsStyles,
);
export const ConfirmDialog: typeof ui.ConfirmDialog =
  /* @__PURE__ */ registerComponentStyles(ui.ConfirmDialog, dialogsStyles);
export const DatePicker: typeof ui.DatePicker =
  /* @__PURE__ */ registerComponentStyles(ui.DatePicker, pickerStyles);
export const DateRangePicker: typeof ui.DateRangePicker =
  /* @__PURE__ */ registerComponentStyles(ui.DateRangePicker, pickerStyles);
export const DialogHeader: typeof ui.DialogHeader =
  /* @__PURE__ */ registerComponentStyles(ui.DialogHeader, dialogsStyles);
export const DialogBody: typeof ui.DialogBody =
  /* @__PURE__ */ registerComponentStyles(ui.DialogBody, dialogsStyles);
export const DialogFooter: typeof ui.DialogFooter =
  /* @__PURE__ */ registerComponentStyles(ui.DialogFooter, dialogsStyles);
export const DistributionChart: typeof ui.DistributionChart =
  /* @__PURE__ */ registerComponentStyles(ui.DistributionChart, chartsStyles);
export const BarChart: typeof ui.BarChart =
  /* @__PURE__ */ registerComponentStyles(ui.BarChart, chartsStyles);
export const LineChart: typeof ui.LineChart =
  /* @__PURE__ */ registerComponentStyles(ui.LineChart, chartsStyles);
export const AreaChart: typeof ui.AreaChart =
  /* @__PURE__ */ registerComponentStyles(ui.AreaChart, chartsStyles);
export const BrushRange: typeof ui.BrushRange =
  /* @__PURE__ */ registerComponentStyles(ui.BrushRange, chartsStyles);
export const OptionButton: typeof ui.OptionButton =
  /* @__PURE__ */ registerComponentStyles(ui.OptionButton, fieldsStyles);
export const HighlightedTextInput: typeof ui.HighlightedTextInput =
  /* @__PURE__ */ registerComponentStyles(
    ui.HighlightedTextInput,
    fieldsStyles,
  );
export const InlineFieldGroup: typeof ui.InlineFieldGroup =
  /* @__PURE__ */ registerComponentStyles(ui.InlineFieldGroup, fieldsStyles);
export const Legend: typeof ui.Legend = /* @__PURE__ */ registerComponentStyles(
  ui.Legend,
  chartsStyles,
);
export const TimeGrid: typeof ui.TimeGrid =
  /* @__PURE__ */ registerComponentStyles(ui.TimeGrid, fieldsStyles);
export const FieldIcon: typeof ui.FieldIcon =
  /* @__PURE__ */ registerComponentStyles(ui.FieldIcon, fieldsStyles);
export const FieldSummary: typeof ui.FieldSummary =
  /* @__PURE__ */ registerComponentStyles(ui.FieldSummary, fieldsStyles);
export const FieldLibrary: typeof ui.FieldLibrary =
  /* @__PURE__ */ registerComponentStyles(ui.FieldLibrary, fieldsStyles);
export const FieldGroupHeading: typeof ui.FieldGroupHeading =
  /* @__PURE__ */ registerComponentStyles(ui.FieldGroupHeading, fieldsStyles);
export const FieldGroup: typeof ui.FieldGroup =
  /* @__PURE__ */ registerComponentStyles(ui.FieldGroup, fieldsStyles);
export const FieldList: typeof ui.FieldList =
  /* @__PURE__ */ registerComponentStyles(ui.FieldList, fieldsStyles);
export const FieldRow: typeof ui.FieldRow =
  /* @__PURE__ */ registerComponentStyles(ui.FieldRow, fieldsStyles);
export const FieldContent: typeof ui.FieldContent =
  /* @__PURE__ */ registerComponentStyles(ui.FieldContent, fieldsStyles);
export const FieldItem: typeof ui.FieldItem =
  /* @__PURE__ */ registerComponentStyles(ui.FieldItem, fieldsStyles);
export const FieldLibraryList: typeof ui.FieldLibraryList =
  /* @__PURE__ */ registerComponentStyles(ui.FieldLibraryList, fieldsStyles);
export const SelectedField: typeof ui.SelectedField =
  /* @__PURE__ */ registerComponentStyles(ui.SelectedField, fieldsStyles);
export const FieldActions: typeof ui.FieldActions =
  /* @__PURE__ */ registerComponentStyles(ui.FieldActions, fieldsStyles);
export const FieldStatusBadge: typeof ui.FieldStatusBadge =
  /* @__PURE__ */ registerComponentStyles(ui.FieldStatusBadge, fieldsStyles);
export const FieldRemoveButton: typeof ui.FieldRemoveButton =
  /* @__PURE__ */ registerComponentStyles(ui.FieldRemoveButton, fieldsStyles);
export const FieldRemoveIcon: typeof ui.FieldRemoveIcon =
  /* @__PURE__ */ registerComponentStyles(ui.FieldRemoveIcon, fieldsStyles);
export const FieldDropIndicator: typeof ui.FieldDropIndicator =
  /* @__PURE__ */ registerComponentStyles(ui.FieldDropIndicator, fieldsStyles);
export const DialogForm: typeof ui.DialogForm =
  /* @__PURE__ */ registerComponentStyles(ui.DialogForm, dialogsStyles);
export const DialogCloseButton: typeof ui.DialogCloseButton =
  /* @__PURE__ */ registerComponentStyles(ui.DialogCloseButton, dialogsStyles);
export const DialogActionFooter: typeof ui.DialogActionFooter =
  /* @__PURE__ */ registerComponentStyles(ui.DialogActionFooter, dialogsStyles);
export const DialogActions: typeof ui.DialogActions =
  /* @__PURE__ */ registerComponentStyles(ui.DialogActions, dialogsStyles);
export const DialogTitleInput: typeof ui.DialogTitleInput =
  /* @__PURE__ */ registerComponentStyles(ui.DialogTitleInput, dialogsStyles);
export const EditableDialogHeader: typeof ui.EditableDialogHeader =
  /* @__PURE__ */ registerComponentStyles(
    ui.EditableDialogHeader,
    dialogsStyles,
  );
export const ControlTooltip: typeof ui.ControlTooltip =
  /* @__PURE__ */ registerComponentStyles(ui.ControlTooltip, baseStyles);
export const InspectorSection: typeof ui.InspectorSection =
  /* @__PURE__ */ registerComponentStyles(
    ui.InspectorSection,
    formattingStyles,
  );
export const IconChoiceGroup: typeof ui.IconChoiceGroup =
  /* @__PURE__ */ registerComponentStyles(ui.IconChoiceGroup, formattingStyles);
export const IconToggleButton: typeof ui.IconToggleButton =
  /* @__PURE__ */ registerComponentStyles(
    ui.IconToggleButton,
    formattingStyles,
  );
export const TypographyControls: typeof ui.TypographyControls =
  /* @__PURE__ */ registerComponentStyles(
    ui.TypographyControls,
    formattingStyles,
  );
export const ComparisonPreview: typeof ui.ComparisonPreview =
  /* @__PURE__ */ registerComponentStyles(
    ui.ComparisonPreview,
    formattingStyles,
  );
export const FilterBadgeInfoButton: typeof ui.FilterBadgeInfoButton =
  /* @__PURE__ */ registerComponentStyles(
    ui.FilterBadgeInfoButton,
    layoutStyles,
  );
export const FilterBadge: typeof ui.FilterBadge =
  /* @__PURE__ */ registerComponentStyles(ui.FilterBadge, layoutStyles);
export const RatingStar: typeof ui.RatingStar =
  /* @__PURE__ */ registerComponentStyles(ui.RatingStar, feedbackStyles);
export const RatingChoice: typeof ui.RatingChoice =
  /* @__PURE__ */ registerComponentStyles(ui.RatingChoice, feedbackStyles);
export const ReorderList: typeof ui.ReorderList =
  /* @__PURE__ */ registerComponentStyles(ui.ReorderList, layoutStyles);
export const ReorderHandle: typeof ui.ReorderHandle =
  /* @__PURE__ */ registerComponentStyles(ui.ReorderHandle, layoutStyles);
export const TimelineTrack: typeof ui.TimelineTrack =
  /* @__PURE__ */ registerComponentStyles(ui.TimelineTrack, timelineStyles);
export const ActivityMessage: typeof ui.ActivityMessage =
  /* @__PURE__ */ registerComponentStyles(ui.ActivityMessage, feedbackStyles);
export const NumberDraft: typeof ui.NumberDraft =
  /* @__PURE__ */ registerComponentStyles(ui.NumberDraft, fieldsStyles);
export const MaskedDraft: typeof ui.MaskedDraft =
  /* @__PURE__ */ registerComponentStyles(ui.MaskedDraft, fieldsStyles);
export const DurationField: typeof ui.DurationField =
  /* @__PURE__ */ registerComponentStyles(ui.DurationField, fieldsStyles);
export const DurationDraft: typeof ui.DurationDraft =
  /* @__PURE__ */ registerComponentStyles(ui.DurationDraft, fieldsStyles);
export const HtmlEditor: typeof ui.HtmlEditor =
  /* @__PURE__ */ registerComponentStyles(ui.HtmlEditor, layoutStyles);
export const TemporalPicker: typeof ui.TemporalPicker =
  /* @__PURE__ */ registerComponentStyles(ui.TemporalPicker, pickerStyles);
export const TemporalDraft: typeof ui.TemporalDraft =
  /* @__PURE__ */ registerComponentStyles(ui.TemporalDraft, pickerStyles);
export const DateTimeField: typeof ui.DateTimeField =
  /* @__PURE__ */ registerComponentStyles(ui.DateTimeField, pickerStyles);
export const AssigneePicker: typeof ui.AssigneePicker =
  /* @__PURE__ */ registerComponentStyles(ui.AssigneePicker, pickerStyles);
export const AssigneeField: typeof ui.AssigneeField =
  /* @__PURE__ */ registerComponentStyles(ui.AssigneeField, pickerStyles);
export const AssigneePickerLayout: typeof ui.AssigneePickerLayout =
  /* @__PURE__ */ registerComponentStyles(
    ui.AssigneePickerLayout,
    pickerStyles,
  );
export const AiPromptInput: typeof ui.AiPromptInput =
  /* @__PURE__ */ registerComponentStyles(ui.AiPromptInput, aiStyles);
export const AiSuggestions: typeof ui.AiSuggestions =
  /* @__PURE__ */ registerComponentStyles(ui.AiSuggestions, aiStyles);
export const AiActionStatus: typeof ui.AiActionStatus =
  /* @__PURE__ */ registerComponentStyles(ui.AiActionStatus, aiStyles);
export const AiChangePreview: typeof ui.AiChangePreview =
  /* @__PURE__ */ registerComponentStyles(ui.AiChangePreview, aiStyles);
export const AiResult: typeof ui.AiResult =
  /* @__PURE__ */ registerComponentStyles(ui.AiResult, aiStyles);
export const AiResultView: typeof ui.AiResultView =
  /* @__PURE__ */ registerComponentStyles(ui.AiResultView, aiStyles);
export const AiResultTable: typeof ui.AiResultTable =
  /* @__PURE__ */ registerComponentStyles(ui.AiResultTable, aiStyles);
export const AiResultMetrics: typeof ui.AiResultMetrics =
  /* @__PURE__ */ registerComponentStyles(ui.AiResultMetrics, aiStyles);
export const AiResultText: typeof ui.AiResultText =
  /* @__PURE__ */ registerComponentStyles(ui.AiResultText, aiStyles);
export const AiAssistant: typeof ui.AiAssistant =
  /* @__PURE__ */ registerComponentStyles(ui.AiAssistant, aiStyles);
export const AiRequestTrail: typeof ui.AiRequestTrail =
  /* @__PURE__ */ registerComponentStyles(ui.AiRequestTrail, aiStyles);
export const PdfViewer: typeof ui.PdfViewer =
  /* @__PURE__ */ registerComponentStyles(ui.PdfViewer, pdfStyles);
export const PdfViewerToolbar: typeof ui.PdfViewerToolbar =
  /* @__PURE__ */ registerComponentStyles(ui.PdfViewerToolbar, pdfStyles);
export const AiChat: typeof ui.AiChat = /* @__PURE__ */ registerComponentStyles(
  ui.AiChat,
  aiStyles,
);
export const AiChatContent: typeof ui.AiChatContent =
  /* @__PURE__ */ registerComponentStyles(ui.AiChatContent, aiStyles);
export const AiChatComposer: typeof ui.AiChatComposer =
  /* @__PURE__ */ registerComponentStyles(ui.AiChatComposer, aiStyles);
export const AiChatEmptyState: typeof ui.AiChatEmptyState =
  /* @__PURE__ */ registerComponentStyles(ui.AiChatEmptyState, aiStyles);
export const AiMessage: typeof ui.AiMessage =
  /* @__PURE__ */ registerComponentStyles(ui.AiMessage, aiStyles);
export const AiMessageContent: typeof ui.AiMessageContent =
  /* @__PURE__ */ registerComponentStyles(ui.AiMessageContent, aiStyles);
export const AiMessageActions: typeof ui.AiMessageActions =
  /* @__PURE__ */ registerComponentStyles(ui.AiMessageActions, aiStyles);
export const AiReasoning: typeof ui.AiReasoning =
  /* @__PURE__ */ registerComponentStyles(ui.AiReasoning, aiStyles);
export const AiTask: typeof ui.AiTask = /* @__PURE__ */ registerComponentStyles(
  ui.AiTask,
  aiStyles,
);
export const AiTaskItem: typeof ui.AiTaskItem =
  /* @__PURE__ */ registerComponentStyles(ui.AiTaskItem, aiStyles);
export const IconToolbar: typeof ui.IconToolbar =
  /* @__PURE__ */ registerComponentStyles(ui.IconToolbar, layoutStyles);
