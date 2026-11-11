import * as ui from './preact';
import { createReactAdapter, type ReactUiComponent } from './react-adapter';
export {
  createReactAdapter,
  type ReactUiProps,
  type UiReactHandle,
} from './react-adapter';
export const Input: ReactUiComponent<typeof ui.Input> =
  /* @__PURE__ */ createReactAdapter(ui.Input, 'Input');
export const SvgIcon: ReactUiComponent<typeof ui.SvgIcon> =
  /* @__PURE__ */ createReactAdapter(ui.SvgIcon, 'SvgIcon');
export const SvgButton: ReactUiComponent<typeof ui.SvgButton> =
  /* @__PURE__ */ createReactAdapter(ui.SvgButton, 'SvgButton');
export const DeleteButton: ReactUiComponent<typeof ui.DeleteButton> =
  /* @__PURE__ */ createReactAdapter(ui.DeleteButton, 'DeleteButton');
export const RemoveButton: ReactUiComponent<typeof ui.RemoveButton> =
  /* @__PURE__ */ createReactAdapter(ui.RemoveButton, 'RemoveButton');
export const Checkbox: ReactUiComponent<typeof ui.Checkbox> =
  /* @__PURE__ */ createReactAdapter(ui.Checkbox, 'Checkbox');
export const Switch: ReactUiComponent<typeof ui.Switch> =
  /* @__PURE__ */ createReactAdapter(ui.Switch, 'Switch');
export const SegmentedSwitch: ReactUiComponent<typeof ui.SegmentedSwitch> =
  /* @__PURE__ */ createReactAdapter(ui.SegmentedSwitch, 'SegmentedSwitch');
export const ChoiceChips: ReactUiComponent<typeof ui.ChoiceChips> =
  /* @__PURE__ */ createReactAdapter(ui.ChoiceChips, 'ChoiceChips');
export const ChoiceChipInfoButton: ReactUiComponent<
  typeof ui.ChoiceChipInfoButton
> = /* @__PURE__ */ createReactAdapter(
  ui.ChoiceChipInfoButton,
  'ChoiceChipInfoButton',
);
export const ChoiceChip: ReactUiComponent<typeof ui.ChoiceChip> =
  /* @__PURE__ */ createReactAdapter(ui.ChoiceChip, 'ChoiceChip');
export const SearchInput: ReactUiComponent<typeof ui.SearchInput> =
  /* @__PURE__ */ createReactAdapter(ui.SearchInput, 'SearchInput');
export const FilterChip: ReactUiComponent<typeof ui.FilterChip> =
  /* @__PURE__ */ createReactAdapter(ui.FilterChip, 'FilterChip');
export const FormField: ReactUiComponent<typeof ui.FormField> =
  /* @__PURE__ */ createReactAdapter(ui.FormField, 'FormField');
export const DisclosureSummary: ReactUiComponent<typeof ui.DisclosureSummary> =
  /* @__PURE__ */ createReactAdapter(ui.DisclosureSummary, 'DisclosureSummary');
export const EditorSplitLayout: ReactUiComponent<typeof ui.EditorSplitLayout> =
  /* @__PURE__ */ createReactAdapter(ui.EditorSplitLayout, 'EditorSplitLayout');
export const EditorPane: ReactUiComponent<typeof ui.EditorPane> =
  /* @__PURE__ */ createReactAdapter(ui.EditorPane, 'EditorPane');
export const EditorList: ReactUiComponent<typeof ui.EditorList> =
  /* @__PURE__ */ createReactAdapter(ui.EditorList, 'EditorList');
export const EditorListItem: ReactUiComponent<typeof ui.EditorListItem> =
  /* @__PURE__ */ createReactAdapter(ui.EditorListItem, 'EditorListItem');
export const EditorListItemContent: ReactUiComponent<
  typeof ui.EditorListItemContent
> = /* @__PURE__ */ createReactAdapter(
  ui.EditorListItemContent,
  'EditorListItemContent',
);
export const EditorListGroup: ReactUiComponent<typeof ui.EditorListGroup> =
  /* @__PURE__ */ createReactAdapter(ui.EditorListGroup, 'EditorListGroup');
