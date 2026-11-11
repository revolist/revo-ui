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
} from './react-styles';
import * as ui from './preact';
import { createReactAdapter, type ReactUiComponent } from './react-adapter';
export {
  createReactAdapter,
  type ReactUiProps,
  type UiReactHandle,
} from './react-adapter';
import { NumberDraft as PreactNumberDraft } from './number-input/index';
import { MaskedDraft as PreactMaskedDraft } from './masked-input/index';
import { DurationField as PreactDurationField } from './duration/index';
import { DurationDraft as PreactDurationDraft } from './duration/index';
import { HtmlEditor as PreactHtmlEditor } from './rich-text/index';
import { TemporalPicker as PreactTemporalPicker } from './date-time/index';
import { TemporalDraft as PreactTemporalDraft } from './date-time/index';
import { DateTimeField as PreactDateTimeField } from './date-time/index';
import { AssigneePicker as PreactAssigneePicker } from './assignee/index';
import { AssigneeField as PreactAssigneeField } from './assignee/index';
import { AssigneePickerLayout as PreactAssigneePickerLayout } from './assignee/index';
export const Input: ReactUiComponent<typeof ui.Input> =
  /* @__PURE__ */ createReactAdapter(ui.Input, 'Input', { styles: baseStyles });
export const SvgIcon: ReactUiComponent<typeof ui.SvgIcon> =
  /* @__PURE__ */ createReactAdapter(ui.SvgIcon, 'SvgIcon', {
    styles: baseStyles,
  });
export const SvgButton: ReactUiComponent<typeof ui.SvgButton> =
  /* @__PURE__ */ createReactAdapter(ui.SvgButton, 'SvgButton', {
    styles: baseStyles,
  });
export const DeleteButton: ReactUiComponent<typeof ui.DeleteButton> =
  /* @__PURE__ */ createReactAdapter(ui.DeleteButton, 'DeleteButton', {
    styles: baseStyles,
  });
export const RemoveButton: ReactUiComponent<typeof ui.RemoveButton> =
  /* @__PURE__ */ createReactAdapter(ui.RemoveButton, 'RemoveButton', {
    styles: baseStyles,
  });
export const Checkbox: ReactUiComponent<typeof ui.Checkbox> =
  /* @__PURE__ */ createReactAdapter(ui.Checkbox, 'Checkbox', {
    styles: baseStyles,
  });
export const Switch: ReactUiComponent<typeof ui.Switch> =
  /* @__PURE__ */ createReactAdapter(ui.Switch, 'Switch', {
    styles: baseStyles,
  });
export const SegmentedSwitch: ReactUiComponent<typeof ui.SegmentedSwitch> =
  /* @__PURE__ */ createReactAdapter(ui.SegmentedSwitch, 'SegmentedSwitch', {
    styles: baseStyles,
  });
export const ChoiceChips: ReactUiComponent<typeof ui.ChoiceChips> =
  /* @__PURE__ */ createReactAdapter(ui.ChoiceChips, 'ChoiceChips', {
    styles: layoutStyles,
  });
export const ChoiceChipInfoButton: ReactUiComponent<
  typeof ui.ChoiceChipInfoButton
> = /* @__PURE__ */ createReactAdapter(
  ui.ChoiceChipInfoButton,
  'ChoiceChipInfoButton',
  { styles: layoutStyles },
);
export const ChoiceChip: ReactUiComponent<typeof ui.ChoiceChip> =
  /* @__PURE__ */ createReactAdapter(ui.ChoiceChip, 'ChoiceChip', {
    styles: layoutStyles,
  });
export const SearchInput: ReactUiComponent<typeof ui.SearchInput> =
  /* @__PURE__ */ createReactAdapter(ui.SearchInput, 'SearchInput', {
    styles: layoutStyles,
  });
export const FilterChip: ReactUiComponent<typeof ui.FilterChip> =
  /* @__PURE__ */ createReactAdapter(ui.FilterChip, 'FilterChip', {
    styles: layoutStyles,
  });
export const FormField: ReactUiComponent<typeof ui.FormField> =
  /* @__PURE__ */ createReactAdapter(ui.FormField, 'FormField', {
    styles: layoutStyles,
  });
export const DisclosureSummary: ReactUiComponent<typeof ui.DisclosureSummary> =
  /* @__PURE__ */ createReactAdapter(
    ui.DisclosureSummary,
    'DisclosureSummary',
    { styles: layoutStyles },
  );
export const EditorSplitLayout: ReactUiComponent<typeof ui.EditorSplitLayout> =
  /* @__PURE__ */ createReactAdapter(
    ui.EditorSplitLayout,
    'EditorSplitLayout',
    { styles: layoutStyles },
  );
export const EditorPane: ReactUiComponent<typeof ui.EditorPane> =
  /* @__PURE__ */ createReactAdapter(ui.EditorPane, 'EditorPane', {
    styles: layoutStyles,
  });
export const EditorList: ReactUiComponent<typeof ui.EditorList> =
  /* @__PURE__ */ createReactAdapter(ui.EditorList, 'EditorList', {
    styles: layoutStyles,
  });
