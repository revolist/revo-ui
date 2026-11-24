/** CSS hooks verified against the component renderers. Optional parts appear only when supplied. */
export const themeReferences: Record<
  string,
  { parts: string[]; state?: string }
> = {
  ...Object.fromEntries(
    [
      'AiAssistant',
      'AiChat',
      'AiChatEmptyState',
      'AiMessageContent',
      'AiMessageActions',
      'AiTaskItem',
      'AiSuggestions',
      'AiResult',
      'AiResultTable',
      'AiResultMetrics',
      'AiResultText',
      'AiChangePreview',
      'AiPromptInput',
      'AiChatComposer',
      'Avatar',
      'CalendarHeader',
      'CalendarWeekdays',
      'CalendarMonthGrid',
      'CalendarYearGrid',
      'ColorPicker',
      'DialogHeader',
      'DialogBody',
      'DialogFooter',
      'DialogActions',
      'DialogCloseButton',
      'EditorPane',
      'EditorSplitLayout',
      'Pane',
      'SplitLayout',
      'FormField',
      'IconToolbar',
      'MenuSeparator',
      'PdfViewer',
      'ReorderList',
      'ReorderHandle',
      'ResourcePickerAvatar',
      'SvgIcon',
      'Tooltip',
      'ControlTooltip',
    ].map((name) => [name, { parts: ['root'] }]),
  ),
  AiResultView: {
    parts: ['root'],
    state: 'A custom table renderer owns its own markup and styles.',
  },
  AiRequestTrail: { parts: ['root', 'popup'] },
  Dialog: {
    parts: ['root'],
    state:
      'The dialog surface is mounted separately and receives the preset class.',
  },
  ConfirmDialog: {
    parts: ['root'],
    state:
      'The dialog surface is mounted separately and receives the preset class.',
  },
  Popover: {
    parts: ['root'],
    state: 'The popup surface receives the preset class.',
  },
  DatePicker: {
    parts: ['picker', 'root', 'months', 'month', 'day'],
    state: 'The calendar inside the popup receives the preset class.',
  },
  DateRangePicker: {
    parts: ['picker', 'root', 'months', 'month', 'day'],
    state: 'The calendar inside the popup receives the preset class.',
  },
  Rating: {
    parts: ['root', 'label', 'option', 'input'],
    state: 'Interactive ratings use native radio inputs.',
  },
  AiChatContent: { parts: ['root', 'viewport', 'content'] },
  AiMessage: {
    parts: ['root'],
    state: 'The message exposes data-streaming and aria-busy while streaming.',
  },
  AiReasoning: {
    parts: ['root', 'content'],
    state:
      'The native disclosure exposes its open state when content is present.',
  },
  AiTask: {
    parts: ['root', 'content'],
    state:
      'The native disclosure exposes its open state when content is present.',
  },
  AiActionStatus: {
    parts: ['root'],
    state: 'The root exposes data-state with the current phase.',
  },
  ProgressBar: { parts: ['root', 'track', 'fill'] },
  PreactRangeSlider: { parts: ['root'] },
  SingleValueSlider: {
    parts: ['input'],
    state: 'The range input uses native disabled state.',
  },
  SliderField: {
    parts: ['root', 'input'],
    state: 'The range input uses native disabled state.',
  },
  ColorPalette: {
    parts: ['root'],
    state: 'Color choices expose aria-checked.',
  },
  SharedResourcePicker: {
    parts: ['root', 'popup'],
    state:
      'The dropdown trigger exposes aria-expanded when using dropdown presentation.',
  },
  TemporalPicker: {
    parts: ['root'],
    state: 'Range endpoint buttons expose aria-pressed.',
  },
  TemporalDraft: { parts: ['root'] },
  DateTimeField: {
    parts: ['root'],
    state: 'The anchored popup also receives the preset class.',
  },
  HtmlEditor: { parts: ['root'] },
  TimelineTrack: { parts: ['track', 'actions'] },
  MetricTile: {
    parts: ['root', 'label', 'value', 'detail', 'extra'],
    state:
      'Signed positive values and details can use positive, negative or neutral tones.',
  },
  MetricPanel: { parts: ['root'] },
  ActivityMessage: {
    parts: ['root', 'avatar', 'card', 'header', 'time', 'actions', 'details'],
  },
  Badge: { parts: ['root'] },
  ButtonGroup: { parts: ['root'] },
  Chip: { parts: ['root'] },
  CountBadge: { parts: ['root'] },
  Disclosure: {
    parts: ['root', 'summary'],
    state: 'The native details element exposes its open state.',
  },
  EmptyState: { parts: ['root', 'title', 'description'] },
  FieldError: { parts: ['root'] },
  FieldHint: { parts: ['root'] },
  FilterChip: { parts: ['root', 'remove'] },
  FormField: { parts: ['root'] },
  FormSection: { parts: ['root', 'title', 'description'] },
  LoadingOverlay: {
    parts: ['root', 'overlay'],
    state: 'The root exposes aria-busy.',
  },
  Menu: { parts: ['root'] },
  Panel: { parts: ['root'] },
  StatusBadge: { parts: ['root'], state: 'The root exposes data-tone.' },
  Toolbar: { parts: ['root'] },
  ToolbarGroup: { parts: ['root'] },
  Switch: {
    parts: ['label', 'track', 'thumb'],
    state:
      'The switch has data-state="checked" or "unchecked" and aria-checked.',
  },
  Checkbox: {
    parts: ['root', 'input', 'copy', 'label', 'description'],
    state:
      'The input exposes aria-checked, including "mixed" for an indeterminate value. The root and copy appear when a label or description is provided.',
  },
  ChoiceChips: {
    parts: ['root', 'item'],
    state: 'Items expose data-state="selected" or "unselected".',
  },
  SegmentedSwitch: {
    parts: ['root', 'item', 'label', 'count'],
    state:
      'Items expose data-state="active" or "inactive" and the ARIA state appropriate to their role.',
  },
  Tabs: {
    parts: ['root', 'item', 'label', 'count'],
    state: 'Items expose data-state="active" or "inactive" and aria-selected.',
  },
  SegmentedControl: {
    parts: ['root', 'item', 'label', 'count'],
    state: 'Items expose data-state="active" or "inactive" and aria-checked.',
  },
  Calendar: {
    parts: ['root', 'months', 'month', 'day'],
    state:
      'Days use aria-selected, aria-current and disabled to expose selection and availability.',
  },
  CalendarDay: {
    parts: ['day'],
    state:
      'The day uses aria-selected, aria-current and disabled to expose its state.',
  },
  Dropdown: {
    parts: ['root', 'trigger', 'popup'],
    state:
      'The trigger exposes aria-expanded. The popup may be rendered separately and receives the preset class too.',
  },
  TextInput: { parts: ['input'] },
  Textarea: { parts: ['input'] },
  SearchInput: { parts: ['root', 'icon', 'input', 'shortcut'] },
  SearchActionBar: { parts: ['root', 'icon', 'input', 'shortcut'] },
  Alert: {
    parts: ['root', 'icon', 'content', 'title', 'description', 'actions'],
  },
  RadioGroup: {
    parts: ['root', 'label', 'option', 'input'],
    state: 'Inputs use native checked and disabled states.',
  },
  NumberStepper: { parts: ['root', 'decrease', 'input', 'increase'] },
  Legend: {
    parts: ['root', 'item', 'marker', 'label'],
    state: 'Items expose data-tone; markers expose data-marker.',
  },
  EditorListItem: {
    parts: ['root'],
    state:
      'The option exposes data-state="selected" or "unselected" and aria-selected.',
  },
  EditorListItemContent: {
    parts: ['root', 'icon', 'copy', 'label', 'description'],
  },
};