export const Calendar: ReactUiComponent<typeof ui.Calendar> =
  /* @__PURE__ */ createReactAdapter(ui.Calendar, 'Calendar');
export const CalendarHeader: ReactUiComponent<typeof ui.CalendarHeader> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarHeader, 'CalendarHeader');
export const CalendarWeekdays: ReactUiComponent<typeof ui.CalendarWeekdays> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarWeekdays, 'CalendarWeekdays');
export const CalendarDay: ReactUiComponent<typeof ui.CalendarDay> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarDay, 'CalendarDay');
export const CalendarMonthGrid: ReactUiComponent<typeof ui.CalendarMonthGrid> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarMonthGrid, 'CalendarMonthGrid');
export const CalendarYearGrid: ReactUiComponent<typeof ui.CalendarYearGrid> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarYearGrid, 'CalendarYearGrid');
export const CalendarPicker: ReactUiComponent<typeof ui.CalendarPicker> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarPicker, 'CalendarPicker');
export const SharedResourcePicker: ReactUiComponent<
  typeof ui.SharedResourcePicker
> = /* @__PURE__ */ createReactAdapter(
  ui.SharedResourcePicker,
  'SharedResourcePicker',
);
export const ResourcePickerAvatar: ReactUiComponent<
  typeof ui.ResourcePickerAvatar
> = /* @__PURE__ */ createReactAdapter(
  ui.ResourcePickerAvatar,
  'ResourcePickerAvatar',
);
export const ColorPalette: ReactUiComponent<typeof ui.ColorPalette> =
  /* @__PURE__ */ createReactAdapter(ui.ColorPalette, 'ColorPalette');
export const ColorPicker: ReactUiComponent<typeof ui.ColorPicker> =
  /* @__PURE__ */ createReactAdapter(ui.ColorPicker, 'ColorPicker');
export const Dropdown: ReactUiComponent<
  typeof ui.Dropdown,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(ui.Dropdown, 'Dropdown', {
  factoryCallbacks: [
    'renderOption',
    'renderValue',
    'renderPlaceholder',
    'renderSelectedValue',
    'renderNoResults',
  ],
});
export const DropdownPopup: ReactUiComponent<typeof ui.DropdownPopup> =
  /* @__PURE__ */ createReactAdapter(ui.DropdownPopup, 'DropdownPopup');
export const DropdownPopupContent: ReactUiComponent<
  typeof ui.DropdownPopupContent,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(
  ui.DropdownPopupContent,
  'DropdownPopupContent',
  {
    factoryCallbacks: [
      'renderOption',
      'renderValue',
      'renderPlaceholder',
      'renderSelectedValue',
      'renderNoResults',
    ],
  },
);
export const PreactRangeSlider: ReactUiComponent<typeof ui.PreactRangeSlider> =
  /* @__PURE__ */ createReactAdapter(ui.PreactRangeSlider, 'PreactRangeSlider');
export const SingleValueSlider: ReactUiComponent<typeof ui.SingleValueSlider> =
  /* @__PURE__ */ createReactAdapter(ui.SingleValueSlider, 'SingleValueSlider');
export const SliderField: ReactUiComponent<typeof ui.SliderField> =
  /* @__PURE__ */ createReactAdapter(ui.SliderField, 'SliderField');
export const IconButton: ReactUiComponent<typeof ui.IconButton> =
  /* @__PURE__ */ createReactAdapter(ui.IconButton, 'IconButton');
export const ToggleButton: ReactUiComponent<typeof ui.ToggleButton> =
  /* @__PURE__ */ createReactAdapter(ui.ToggleButton, 'ToggleButton');
export const ButtonGroup: ReactUiComponent<typeof ui.ButtonGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ButtonGroup, 'ButtonGroup');
export const SegmentedControl: ReactUiComponent<typeof ui.SegmentedControl> =
  /* @__PURE__ */ createReactAdapter(ui.SegmentedControl, 'SegmentedControl');