export const EditorListItem: ReactUiComponent<typeof ui.EditorListItem> =
  /* @__PURE__ */ createReactAdapter(ui.EditorListItem, 'EditorListItem', {
    styles: layoutStyles,
  });
export const EditorListItemContent: ReactUiComponent<
  typeof ui.EditorListItemContent
> = /* @__PURE__ */ createReactAdapter(
  ui.EditorListItemContent,
  'EditorListItemContent',
  { styles: layoutStyles },
);
export const EditorListGroup: ReactUiComponent<typeof ui.EditorListGroup> =
  /* @__PURE__ */ createReactAdapter(ui.EditorListGroup, 'EditorListGroup', {
    styles: layoutStyles,
  });
export const Calendar: ReactUiComponent<typeof ui.Calendar> =
  /* @__PURE__ */ createReactAdapter(ui.Calendar, 'Calendar', {
    styles: calendarStyles,
  });
export const CalendarHeader: ReactUiComponent<typeof ui.CalendarHeader> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarHeader, 'CalendarHeader', {
    styles: calendarStyles,
  });
export const CalendarWeekdays: ReactUiComponent<typeof ui.CalendarWeekdays> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarWeekdays, 'CalendarWeekdays', {
    styles: calendarStyles,
  });
export const CalendarDay: ReactUiComponent<typeof ui.CalendarDay> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarDay, 'CalendarDay', {
    styles: calendarStyles,
  });
export const CalendarMonthGrid: ReactUiComponent<typeof ui.CalendarMonthGrid> =
  /* @__PURE__ */ createReactAdapter(
    ui.CalendarMonthGrid,
    'CalendarMonthGrid',
    { styles: calendarStyles },
  );
export const CalendarYearGrid: ReactUiComponent<typeof ui.CalendarYearGrid> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarYearGrid, 'CalendarYearGrid', {
    styles: calendarStyles,
  });
export const CalendarPicker: ReactUiComponent<typeof ui.CalendarPicker> =
  /* @__PURE__ */ createReactAdapter(ui.CalendarPicker, 'CalendarPicker', {
    styles: pickerStyles,
  });
export const SharedResourcePicker: ReactUiComponent<
  typeof ui.SharedResourcePicker
> = /* @__PURE__ */ createReactAdapter(
  ui.SharedResourcePicker,
  'SharedResourcePicker',
  { styles: pickerStyles },
);
export const ResourcePickerAvatar: ReactUiComponent<
  typeof ui.ResourcePickerAvatar
> = /* @__PURE__ */ createReactAdapter(
  ui.ResourcePickerAvatar,
  'ResourcePickerAvatar',
  { styles: pickerStyles },
);
export const ColorPalette: ReactUiComponent<typeof ui.ColorPalette> =
  /* @__PURE__ */ createReactAdapter(ui.ColorPalette, 'ColorPalette', {
    styles: layoutStyles,
  });
export const ColorPicker: ReactUiComponent<typeof ui.ColorPicker> =
  /* @__PURE__ */ createReactAdapter(ui.ColorPicker, 'ColorPicker', {
    styles: pickerStyles,
  });
export const Dropdown: ReactUiComponent<
  typeof ui.Dropdown,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(ui.Dropdown, 'Dropdown', {
  styles: baseStyles,
  factoryCallbacks: [
    'renderOption',
    'renderValue',
    'renderPlaceholder',
    'renderSelectedValue',
    'renderNoResults',
  ],
});
export const DropdownPopup: ReactUiComponent<typeof ui.DropdownPopup> =
  /* @__PURE__ */ createReactAdapter(ui.DropdownPopup, 'DropdownPopup', {
    styles: baseStyles,
  });
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
    styles: baseStyles,
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
  /* @__PURE__ */ createReactAdapter(
    ui.PreactRangeSlider,
    'PreactRangeSlider',
    { styles: fieldsStyles },
  );
export const SingleValueSlider: ReactUiComponent<typeof ui.SingleValueSlider> =
  /* @__PURE__ */ createReactAdapter(
    ui.SingleValueSlider,
    'SingleValueSlider',
    { styles: fieldsStyles },
  );
export const SliderField: ReactUiComponent<typeof ui.SliderField> =
  /* @__PURE__ */ createReactAdapter(ui.SliderField, 'SliderField', {
    styles: fieldsStyles,
  });
export const IconButton: ReactUiComponent<typeof ui.IconButton> =
  /* @__PURE__ */ createReactAdapter(ui.IconButton, 'IconButton', {
    styles: baseStyles,
  });
export const ToggleButton: ReactUiComponent<typeof ui.ToggleButton> =
  /* @__PURE__ */ createReactAdapter(ui.ToggleButton, 'ToggleButton', {
    styles: baseStyles,
  });
export const ButtonGroup: ReactUiComponent<typeof ui.ButtonGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ButtonGroup, 'ButtonGroup', {
    styles: baseStyles,
  });