export const Tabs: ReactUiComponent<typeof ui.Tabs> =
  /* @__PURE__ */ createReactAdapter(ui.Tabs, 'Tabs');
export const TabPanel: ReactUiComponent<typeof ui.TabPanel> =
  /* @__PURE__ */ createReactAdapter(ui.TabPanel, 'TabPanel');
export const RadioGroup: ReactUiComponent<typeof ui.RadioGroup> =
  /* @__PURE__ */ createReactAdapter(ui.RadioGroup, 'RadioGroup');
export const TextInput: ReactUiComponent<typeof ui.TextInput> =
  /* @__PURE__ */ createReactAdapter(ui.TextInput, 'TextInput');
export const Textarea: ReactUiComponent<typeof ui.Textarea> =
  /* @__PURE__ */ createReactAdapter(ui.Textarea, 'Textarea');
export const NumberInput: ReactUiComponent<typeof ui.NumberInput> =
  /* @__PURE__ */ createReactAdapter(ui.NumberInput, 'NumberInput');
export const NumberStepper: ReactUiComponent<typeof ui.NumberStepper> =
  /* @__PURE__ */ createReactAdapter(ui.NumberStepper, 'NumberStepper');
export const DateInput: ReactUiComponent<typeof ui.DateInput> =
  /* @__PURE__ */ createReactAdapter(ui.DateInput, 'DateInput');
export const TimeInput: ReactUiComponent<typeof ui.TimeInput> =
  /* @__PURE__ */ createReactAdapter(ui.TimeInput, 'TimeInput');
export const DateTimeInput: ReactUiComponent<typeof ui.DateTimeInput> =
  /* @__PURE__ */ createReactAdapter(ui.DateTimeInput, 'DateTimeInput');
export const Chip: ReactUiComponent<typeof ui.Chip> =
  /* @__PURE__ */ createReactAdapter(ui.Chip, 'Chip');
export const FieldHint: ReactUiComponent<typeof ui.FieldHint> =
  /* @__PURE__ */ createReactAdapter(ui.FieldHint, 'FieldHint');
export const FieldError: ReactUiComponent<typeof ui.FieldError> =
  /* @__PURE__ */ createReactAdapter(ui.FieldError, 'FieldError');
export const FormSection: ReactUiComponent<typeof ui.FormSection> =
  /* @__PURE__ */ createReactAdapter(ui.FormSection, 'FormSection');
export const Disclosure: ReactUiComponent<typeof ui.Disclosure> =
  /* @__PURE__ */ createReactAdapter(ui.Disclosure, 'Disclosure');
export const Panel: ReactUiComponent<typeof ui.Panel> =
  /* @__PURE__ */ createReactAdapter(ui.Panel, 'Panel');
export const Toolbar: ReactUiComponent<typeof ui.Toolbar> =
  /* @__PURE__ */ createReactAdapter(ui.Toolbar, 'Toolbar');
export const ToolbarGroup: ReactUiComponent<typeof ui.ToolbarGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ToolbarGroup, 'ToolbarGroup');
export const ToolbarSeparator: ReactUiComponent<typeof ui.ToolbarSeparator> =
  /* @__PURE__ */ createReactAdapter(ui.ToolbarSeparator, 'ToolbarSeparator');
export const Badge: ReactUiComponent<typeof ui.Badge> =
  /* @__PURE__ */ createReactAdapter(ui.Badge, 'Badge');
export const CountBadge: ReactUiComponent<typeof ui.CountBadge> =
  /* @__PURE__ */ createReactAdapter(ui.CountBadge, 'CountBadge');
export const Spinner: ReactUiComponent<typeof ui.Spinner> =
  /* @__PURE__ */ createReactAdapter(ui.Spinner, 'Spinner');
export const LoadingOverlay: ReactUiComponent<typeof ui.LoadingOverlay> =
  /* @__PURE__ */ createReactAdapter(ui.LoadingOverlay, 'LoadingOverlay');
export const EmptyState: ReactUiComponent<typeof ui.EmptyState> =
  /* @__PURE__ */ createReactAdapter(ui.EmptyState, 'EmptyState');
export const Menu: ReactUiComponent<typeof ui.Menu> =
  /* @__PURE__ */ createReactAdapter(ui.Menu, 'Menu');
export const MenuItem: ReactUiComponent<typeof ui.MenuItem> =
  /* @__PURE__ */ createReactAdapter(ui.MenuItem, 'MenuItem');
export const MenuSeparator: ReactUiComponent<typeof ui.MenuSeparator> =
  /* @__PURE__ */ createReactAdapter(ui.MenuSeparator, 'MenuSeparator');
export const Submenu: ReactUiComponent<typeof ui.Submenu> =
  /* @__PURE__ */ createReactAdapter(ui.Submenu, 'Submenu');
export const ResizeHandle: ReactUiComponent<typeof ui.ResizeHandle> =
  /* @__PURE__ */ createReactAdapter(ui.ResizeHandle, 'ResizeHandle');
export const Pagination: ReactUiComponent<typeof ui.Pagination> =
  /* @__PURE__ */ createReactAdapter(ui.Pagination, 'Pagination');
export const CircularProgress: ReactUiComponent<typeof ui.CircularProgress> =
  /* @__PURE__ */ createReactAdapter(ui.CircularProgress, 'CircularProgress');
export const Rating: ReactUiComponent<typeof ui.Rating> =
  /* @__PURE__ */ createReactAdapter(ui.Rating, 'Rating');
export const Button: ReactUiComponent<typeof ui.Button> =
  /* @__PURE__ */ createReactAdapter(ui.Button, 'Button');
export const Pane: ReactUiComponent<typeof ui.Pane> =
  /* @__PURE__ */ createReactAdapter(ui.Pane, 'Pane');
export const SplitLayout: ReactUiComponent<typeof ui.SplitLayout> =
  /* @__PURE__ */ createReactAdapter(ui.SplitLayout, 'SplitLayout');
export const Alert: ReactUiComponent<typeof ui.Alert> =
  /* @__PURE__ */ createReactAdapter(ui.Alert, 'Alert');
export const Listbox: ReactUiComponent<typeof ui.Listbox> =
  /* @__PURE__ */ createReactAdapter(ui.Listbox, 'Listbox');
export const ListboxOption: ReactUiComponent<typeof ui.ListboxOption> =
  /* @__PURE__ */ createReactAdapter(ui.ListboxOption, 'ListboxOption');
export const ListboxGroup: ReactUiComponent<typeof ui.ListboxGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ListboxGroup, 'ListboxGroup');
export const ListboxOptionContent: ReactUiComponent<
  typeof ui.ListboxOptionContent
> = /* @__PURE__ */ createReactAdapter(
  ui.ListboxOptionContent,
  'ListboxOptionContent',
);
export const StatusFeedbackPanel: ReactUiComponent<
  typeof ui.StatusFeedbackPanel
> = /* @__PURE__ */ createReactAdapter(
  ui.StatusFeedbackPanel,
  'StatusFeedbackPanel',
);
export const StatusBadge: ReactUiComponent<typeof ui.StatusBadge> =
  /* @__PURE__ */ createReactAdapter(ui.StatusBadge, 'StatusBadge');
export const Combobox: ReactUiComponent<
  typeof ui.Combobox,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(ui.Combobox, 'Combobox', {
  factoryCallbacks: [
    'renderOption',
    'renderValue',
    'renderPlaceholder',
    'renderSelectedValue',
    'renderNoResults',
  ],
});
export const MultiSelect: ReactUiComponent<
  typeof ui.MultiSelect,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(ui.MultiSelect, 'MultiSelect', {
  factoryCallbacks: [
    'renderOption',
    'renderValue',
    'renderPlaceholder',
    'renderSelectedValue',
    'renderNoResults',
  ],
});
export const Avatar: ReactUiComponent<typeof ui.Avatar> =
  /* @__PURE__ */ createReactAdapter(ui.Avatar, 'Avatar');
export const ProgressBar: ReactUiComponent<typeof ui.ProgressBar> =
  /* @__PURE__ */ createReactAdapter(ui.ProgressBar, 'ProgressBar');