export const SegmentedControl: ReactUiComponent<typeof ui.SegmentedControl> =
  /* @__PURE__ */ createReactAdapter(ui.SegmentedControl, 'SegmentedControl', {
    styles: baseStyles,
  });
export const Tabs: ReactUiComponent<typeof ui.Tabs> =
  /* @__PURE__ */ createReactAdapter(ui.Tabs, 'Tabs', { styles: layoutStyles });
export const TabPanel: ReactUiComponent<typeof ui.TabPanel> =
  /* @__PURE__ */ createReactAdapter(ui.TabPanel, 'TabPanel', {
    styles: layoutStyles,
  });
export const RadioGroup: ReactUiComponent<typeof ui.RadioGroup> =
  /* @__PURE__ */ createReactAdapter(ui.RadioGroup, 'RadioGroup', {
    styles: baseStyles,
  });
export const TextInput: ReactUiComponent<typeof ui.TextInput> =
  /* @__PURE__ */ createReactAdapter(ui.TextInput, 'TextInput', {
    styles: baseStyles,
  });
export const Textarea: ReactUiComponent<typeof ui.Textarea> =
  /* @__PURE__ */ createReactAdapter(ui.Textarea, 'Textarea', {
    styles: baseStyles,
  });
export const NumberInput: ReactUiComponent<typeof ui.NumberInput> =
  /* @__PURE__ */ createReactAdapter(ui.NumberInput, 'NumberInput', {
    styles: baseStyles,
  });
export const NumberStepper: ReactUiComponent<typeof ui.NumberStepper> =
  /* @__PURE__ */ createReactAdapter(ui.NumberStepper, 'NumberStepper', {
    styles: layoutStyles,
  });
export const DateInput: ReactUiComponent<typeof ui.DateInput> =
  /* @__PURE__ */ createReactAdapter(ui.DateInput, 'DateInput', {
    styles: baseStyles,
  });
export const TimeInput: ReactUiComponent<typeof ui.TimeInput> =
  /* @__PURE__ */ createReactAdapter(ui.TimeInput, 'TimeInput', {
    styles: baseStyles,
  });
export const DateTimeInput: ReactUiComponent<typeof ui.DateTimeInput> =
  /* @__PURE__ */ createReactAdapter(ui.DateTimeInput, 'DateTimeInput', {
    styles: baseStyles,
  });
export const Chip: ReactUiComponent<typeof ui.Chip> =
  /* @__PURE__ */ createReactAdapter(ui.Chip, 'Chip', { styles: baseStyles });
export const FieldHint: ReactUiComponent<typeof ui.FieldHint> =
  /* @__PURE__ */ createReactAdapter(ui.FieldHint, 'FieldHint', {
    styles: fieldsStyles,
  });
export const FieldError: ReactUiComponent<typeof ui.FieldError> =
  /* @__PURE__ */ createReactAdapter(ui.FieldError, 'FieldError', {
    styles: fieldsStyles,
  });
export const FormSection: ReactUiComponent<typeof ui.FormSection> =
  /* @__PURE__ */ createReactAdapter(ui.FormSection, 'FormSection', {
    styles: layoutStyles,
  });
export const Disclosure: ReactUiComponent<typeof ui.Disclosure> =
  /* @__PURE__ */ createReactAdapter(ui.Disclosure, 'Disclosure', {
    styles: layoutStyles,
  });
export const Panel: ReactUiComponent<typeof ui.Panel> =
  /* @__PURE__ */ createReactAdapter(ui.Panel, 'Panel', {
    styles: layoutStyles,
  });
export const Toolbar: ReactUiComponent<typeof ui.Toolbar> =
  /* @__PURE__ */ createReactAdapter(ui.Toolbar, 'Toolbar', {
    styles: layoutStyles,
  });
export const ToolbarGroup: ReactUiComponent<typeof ui.ToolbarGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ToolbarGroup, 'ToolbarGroup', {
    styles: layoutStyles,
  });
export const ToolbarSeparator: ReactUiComponent<typeof ui.ToolbarSeparator> =
  /* @__PURE__ */ createReactAdapter(ui.ToolbarSeparator, 'ToolbarSeparator', {
    styles: layoutStyles,
  });
export const Badge: ReactUiComponent<typeof ui.Badge> =
  /* @__PURE__ */ createReactAdapter(ui.Badge, 'Badge', {
    styles: layoutStyles,
  });
export const CountBadge: ReactUiComponent<typeof ui.CountBadge> =
  /* @__PURE__ */ createReactAdapter(ui.CountBadge, 'CountBadge', {
    styles: layoutStyles,
  });
export const Spinner: ReactUiComponent<typeof ui.Spinner> =
  /* @__PURE__ */ createReactAdapter(ui.Spinner, 'Spinner', {
    styles: baseStyles,
  });
export const LoadingOverlay: ReactUiComponent<typeof ui.LoadingOverlay> =
  /* @__PURE__ */ createReactAdapter(ui.LoadingOverlay, 'LoadingOverlay', {
    styles: layoutStyles,
  });