export const Popover: ReactUiComponent<typeof ui.Popover> =
  /* @__PURE__ */ createReactAdapter(ui.Popover, 'Popover');
export const Tooltip: ReactUiComponent<typeof ui.Tooltip> =
  /* @__PURE__ */ createReactAdapter(ui.Tooltip, 'Tooltip');
export const Dialog: ReactUiComponent<typeof ui.Dialog> =
  /* @__PURE__ */ createReactAdapter(ui.Dialog, 'Dialog');
export const ConfirmDialog: ReactUiComponent<typeof ui.ConfirmDialog> =
  /* @__PURE__ */ createReactAdapter(ui.ConfirmDialog, 'ConfirmDialog');
export const DatePicker: ReactUiComponent<typeof ui.DatePicker> =
  /* @__PURE__ */ createReactAdapter(ui.DatePicker, 'DatePicker');
export const DateRangePicker: ReactUiComponent<typeof ui.DateRangePicker> =
  /* @__PURE__ */ createReactAdapter(ui.DateRangePicker, 'DateRangePicker');
export const DialogHeader: ReactUiComponent<typeof ui.DialogHeader> =
  /* @__PURE__ */ createReactAdapter(ui.DialogHeader, 'DialogHeader');
export const DialogBody: ReactUiComponent<typeof ui.DialogBody> =
  /* @__PURE__ */ createReactAdapter(ui.DialogBody, 'DialogBody');
export const DialogFooter: ReactUiComponent<typeof ui.DialogFooter> =
  /* @__PURE__ */ createReactAdapter(ui.DialogFooter, 'DialogFooter');
export const DistributionChart: ReactUiComponent<typeof ui.DistributionChart> =
  /* @__PURE__ */ createReactAdapter(ui.DistributionChart, 'DistributionChart');
export const BarChart: ReactUiComponent<typeof ui.BarChart> =
  /* @__PURE__ */ createReactAdapter(ui.BarChart, 'BarChart');
export const LineChart: ReactUiComponent<typeof ui.LineChart> =
  /* @__PURE__ */ createReactAdapter(ui.LineChart, 'LineChart');
export const AreaChart: ReactUiComponent<typeof ui.AreaChart> =
  /* @__PURE__ */ createReactAdapter(ui.AreaChart, 'AreaChart');
export const BrushRange: ReactUiComponent<typeof ui.BrushRange> =
  /* @__PURE__ */ createReactAdapter(ui.BrushRange, 'BrushRange');
export const OptionButton: ReactUiComponent<typeof ui.OptionButton> =
  /* @__PURE__ */ createReactAdapter(ui.OptionButton, 'OptionButton');
export const HighlightedTextInput: ReactUiComponent<
  typeof ui.HighlightedTextInput
> = /* @__PURE__ */ createReactAdapter(
  ui.HighlightedTextInput,
  'HighlightedTextInput',
);
export const InlineFieldGroup: ReactUiComponent<typeof ui.InlineFieldGroup> =
  /* @__PURE__ */ createReactAdapter(ui.InlineFieldGroup, 'InlineFieldGroup');
export const Legend: ReactUiComponent<typeof ui.Legend> =
  /* @__PURE__ */ createReactAdapter(ui.Legend, 'Legend');
export const TimeGrid: ReactUiComponent<typeof ui.TimeGrid> =
  /* @__PURE__ */ createReactAdapter(ui.TimeGrid, 'TimeGrid');
export const FieldIcon: ReactUiComponent<typeof ui.FieldIcon> =
  /* @__PURE__ */ createReactAdapter(ui.FieldIcon, 'FieldIcon');
export const FieldSummary: ReactUiComponent<typeof ui.FieldSummary> =
  /* @__PURE__ */ createReactAdapter(ui.FieldSummary, 'FieldSummary');
export const FieldLibrary: ReactUiComponent<typeof ui.FieldLibrary> =
  /* @__PURE__ */ createReactAdapter(ui.FieldLibrary, 'FieldLibrary');
export const FieldGroupHeading: ReactUiComponent<typeof ui.FieldGroupHeading> =
  /* @__PURE__ */ createReactAdapter(ui.FieldGroupHeading, 'FieldGroupHeading');
export const FieldGroup: ReactUiComponent<typeof ui.FieldGroup> =
  /* @__PURE__ */ createReactAdapter(ui.FieldGroup, 'FieldGroup');
export const FieldList: ReactUiComponent<typeof ui.FieldList> =
  /* @__PURE__ */ createReactAdapter(ui.FieldList, 'FieldList');
export const FieldRow: ReactUiComponent<typeof ui.FieldRow> =
  /* @__PURE__ */ createReactAdapter(ui.FieldRow, 'FieldRow');
export const FieldContent: ReactUiComponent<typeof ui.FieldContent> =
  /* @__PURE__ */ createReactAdapter(ui.FieldContent, 'FieldContent');
export const FieldItem: ReactUiComponent<typeof ui.FieldItem> =
  /* @__PURE__ */ createReactAdapter(ui.FieldItem, 'FieldItem');
export const FieldLibraryList: ReactUiComponent<typeof ui.FieldLibraryList> =
  /* @__PURE__ */ createReactAdapter(ui.FieldLibraryList, 'FieldLibraryList');
export const SelectedField: ReactUiComponent<typeof ui.SelectedField> =
  /* @__PURE__ */ createReactAdapter(ui.SelectedField, 'SelectedField');
export const FieldActions: ReactUiComponent<typeof ui.FieldActions> =
  /* @__PURE__ */ createReactAdapter(ui.FieldActions, 'FieldActions');
export const FieldStatusBadge: ReactUiComponent<typeof ui.FieldStatusBadge> =
  /* @__PURE__ */ createReactAdapter(ui.FieldStatusBadge, 'FieldStatusBadge');
export const FieldRemoveButton: ReactUiComponent<typeof ui.FieldRemoveButton> =
  /* @__PURE__ */ createReactAdapter(ui.FieldRemoveButton, 'FieldRemoveButton');
export const FieldRemoveIcon: ReactUiComponent<typeof ui.FieldRemoveIcon> =
  /* @__PURE__ */ createReactAdapter(ui.FieldRemoveIcon, 'FieldRemoveIcon');
export const FieldDropIndicator: ReactUiComponent<
  typeof ui.FieldDropIndicator
> = /* @__PURE__ */ createReactAdapter(
  ui.FieldDropIndicator,
  'FieldDropIndicator',
);
export const DialogForm: ReactUiComponent<typeof ui.DialogForm> =
  /* @__PURE__ */ createReactAdapter(ui.DialogForm, 'DialogForm');
export const DialogCloseButton: ReactUiComponent<typeof ui.DialogCloseButton> =
  /* @__PURE__ */ createReactAdapter(ui.DialogCloseButton, 'DialogCloseButton');
export const DialogActionFooter: ReactUiComponent<
  typeof ui.DialogActionFooter
> = /* @__PURE__ */ createReactAdapter(
  ui.DialogActionFooter,
  'DialogActionFooter',
);
export const DialogActions: ReactUiComponent<typeof ui.DialogActions> =
  /* @__PURE__ */ createReactAdapter(ui.DialogActions, 'DialogActions');
export const DialogTitleInput: ReactUiComponent<typeof ui.DialogTitleInput> =
  /* @__PURE__ */ createReactAdapter(ui.DialogTitleInput, 'DialogTitleInput');
export const EditableDialogHeader: ReactUiComponent<
  typeof ui.EditableDialogHeader
> = /* @__PURE__ */ createReactAdapter(
  ui.EditableDialogHeader,
  'EditableDialogHeader',
);
export const ControlTooltip: ReactUiComponent<typeof ui.ControlTooltip> =
  /* @__PURE__ */ createReactAdapter(ui.ControlTooltip, 'ControlTooltip');
export const InspectorSection: ReactUiComponent<typeof ui.InspectorSection> =
  /* @__PURE__ */ createReactAdapter(ui.InspectorSection, 'InspectorSection');