export const EmptyState: ReactUiComponent<typeof ui.EmptyState> =
  /* @__PURE__ */ createReactAdapter(ui.EmptyState, 'EmptyState', {
    styles: layoutStyles,
  });
export const Menu: ReactUiComponent<typeof ui.Menu> =
  /* @__PURE__ */ createReactAdapter(ui.Menu, 'Menu', { styles: layoutStyles });
export const MenuItem: ReactUiComponent<typeof ui.MenuItem> =
  /* @__PURE__ */ createReactAdapter(ui.MenuItem, 'MenuItem', {
    styles: layoutStyles,
  });
export const MenuSeparator: ReactUiComponent<typeof ui.MenuSeparator> =
  /* @__PURE__ */ createReactAdapter(ui.MenuSeparator, 'MenuSeparator', {
    styles: layoutStyles,
  });
export const Submenu: ReactUiComponent<typeof ui.Submenu> =
  /* @__PURE__ */ createReactAdapter(ui.Submenu, 'Submenu', {
    styles: layoutStyles,
  });
export const ResizeHandle: ReactUiComponent<typeof ui.ResizeHandle> =
  /* @__PURE__ */ createReactAdapter(ui.ResizeHandle, 'ResizeHandle', {
    styles: layoutStyles,
  });
export const Pagination: ReactUiComponent<typeof ui.Pagination> =
  /* @__PURE__ */ createReactAdapter(ui.Pagination, 'Pagination', {
    styles: feedbackStyles,
  });
export const CircularProgress: ReactUiComponent<typeof ui.CircularProgress> =
  /* @__PURE__ */ createReactAdapter(ui.CircularProgress, 'CircularProgress', {
    styles: feedbackStyles,
  });
export const Rating: ReactUiComponent<typeof ui.Rating> =
  /* @__PURE__ */ createReactAdapter(ui.Rating, 'Rating', {
    styles: feedbackStyles,
  });
export const Button: ReactUiComponent<typeof ui.Button> =
  /* @__PURE__ */ createReactAdapter(ui.Button, 'Button', {
    styles: baseStyles,
  });
export const Pane: ReactUiComponent<typeof ui.Pane> =
  /* @__PURE__ */ createReactAdapter(ui.Pane, 'Pane', { styles: layoutStyles });
export const SplitLayout: ReactUiComponent<typeof ui.SplitLayout> =
  /* @__PURE__ */ createReactAdapter(ui.SplitLayout, 'SplitLayout', {
    styles: layoutStyles,
  });
export const Alert: ReactUiComponent<typeof ui.Alert> =
  /* @__PURE__ */ createReactAdapter(ui.Alert, 'Alert', {
    styles: layoutStyles,
  });
export const Listbox: ReactUiComponent<typeof ui.Listbox> =
  /* @__PURE__ */ createReactAdapter(ui.Listbox, 'Listbox', {
    styles: layoutStyles,
  });
export const ListboxOption: ReactUiComponent<typeof ui.ListboxOption> =
  /* @__PURE__ */ createReactAdapter(ui.ListboxOption, 'ListboxOption', {
    styles: layoutStyles,
  });
export const ListboxGroup: ReactUiComponent<typeof ui.ListboxGroup> =
  /* @__PURE__ */ createReactAdapter(ui.ListboxGroup, 'ListboxGroup', {
    styles: layoutStyles,
  });
export const ListboxOptionContent: ReactUiComponent<
  typeof ui.ListboxOptionContent
> = /* @__PURE__ */ createReactAdapter(
  ui.ListboxOptionContent,
  'ListboxOptionContent',
  { styles: layoutStyles },
);
export const StatusFeedbackPanel: ReactUiComponent<
  typeof ui.StatusFeedbackPanel
> = /* @__PURE__ */ createReactAdapter(
  ui.StatusFeedbackPanel,
  'StatusFeedbackPanel',
  { styles: feedbackStyles },
);
export const StatusBadge: ReactUiComponent<typeof ui.StatusBadge> =
  /* @__PURE__ */ createReactAdapter(ui.StatusBadge, 'StatusBadge', {
    styles: feedbackStyles,
  });
export const Combobox: ReactUiComponent<
  typeof ui.Combobox,
  | 'renderOption'
  | 'renderValue'
  | 'renderPlaceholder'
  | 'renderSelectedValue'
  | 'renderNoResults'
> = /* @__PURE__ */ createReactAdapter(ui.Combobox, 'Combobox', {
  styles: layoutStyles,
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
  styles: layoutStyles,
  factoryCallbacks: [
    'renderOption',
    'renderValue',
    'renderPlaceholder',
    'renderSelectedValue',
    'renderNoResults',
  ],
});
export const Avatar: ReactUiComponent<typeof ui.Avatar> =
  /* @__PURE__ */ createReactAdapter(ui.Avatar, 'Avatar', {
    styles: feedbackStyles,
  });
export const ProgressBar: ReactUiComponent<typeof ui.ProgressBar> =
  /* @__PURE__ */ createReactAdapter(ui.ProgressBar, 'ProgressBar', {
    styles: feedbackStyles,
  });