export const IconChoiceGroup: ReactUiComponent<typeof ui.IconChoiceGroup> =
  /* @__PURE__ */ createReactAdapter(ui.IconChoiceGroup, 'IconChoiceGroup');
export const IconToggleButton: ReactUiComponent<typeof ui.IconToggleButton> =
  /* @__PURE__ */ createReactAdapter(ui.IconToggleButton, 'IconToggleButton');
export const TypographyControls: ReactUiComponent<
  typeof ui.TypographyControls
> = /* @__PURE__ */ createReactAdapter(
  ui.TypographyControls,
  'TypographyControls',
);
export const ComparisonPreview: ReactUiComponent<typeof ui.ComparisonPreview> =
  /* @__PURE__ */ createReactAdapter(ui.ComparisonPreview, 'ComparisonPreview');
export const FilterBadgeInfoButton: ReactUiComponent<
  typeof ui.FilterBadgeInfoButton
> = /* @__PURE__ */ createReactAdapter(
  ui.FilterBadgeInfoButton,
  'FilterBadgeInfoButton',
);
export const FilterBadge: ReactUiComponent<typeof ui.FilterBadge> =
  /* @__PURE__ */ createReactAdapter(ui.FilterBadge, 'FilterBadge');
export const RatingStar: ReactUiComponent<typeof ui.RatingStar> =
  /* @__PURE__ */ createReactAdapter(ui.RatingStar, 'RatingStar');
export const RatingChoice: ReactUiComponent<typeof ui.RatingChoice> =
  /* @__PURE__ */ createReactAdapter(ui.RatingChoice, 'RatingChoice');
export const ReorderList: ReactUiComponent<typeof ui.ReorderList> =
  /* @__PURE__ */ createReactAdapter(ui.ReorderList, 'ReorderList');
export const ReorderHandle: ReactUiComponent<typeof ui.ReorderHandle> =
  /* @__PURE__ */ createReactAdapter(ui.ReorderHandle, 'ReorderHandle');
export const TimelineTrack: ReactUiComponent<typeof ui.TimelineTrack> =
  /* @__PURE__ */ createReactAdapter(ui.TimelineTrack, 'TimelineTrack');
export const ActivityMessage: ReactUiComponent<typeof ui.ActivityMessage> =
  /* @__PURE__ */ createReactAdapter(ui.ActivityMessage, 'ActivityMessage');
export const NumberDraft: ReactUiComponent<typeof ui.NumberDraft> =
  /* @__PURE__ */ createReactAdapter(ui.NumberDraft, 'NumberDraft');
export const MaskedDraft: ReactUiComponent<typeof ui.MaskedDraft> =
  /* @__PURE__ */ createReactAdapter(ui.MaskedDraft, 'MaskedDraft');
export const DurationField: ReactUiComponent<typeof ui.DurationField> =
  /* @__PURE__ */ createReactAdapter(ui.DurationField, 'DurationField');
export const DurationDraft: ReactUiComponent<typeof ui.DurationDraft> =
  /* @__PURE__ */ createReactAdapter(ui.DurationDraft, 'DurationDraft');
export const HtmlEditor: ReactUiComponent<typeof ui.HtmlEditor> =
  /* @__PURE__ */ createReactAdapter(ui.HtmlEditor, 'HtmlEditor');
export const TemporalPicker: ReactUiComponent<typeof ui.TemporalPicker> =
  /* @__PURE__ */ createReactAdapter(ui.TemporalPicker, 'TemporalPicker');
export const TemporalDraft: ReactUiComponent<typeof ui.TemporalDraft> =
  /* @__PURE__ */ createReactAdapter(ui.TemporalDraft, 'TemporalDraft');
export const DateTimeField: ReactUiComponent<typeof ui.DateTimeField> =
  /* @__PURE__ */ createReactAdapter(ui.DateTimeField, 'DateTimeField');
export const AssigneePicker: ReactUiComponent<typeof ui.AssigneePicker> =
  /* @__PURE__ */ createReactAdapter(ui.AssigneePicker, 'AssigneePicker');
export const AssigneeField: ReactUiComponent<typeof ui.AssigneeField> =
  /* @__PURE__ */ createReactAdapter(ui.AssigneeField, 'AssigneeField');