export const Popover: ReactUiComponent<typeof ui.Popover> =
  /* @__PURE__ */ createReactAdapter(ui.Popover, 'Popover', {
    styles: layoutStyles,
  });
export const Tooltip: ReactUiComponent<typeof ui.Tooltip> =
  /* @__PURE__ */ createReactAdapter(ui.Tooltip, 'Tooltip', {
    styles: baseStyles,
  });
export const Dialog: ReactUiComponent<typeof ui.Dialog> =
  /* @__PURE__ */ createReactAdapter(ui.Dialog, 'Dialog', {
    styles: dialogsStyles,
  });
export const ConfirmDialog: ReactUiComponent<typeof ui.ConfirmDialog> =
  /* @__PURE__ */ createReactAdapter(ui.ConfirmDialog, 'ConfirmDialog', {
    styles: dialogsStyles,
  });
export const DatePicker: ReactUiComponent<typeof ui.DatePicker> =
  /* @__PURE__ */ createReactAdapter(ui.DatePicker, 'DatePicker', {
    styles: pickerStyles,
  });
export const DateRangePicker: ReactUiComponent<typeof ui.DateRangePicker> =
  /* @__PURE__ */ createReactAdapter(ui.DateRangePicker, 'DateRangePicker', {
    styles: pickerStyles,
  });
export const DialogHeader: ReactUiComponent<typeof ui.DialogHeader> =
  /* @__PURE__ */ createReactAdapter(ui.DialogHeader, 'DialogHeader', {
    styles: dialogsStyles,
  });
export const DialogBody: ReactUiComponent<typeof ui.DialogBody> =
  /* @__PURE__ */ createReactAdapter(ui.DialogBody, 'DialogBody', {
    styles: dialogsStyles,
  });
export const DialogFooter: ReactUiComponent<typeof ui.DialogFooter> =
  /* @__PURE__ */ createReactAdapter(ui.DialogFooter, 'DialogFooter', {
    styles: dialogsStyles,
  });
export const DistributionChart: ReactUiComponent<typeof ui.DistributionChart> =
  /* @__PURE__ */ createReactAdapter(
    ui.DistributionChart,
    'DistributionChart',
    { styles: chartsStyles },
  );
export const BarChart: ReactUiComponent<typeof ui.BarChart> =
  /* @__PURE__ */ createReactAdapter(ui.BarChart, 'BarChart', {
    styles: chartsStyles,
  });
export const LineChart: ReactUiComponent<typeof ui.LineChart> =
  /* @__PURE__ */ createReactAdapter(ui.LineChart, 'LineChart', {
    styles: chartsStyles,
  });
export const AreaChart: ReactUiComponent<typeof ui.AreaChart> =
  /* @__PURE__ */ createReactAdapter(ui.AreaChart, 'AreaChart', {
    styles: chartsStyles,
  });
export const BrushRange: ReactUiComponent<typeof ui.BrushRange> =
  /* @__PURE__ */ createReactAdapter(ui.BrushRange, 'BrushRange', {
    styles: chartsStyles,
  });
export const OptionButton: ReactUiComponent<typeof ui.OptionButton> =
  /* @__PURE__ */ createReactAdapter(ui.OptionButton, 'OptionButton', {
    styles: fieldsStyles,
  });
export const HighlightedTextInput: ReactUiComponent<
  typeof ui.HighlightedTextInput
> = /* @__PURE__ */ createReactAdapter(
  ui.HighlightedTextInput,
  'HighlightedTextInput',
  { styles: fieldsStyles },
);
export const InlineFieldGroup: ReactUiComponent<typeof ui.InlineFieldGroup> =
  /* @__PURE__ */ createReactAdapter(ui.InlineFieldGroup, 'InlineFieldGroup', {
    styles: fieldsStyles,
  });
export const Legend: ReactUiComponent<typeof ui.Legend> =
  /* @__PURE__ */ createReactAdapter(ui.Legend, 'Legend', {
    styles: chartsStyles,
  });
export const TimeGrid: ReactUiComponent<typeof ui.TimeGrid> =
  /* @__PURE__ */ createReactAdapter(ui.TimeGrid, 'TimeGrid', {
    styles: fieldsStyles,
  });
export const FieldIcon: ReactUiComponent<typeof ui.FieldIcon> =
  /* @__PURE__ */ createReactAdapter(ui.FieldIcon, 'FieldIcon', {
    styles: fieldsStyles,
  });
export const FieldSummary: ReactUiComponent<typeof ui.FieldSummary> =
  /* @__PURE__ */ createReactAdapter(ui.FieldSummary, 'FieldSummary', {
    styles: fieldsStyles,
  });
export const FieldLibrary: ReactUiComponent<typeof ui.FieldLibrary> =
  /* @__PURE__ */ createReactAdapter(ui.FieldLibrary, 'FieldLibrary', {
    styles: fieldsStyles,
  });
export const FieldGroupHeading: ReactUiComponent<typeof ui.FieldGroupHeading> =
  /* @__PURE__ */ createReactAdapter(
    ui.FieldGroupHeading,
    'FieldGroupHeading',
    { styles: fieldsStyles },
  );