export const AssigneePickerLayout: ReactUiComponent<
  typeof ui.AssigneePickerLayout
> = /* @__PURE__ */ createReactAdapter(
  ui.AssigneePickerLayout,
  'AssigneePickerLayout',
);

export const AiPromptInput: ReactUiComponent<typeof ui.AiPromptInput> =
  /* @__PURE__ */ createReactAdapter(ui.AiPromptInput, 'AiPromptInput');
export const AiSuggestions: ReactUiComponent<typeof ui.AiSuggestions> =
  /* @__PURE__ */ createReactAdapter(ui.AiSuggestions, 'AiSuggestions');
export const AiActionStatus: ReactUiComponent<typeof ui.AiActionStatus> =
  /* @__PURE__ */ createReactAdapter(ui.AiActionStatus, 'AiActionStatus');
export const AiChangePreview: ReactUiComponent<typeof ui.AiChangePreview> =
  /* @__PURE__ */ createReactAdapter(ui.AiChangePreview, 'AiChangePreview');
export const AiResult: ReactUiComponent<typeof ui.AiResult> =
  /* @__PURE__ */ createReactAdapter(ui.AiResult, 'AiResult');
export const AiResultView: ReactUiComponent<typeof ui.AiResultView> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultView, 'AiResultView');
export const AiResultTable: ReactUiComponent<typeof ui.AiResultTable> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultTable, 'AiResultTable');
export const AiResultMetrics: ReactUiComponent<typeof ui.AiResultMetrics> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultMetrics, 'AiResultMetrics');
export const AiResultText: ReactUiComponent<typeof ui.AiResultText> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultText, 'AiResultText');
export const AiAssistant: ReactUiComponent<typeof ui.AiAssistant> =
  /* @__PURE__ */ createReactAdapter(ui.AiAssistant, 'AiAssistant');
export const AiRequestTrail: ReactUiComponent<typeof ui.AiRequestTrail> =
  /* @__PURE__ */ createReactAdapter(ui.AiRequestTrail, 'AiRequestTrail');
export const PdfViewer: ReactUiComponent<typeof ui.PdfViewer> =
  /* @__PURE__ */ createReactAdapter(ui.PdfViewer, 'PdfViewer');

export const PdfViewerToolbar = /* @__PURE__ */ createReactAdapter(
  ui.PdfViewerToolbar,
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

export const AiChat: ReactUiComponent<typeof ui.AiChat> =
  /* @__PURE__ */ createReactAdapter(ui.AiChat, 'AiChat');
export const AiChatContent: ReactUiComponent<typeof ui.AiChatContent> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatContent, 'AiChatContent');
export const AiChatComposer: ReactUiComponent<typeof ui.AiChatComposer> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatComposer, 'AiChatComposer');
export const AiChatEmptyState: ReactUiComponent<typeof ui.AiChatEmptyState> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatEmptyState, 'AiChatEmptyState');
export const AiMessage: ReactUiComponent<typeof ui.AiMessage> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessage, 'AiMessage');
export const AiMessageContent: ReactUiComponent<typeof ui.AiMessageContent> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessageContent, 'AiMessageContent');
export const AiMessageActions: ReactUiComponent<typeof ui.AiMessageActions> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessageActions, 'AiMessageActions');
export const AiReasoning: ReactUiComponent<typeof ui.AiReasoning> =
  /* @__PURE__ */ createReactAdapter(ui.AiReasoning, 'AiReasoning');
export const AiTask: ReactUiComponent<typeof ui.AiTask> =
  /* @__PURE__ */ createReactAdapter(ui.AiTask, 'AiTask');
export const AiTaskItem: ReactUiComponent<typeof ui.AiTaskItem> =
  /* @__PURE__ */ createReactAdapter(ui.AiTaskItem, 'AiTaskItem');

export const IconToolbar: ReactUiComponent<typeof ui.IconToolbar> =
  /* @__PURE__ */ createReactAdapter(ui.IconToolbar, 'IconToolbar');

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