export const FieldGroup: ReactUiComponent<typeof ui.FieldGroup> =
  /* @__PURE__ */ createReactAdapter(ui.FieldGroup, 'FieldGroup', {
    styles: fieldsStyles,
  });
export const FieldList: ReactUiComponent<typeof ui.FieldList> =
  /* @__PURE__ */ createReactAdapter(ui.FieldList, 'FieldList', {
    styles: fieldsStyles,
  });
export const FieldRow: ReactUiComponent<typeof ui.FieldRow> =
  /* @__PURE__ */ createReactAdapter(ui.FieldRow, 'FieldRow', {
    styles: fieldsStyles,
  });
export const FieldContent: ReactUiComponent<typeof ui.FieldContent> =
  /* @__PURE__ */ createReactAdapter(ui.FieldContent, 'FieldContent', {
    styles: fieldsStyles,
  });
export const FieldItem: ReactUiComponent<typeof ui.FieldItem> =
  /* @__PURE__ */ createReactAdapter(ui.FieldItem, 'FieldItem', {
    styles: fieldsStyles,
  });
export const FieldLibraryList: ReactUiComponent<typeof ui.FieldLibraryList> =
  /* @__PURE__ */ createReactAdapter(ui.FieldLibraryList, 'FieldLibraryList', {
    styles: fieldsStyles,
  });
export const SelectedField: ReactUiComponent<typeof ui.SelectedField> =
  /* @__PURE__ */ createReactAdapter(ui.SelectedField, 'SelectedField', {
    styles: fieldsStyles,
  });
export const FieldActions: ReactUiComponent<typeof ui.FieldActions> =
  /* @__PURE__ */ createReactAdapter(ui.FieldActions, 'FieldActions', {
    styles: fieldsStyles,
  });
export const FieldStatusBadge: ReactUiComponent<typeof ui.FieldStatusBadge> =
  /* @__PURE__ */ createReactAdapter(ui.FieldStatusBadge, 'FieldStatusBadge', {
    styles: fieldsStyles,
  });
export const FieldRemoveButton: ReactUiComponent<typeof ui.FieldRemoveButton> =
  /* @__PURE__ */ createReactAdapter(
    ui.FieldRemoveButton,
    'FieldRemoveButton',
    { styles: fieldsStyles },
  );
export const FieldRemoveIcon: ReactUiComponent<typeof ui.FieldRemoveIcon> =
  /* @__PURE__ */ createReactAdapter(ui.FieldRemoveIcon, 'FieldRemoveIcon', {
    styles: fieldsStyles,
  });
export const FieldDropIndicator: ReactUiComponent<
  typeof ui.FieldDropIndicator
> = /* @__PURE__ */ createReactAdapter(
  ui.FieldDropIndicator,
  'FieldDropIndicator',
  { styles: fieldsStyles },
);
export const DialogForm: ReactUiComponent<typeof ui.DialogForm> =
  /* @__PURE__ */ createReactAdapter(ui.DialogForm, 'DialogForm', {
    styles: dialogsStyles,
  });
export const DialogCloseButton: ReactUiComponent<typeof ui.DialogCloseButton> =
  /* @__PURE__ */ createReactAdapter(
    ui.DialogCloseButton,
    'DialogCloseButton',
    { styles: dialogsStyles },
  );
export const DialogActionFooter: ReactUiComponent<
  typeof ui.DialogActionFooter
> = /* @__PURE__ */ createReactAdapter(
  ui.DialogActionFooter,
  'DialogActionFooter',
  { styles: dialogsStyles },
);
export const DialogActions: ReactUiComponent<typeof ui.DialogActions> =
  /* @__PURE__ */ createReactAdapter(ui.DialogActions, 'DialogActions', {
    styles: dialogsStyles,
  });
export const DialogTitleInput: ReactUiComponent<typeof ui.DialogTitleInput> =
  /* @__PURE__ */ createReactAdapter(ui.DialogTitleInput, 'DialogTitleInput', {
    styles: dialogsStyles,
  });
export const EditableDialogHeader: ReactUiComponent<
  typeof ui.EditableDialogHeader
> = /* @__PURE__ */ createReactAdapter(
  ui.EditableDialogHeader,
  'EditableDialogHeader',
  { styles: dialogsStyles },
);
export const ControlTooltip: ReactUiComponent<typeof ui.ControlTooltip> =
  /* @__PURE__ */ createReactAdapter(ui.ControlTooltip, 'ControlTooltip', {
    styles: baseStyles,
  });
export const InspectorSection: ReactUiComponent<typeof ui.InspectorSection> =
  /* @__PURE__ */ createReactAdapter(ui.InspectorSection, 'InspectorSection', {
    styles: formattingStyles,
  });
export const IconChoiceGroup: ReactUiComponent<typeof ui.IconChoiceGroup> =
  /* @__PURE__ */ createReactAdapter(ui.IconChoiceGroup, 'IconChoiceGroup', {
    styles: formattingStyles,
  });
export const IconToggleButton: ReactUiComponent<typeof ui.IconToggleButton> =
  /* @__PURE__ */ createReactAdapter(ui.IconToggleButton, 'IconToggleButton', {
    styles: formattingStyles,
  });
export const TypographyControls: ReactUiComponent<
  typeof ui.TypographyControls
> = /* @__PURE__ */ createReactAdapter(
  ui.TypographyControls,
  'TypographyControls',
  { styles: formattingStyles },
);
export const ComparisonPreview: ReactUiComponent<typeof ui.ComparisonPreview> =
  /* @__PURE__ */ createReactAdapter(
    ui.ComparisonPreview,
    'ComparisonPreview',
    { styles: formattingStyles },
  );
export const FilterBadgeInfoButton: ReactUiComponent<
  typeof ui.FilterBadgeInfoButton
> = /* @__PURE__ */ createReactAdapter(
  ui.FilterBadgeInfoButton,
  'FilterBadgeInfoButton',
  { styles: layoutStyles },
);
export const FilterBadge: ReactUiComponent<typeof ui.FilterBadge> =
  /* @__PURE__ */ createReactAdapter(ui.FilterBadge, 'FilterBadge', {
    styles: layoutStyles,
  });
export const RatingStar: ReactUiComponent<typeof ui.RatingStar> =
  /* @__PURE__ */ createReactAdapter(ui.RatingStar, 'RatingStar', {
    styles: feedbackStyles,
  });
export const RatingChoice: ReactUiComponent<typeof ui.RatingChoice> =
  /* @__PURE__ */ createReactAdapter(ui.RatingChoice, 'RatingChoice', {
    styles: feedbackStyles,
  });
export const ReorderList: ReactUiComponent<typeof ui.ReorderList> =
  /* @__PURE__ */ createReactAdapter(ui.ReorderList, 'ReorderList', {
    styles: layoutStyles,
  });
export const ReorderHandle: ReactUiComponent<typeof ui.ReorderHandle> =
  /* @__PURE__ */ createReactAdapter(ui.ReorderHandle, 'ReorderHandle', {
    styles: layoutStyles,
  });
export const TimelineTrack: ReactUiComponent<typeof ui.TimelineTrack> =
  /* @__PURE__ */ createReactAdapter(ui.TimelineTrack, 'TimelineTrack', {
    styles: timelineStyles,
  });
export const ActivityMessage: ReactUiComponent<typeof ui.ActivityMessage> =
  /* @__PURE__ */ createReactAdapter(ui.ActivityMessage, 'ActivityMessage', {
    styles: feedbackStyles,
  });
export const NumberDraft: ReactUiComponent<typeof PreactNumberDraft> =
  /* @__PURE__ */ createReactAdapter(PreactNumberDraft, 'NumberDraft', {
    styles: fieldsStyles,
  });
export const MaskedDraft: ReactUiComponent<typeof PreactMaskedDraft> =
  /* @__PURE__ */ createReactAdapter(PreactMaskedDraft, 'MaskedDraft', {
    styles: fieldsStyles,
  });
export const DurationField: ReactUiComponent<typeof PreactDurationField> =
  /* @__PURE__ */ createReactAdapter(PreactDurationField, 'DurationField', {
    styles: fieldsStyles,
  });
export const DurationDraft: ReactUiComponent<typeof PreactDurationDraft> =
  /* @__PURE__ */ createReactAdapter(PreactDurationDraft, 'DurationDraft', {
    styles: fieldsStyles,
  });
export const HtmlEditor: ReactUiComponent<typeof PreactHtmlEditor> =
  /* @__PURE__ */ createReactAdapter(PreactHtmlEditor, 'HtmlEditor', {
    styles: layoutStyles,
  });
export const TemporalPicker: ReactUiComponent<typeof PreactTemporalPicker> =
  /* @__PURE__ */ createReactAdapter(PreactTemporalPicker, 'TemporalPicker', {
    styles: pickerStyles,
  });
export const TemporalDraft: ReactUiComponent<typeof PreactTemporalDraft> =
  /* @__PURE__ */ createReactAdapter(PreactTemporalDraft, 'TemporalDraft', {
    styles: pickerStyles,
  });
export const DateTimeField: ReactUiComponent<typeof PreactDateTimeField> =
  /* @__PURE__ */ createReactAdapter(PreactDateTimeField, 'DateTimeField', {
    styles: pickerStyles,
  });
export const AssigneePicker: ReactUiComponent<typeof PreactAssigneePicker> =
  /* @__PURE__ */ createReactAdapter(PreactAssigneePicker, 'AssigneePicker', {
    styles: pickerStyles,
  });
export const AssigneeField: ReactUiComponent<typeof PreactAssigneeField> =
  /* @__PURE__ */ createReactAdapter(PreactAssigneeField, 'AssigneeField', {
    styles: pickerStyles,
  });
export const AssigneePickerLayout: ReactUiComponent<
  typeof PreactAssigneePickerLayout
> = /* @__PURE__ */ createReactAdapter(
  PreactAssigneePickerLayout,
  'AssigneePickerLayout',
  { styles: pickerStyles },
);

export const AiPromptInput: ReactUiComponent<typeof ui.AiPromptInput> =
  /* @__PURE__ */ createReactAdapter(ui.AiPromptInput, 'AiPromptInput', {
    styles: aiStyles,
  });
export const AiSuggestions: ReactUiComponent<typeof ui.AiSuggestions> =
  /* @__PURE__ */ createReactAdapter(ui.AiSuggestions, 'AiSuggestions', {
    styles: aiStyles,
  });
export const AiActionStatus: ReactUiComponent<typeof ui.AiActionStatus> =
  /* @__PURE__ */ createReactAdapter(ui.AiActionStatus, 'AiActionStatus', {
    styles: aiStyles,
  });
export const AiChangePreview: ReactUiComponent<typeof ui.AiChangePreview> =
  /* @__PURE__ */ createReactAdapter(ui.AiChangePreview, 'AiChangePreview', {
    styles: aiStyles,
  });
export const AiResult: ReactUiComponent<typeof ui.AiResult> =
  /* @__PURE__ */ createReactAdapter(ui.AiResult, 'AiResult', {
    styles: aiStyles,
  });
export const AiResultView: ReactUiComponent<typeof ui.AiResultView> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultView, 'AiResultView', {
    styles: aiStyles,
  });
export const AiResultTable: ReactUiComponent<typeof ui.AiResultTable> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultTable, 'AiResultTable', {
    styles: aiStyles,
  });
export const AiResultMetrics: ReactUiComponent<typeof ui.AiResultMetrics> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultMetrics, 'AiResultMetrics', {
    styles: aiStyles,
  });
export const AiResultText: ReactUiComponent<typeof ui.AiResultText> =
  /* @__PURE__ */ createReactAdapter(ui.AiResultText, 'AiResultText', {
    styles: aiStyles,
  });
export const AiAssistant: ReactUiComponent<typeof ui.AiAssistant> =
  /* @__PURE__ */ createReactAdapter(ui.AiAssistant, 'AiAssistant', {
    styles: aiStyles,
  });
export const AiRequestTrail: ReactUiComponent<typeof ui.AiRequestTrail> =
  /* @__PURE__ */ createReactAdapter(ui.AiRequestTrail, 'AiRequestTrail', {
    styles: aiStyles,
  });
export const PdfViewer: ReactUiComponent<typeof ui.PdfViewer> =
  /* @__PURE__ */ createReactAdapter(ui.PdfViewer, 'PdfViewer', {
    styles: pdfStyles,
  });

import { PdfViewerToolbar as PreactPdfViewerToolbar } from './pdf-viewer/toolbar';
export const PdfViewerToolbar = /* @__PURE__ */ createReactAdapter(
  PreactPdfViewerToolbar,
  'PdfViewerToolbar',
  { styles: pdfStyles },
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
  /* @__PURE__ */ createReactAdapter(ui.AiChat, 'AiChat', { styles: aiStyles });
export const AiChatContent: ReactUiComponent<typeof ui.AiChatContent> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatContent, 'AiChatContent', {
    styles: aiStyles,
  });
export const AiChatComposer: ReactUiComponent<typeof ui.AiChatComposer> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatComposer, 'AiChatComposer', {
    styles: aiStyles,
  });
export const AiChatEmptyState: ReactUiComponent<typeof ui.AiChatEmptyState> =
  /* @__PURE__ */ createReactAdapter(ui.AiChatEmptyState, 'AiChatEmptyState', {
    styles: aiStyles,
  });
export const AiMessage: ReactUiComponent<typeof ui.AiMessage> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessage, 'AiMessage', {
    styles: aiStyles,
  });
export const AiMessageContent: ReactUiComponent<typeof ui.AiMessageContent> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessageContent, 'AiMessageContent', {
    styles: aiStyles,
  });
export const AiMessageActions: ReactUiComponent<typeof ui.AiMessageActions> =
  /* @__PURE__ */ createReactAdapter(ui.AiMessageActions, 'AiMessageActions', {
    styles: aiStyles,
  });
export const AiReasoning: ReactUiComponent<typeof ui.AiReasoning> =
  /* @__PURE__ */ createReactAdapter(ui.AiReasoning, 'AiReasoning', {
    styles: aiStyles,
  });
export const AiTask: ReactUiComponent<typeof ui.AiTask> =
  /* @__PURE__ */ createReactAdapter(ui.AiTask, 'AiTask', { styles: aiStyles });
export const AiTaskItem: ReactUiComponent<typeof ui.AiTaskItem> =
  /* @__PURE__ */ createReactAdapter(ui.AiTaskItem, 'AiTaskItem', {
    styles: aiStyles,
  });

export const IconToolbar: ReactUiComponent<typeof ui.IconToolbar> =
  /* @__PURE__ */ createReactAdapter(ui.IconToolbar, 'IconToolbar', {
    styles: layoutStyles,
  });

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
