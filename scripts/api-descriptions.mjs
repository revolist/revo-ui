/** Editorial supplements for contracts whose library declaration has no JSDoc.
 * Keep behavior in the library; these descriptions follow its implementations.
 */
const common = {
  className: 'Additional CSS classes applied to the component root.',
  class:
    'CSS classes for the root; accepts the class representation declared by this control.',
  children:
    'Content rendered inside the component. Supply nodes from the framework adapter you are using.',
  style:
    'Inline styles or style configuration applied to this component; expand the type for supported entries.',
  id: 'Identifier used to associate the control with labels, popup content or other elements.',
  name: 'Form field name submitted with the control value.',
  disabled: 'Disables user interaction with the control.',
  readOnly: 'Displays the current value while preventing user edits.',
  busy: 'Indicates that an operation is in progress; interactive controls block activation while busy.',
  placeholder: 'Content shown when there is no entered or selected value.',
  ariaLabel: 'Accessible name announced by assistive technology.',
  ariaDescribedBy:
    'Space-separated IDs of elements that describe this control.',
  ariaValueText:
    'Human-readable equivalent of the numeric value for assistive technology.',
  labelledBy: 'ID of the element that labels the associated content panel.',
  toAriaLabel: 'Accessible label for the upper endpoint of the range slider.',
  popover:
    'Popover controller used to position, open and close the feedback surface.',
  labelPosition: 'Places the switch label before or after the control.',
  info: 'Additional informational content displayed with the choice chip.',
  tone: 'Semantic status color used for neutral, warning, success or danger feedback.',
  labelId: 'ID applied to the label so it can be referenced by the control.',
  descriptionId:
    'ID used to associate the explanatory content with its trigger.',
  role: 'Accessibility role used by the rendered element.',
  testId: 'Stable data attribute for locating the control in automated tests.',
  value:
    'Value to display or edit. The declared type identifies the supported representation; change callbacks describe how edited values are emitted.',
  defaultValue:
    'Initial value used when the component is not controlled by a value prop.',
  onChange:
    'Receives the new value when the user changes the control. Update the corresponding value prop for controlled use.',
  onValueChange:
    'Receives the updated input value. Store it in application state and pass it back through value.',
  onSelectionChange:
    'Receives the updated selection in the shape specified by the active selection mode.',
  onSelect:
    'Called when the user selects an item. The signature identifies the selected value and any additional context.',
  onValidityChange:
    'Receives true or false when the validity of the current input changes.',
  onCommit:
    'Called when an editing gesture commits its value, rather than on every intermediate change.',
  onClick:
    'Handles activation of the control; receives the event and any component-specific context.',
  onMouseDown: 'Handles the mouse-down event before click activation.',
  onDblClick: 'Handles a double-click on the control.',
  onKeyDown:
    'Handles keyboard input; receives the keyboard event and any item/date context shown in the signature.',
  onInput: 'Handles native input events as the user edits the field.',
  onFocus:
    'Called when focus moves to an item or control; the signature identifies the focused value.',
  onClose: 'Requests that the parent close the surface or picker.',
  onOpen: 'Requests that the parent open the surface or file chooser.',
  onApply:
    'Commits the proposed edit. The application owns applying the emitted value or change.',
  onCancel: 'Cancels the current edit or proposed change without applying it.',
  onRemove:
    'Requests removal of the indicated item; the application owns updating its data.',
  onClear: 'Requests that the application clear the current list or selection.',
  onEmpty:
    'Called when removing the final request leaves the request trail empty.',
  onSubmit:
    'Submits the current prompt value to the application-provided handler.',
  onStop: 'Requests cancellation of the in-progress AI operation.',
  onOpenChange:
    'Receives the requested expanded state; update open when using controlled state.',
  onPressedChange:
    'Receives the new pressed state when the toggle is activated.',
  onCollapsedChange:
    'Receives the new collapsed state when the feedback panel is toggled.',
  onToggle:
    'Handles the native details toggle event; read currentTarget.open for the expanded state.',
  onConfirm: 'Runs the application confirmation action.',
  onQueryChange:
    'Receives the updated search text used to filter the available items.',
  label:
    'Label content or accessible name for the component, as rendered by this control.',
  title: 'Heading or title text used by this component.',
  description: 'Supporting text shown with the label or heading.',
  hint: 'Additional guidance displayed with the field.',
  text: 'Display text or localized text overrides; expand the type when this prop accepts an object.',
  translations:
    'Overrides the default UI strings. Supply only the entries you want to translate and retain any placeholders.',
  localeText:
    'Overrides the feedback panel UI strings without replacing unspecified defaults.',
  locale:
    'Locale identifier or localized label configuration used for formatting and accessible text.',
  actions:
    'Actions rendered by this component, or action-label overrides for editor fields; expand the declared type.',
  footer: 'Content rendered in the footer or after the main component content.',
  header: 'Content rendered in the message header.',
  summary: 'Summary content displayed before the component details.',
  details: 'Supplementary detail content associated with this item or message.',
  icon: 'Icon content for the component. When the type is string, supply trusted SVG markup.',
  svg: 'Trusted bundled SVG markup to render as the icon; do not pass untrusted user HTML.',
  iconContent:
    'Custom rendered icon content, used in place of the SVG icon string.',
  visibleLabel:
    'Text displayed beside the icon; the accessible label remains available to screen readers.',
  iconPosition: 'Places the icon before or after the label.',
  size: 'Visual size of this component; numeric icon/avatar sizes are in pixels, while controls use the declared named sizes.',
  rounded: 'Uses pill-shaped corners for the button.',
  variant:
    'Selects the visual action style without changing the action behavior.',
  appearance: 'Selects a soft-filled or outlined chip presentation.',
  shape: 'Controls the badge corner shape.',
  badge: 'Small count or label displayed with the action icon.',
  color: 'CSS color used for this item or its visual accent.',
  target:
    'Browsing context used when a button renders a link, for example _blank.',
  rel: 'Link relationship tokens, such as noopener, when the button has an href.',
  pressed: 'Controlled pressed state of the toggle button.',
  selected:
    'Selected value or selected-state flag; the declared type identifies which representation the control uses.',
  checked: 'Checked state displayed by the checkbox or switch.',
  indeterminate: 'Displays the mixed/partially selected checkbox state.',
  open: 'Expanded or visible state of the surface or disclosure.',
  defaultOpen: 'Initial expanded state used when open is not controlled.',
  visible: 'Whether the tooltip is currently shown.',
  active: 'Marks the associated item or content panel as active.',
  hidden:
    'Omits the day from the visible calendar while retaining its layout cell.',
  compact: 'Uses the compact feedback panel layout.',
  min: 'Minimum permitted value or lower bound for the control.',
  max: 'Maximum permitted value or upper bound for the control.',
  step: 'Increment used for value changes. Use a value compatible with the control type.',
  minDate:
    'Earliest selectable calendar date in the library ISO date representation.',
  maxDate:
    'Latest selectable calendar date in the library ISO date representation.',
  required:
    'Requires a non-empty value or selection before the edit can be accepted.',
  maxLength: 'Maximum accepted text length for the editor value.',
  clearable: 'Shows a clear action when a value can be removed.',
  query: 'Current search query used to filter the available options.',
  options:
    'Available choices or control configuration, according to the declared type; expand it to inspect each field.',
  items:
    'Ordered items to render. Each item follows the shape shown in the expanded type.',
  config:
    'Component configuration. Expand the type to see accepted fields and alternative forms.',
  source:
    'Data or option source consumed by this component; expand the type for supported representations.',
  state: 'Current state snapshot used to render the component.',
  controller:
    'Controller instance used to invoke actions and read the current state.',
  data: 'Data points rendered by the chart, in display order.',
  rows: 'Timeline rows and their event data, in display order.',
  result:
    'Structured AI result to display. Expand the discriminated union or object type for its required fields.',
  changes:
    'Proposed before/after changes shown for review before applying them.',
  matchedRows: 'Number of rows matched by the completed request.',
  count: 'Count displayed beside the label or used by the control.',
  countLabel: 'Formats a count into localized display text.',
  height:
    'Rendered height. A numeric size uses pixels; string sizes follow the supported CSS height format.',
  maxHeight: 'Maximum popup height in pixels before its content scrolls.',
  layout: 'Places the slider label and control inline or in a vertical stack.',
  valuePlacement:
    'Positions the displayed slider value at the end, on the thumb, or hides it.',
  formatValue:
    'Formats the numeric value for display without changing its stored value.',
  formatToValue: 'Formats the upper endpoint value of a range slider.',
  accentColor: 'CSS color used for the active slider track and thumb.',
  direction: 'Text or interaction direction, left-to-right or right-to-left.',
  dir: 'Text direction used by the calendar layout.',
  scrollable: 'Allows the pane contents to scroll within the available space.',
  anchor:
    'DOM element used as the positioning reference for the floating surface.',
  returnFocus: 'Element that receives focus when the dialog closes.',
  draggable: 'Allows the dialog to be moved using its header.',
  pending:
    'Indicates a confirmation action is pending and blocks repeated confirmation.',
  portalTarget:
    'DOM element into which the popup is mounted; omitted values use the component default.',
  appendTo: 'DOM container for floating viewer toolbar content.',
  theme:
    'Theme applied to popup content so it matches its surrounding application.',
  placement: 'Preferred position of the tooltip relative to its anchor.',
  align: 'Aligns the popup to the start or end of its trigger.',
  matchTriggerWidth: 'Makes the dropdown popup match the trigger width.',
  observePopupResize: 'Repositions the popup when its size changes.',
  closeOnClickOutside:
    'Closes the dropdown popup when a pointer interaction occurs outside it.',
  onPointerRelease:
    'Handles the mouse/touch release associated with a popup interaction.',
  triggerAttributes:
    'Additional HTML attributes applied to the dropdown trigger element.',
  environment:
    'Dropdown rendering environment, including host integration and event handling.',
  remote:
    'Remote-option loading state and handlers for search, pagination and retry.',
  remoteText:
    'Localized messages for loading, empty and failed remote-option requests.',
  selectedValues:
    'Selected option objects used to render the current dropdown selection.',
  multiSelect: 'Allows more than one option to be selected.',
  multiple: 'Enables selecting multiple values rather than one.',
  search: 'Shows the dropdown search field.',
  searchPlaceholder: 'Placeholder text in the search field.',
  onTabNavigation:
    'Called when Tab should leave the dropdown and continue normal focus navigation.',
  listboxId: 'ID for the options listbox and its accessibility associations.',
  searchId: 'ID for the search field and its accessibility associations.',
  dropdownMenuId: 'ID assigned to the mounted dropdown menu.',
  renderOption:
    'Custom renderer for an option and its current selection/disabled state.',
  renderCount: 'Custom renderer for the count shown beside a segmented option.',
  renderPlaceholder:
    'Custom renderer for the dropdown placeholder when no option is selected.',
  renderNoResults: 'Custom renderer for an empty options list.',
  renderItem: 'Renders a list item from its data and index.',
  renderHandle: 'Renders the drag handle for a reorderable list item.',
  renderValue: 'Custom renderer for the current selected value.',
  renderPicker:
    'Replaces the assignee picker UI while retaining the field integration contract.',
  renderTable: 'Custom renderer for structured AI table results.',
  renderTooltip:
    'Renders custom chart tooltip content for a data point and its index.',
  inputRef: 'Reference or callback receiving the underlying input element.',
  listRef:
    'Reference to the list container for focus or scrolling integration.',
  searchRef: 'Reference to the assignee search input.',
  triggerRef: 'Reference to the element that anchors the dropdown popup.',
  matrixRef: 'Reference to the time-grid container.',
  setRef: 'Registers the rendered day button for the given date.',
  setDayRef:
    'Registers day elements so the calendar can manage keyboard focus.',
  inputLabel: 'Accessible label for the editable dialog title input.',
  titleId: 'ID of the dialog heading used by aria-labelledby.',
  titleHidden:
    'Keeps the title available to screen readers while visually hiding it.',
  closeProps: 'Additional button attributes for the dialog close action.',
  end: 'Content rendered at the trailing end of the action footer.',
  leading: 'Content rendered before the search input.',
  trailing: 'Content rendered after the search input.',
  shortcut: 'Keyboard shortcut hint displayed beside the search field.',
  hideIcon: 'Hides the default search icon.',
  'data-tooltip':
    'Tooltip text associated with the choice-chip information action.',
  triggerLabel:
    'Formats the number of applied requests into the request-trail trigger label.',
  clearDescription:
    'Accessible explanation of what clearing the request trail does.',
  changedMessage:
    'Message shown when manual changes invalidate the current AI request trail.',
  removalsDisabled:
    'Prevents removing request-trail steps while leaving the remaining presentation available.',
  from: 'Start value of the range.',
  isStreaming: 'Marks a message as receiving streamed content.',
  phase:
    'Current AI action phase used to choose progress or result presentation.',
  status:
    'Current lifecycle or task status. Expand the union to see its allowed states.',
  message: 'Status or action message displayed to the user.',
  notice: 'Additional notice shown with the proposed AI changes.',
  avatar: 'Avatar content displayed at the start of the activity message.',
  timestamp: 'Timestamp content displayed with the activity message header.',
  heading: 'Content rendered as the field-group heading.',
  content: 'Custom content rendered by the item, tooltip or calendar day.',
  detail: 'Secondary content displayed beside the filter label.',
  highlight: 'Highlighted content displayed with the field input.',
  empty:
    'Empty-state flag or empty-state content, according to the declared type.',
  indicator: 'Custom drop-indicator content for the field drop zone.',
  dropPosition: 'Places the insertion indicator before or after the item.',
  position: 'Position of the insertion indicator relative to the field.',
  as: 'HTML element used for the field content wrapper.',
  index: 'Index used to identify or style the item.',
  key: 'Stable identity used when rendering this item.',
  itemKey: 'Returns a stable unique key for each reorderable item.',
  itemAttributes: 'Returns additional HTML attributes for a reorderable item.',
  draggedKey: 'Key of the item currently being dragged.',
  dropIndex: 'Insertion boundary at which the current drop indicator is shown.',
  onDragOver:
    'Handles drag movement over an insertion boundary; receives its index.',
  onDrop: 'Handles a drop at the supplied insertion boundary.',
  getTooltip: 'Returns tooltip text for a timeline event.',
  onEventChange:
    'Receives an event ID and the updated event after moving or resizing it.',
  onAction: 'Receives the identifier of the activated toolbar action.',
  filled: 'Renders the star as filled rather than outlined.',
  initials: 'Fallback initials displayed when no avatar image is available.',
  rectangular:
    'Uses a rectangular avatar instead of the circular presentation.',
  fontFamily: 'CSS font-family name used for the formatted value.',
  fontSize: 'Font size in pixels for the formatted value.',
  bold: 'Enables bold text styling.',
  italic: 'Enables italic text styling.',
  underline: 'Enables underline decoration.',
  strike: 'Enables strikethrough decoration.',
  fonts: 'Font-family choices offered by the typography controls.',
  labels: 'Localized text labels for the controls in this composition.',
  icons: 'Trusted SVG markup for the typography action icons.',
  originalValue:
    'Unformatted source value displayed in the comparison preview.',
  formatted: 'Rendered formatted value shown in the comparison preview.',
  formattedStyle: 'Inline styles applied to the formatted preview.',
  visual: 'Enables the visual preview presentation.',
  detailsLabel: 'Accessible label for the filter-details information action.',
  chart:
    'Chart configuration rendered behind the range brush; null omits the chart.',
  slider: 'Slider configuration or visibility, according to the declared type.',
  startLabel: 'Content displayed at the beginning of the range brush.',
  selectionLabel: 'Content displayed for the currently brushed range.',
  endLabel: 'Content displayed at the end of the range brush.',
  openLabel: 'Accessible label for the action that opens the picker.',
  confirmLabel: 'Text for the confirm action.',
  cancelLabel: 'Text for the cancel action.',
  closeLabel: 'Accessible text for the close action.',
  removeLabel: 'Accessible text or formatter for the remove-item action.',
  clearLabel: 'Text for the clear-all action.',
  expandLabel: 'Accessible text for expanding the section.',
  collapseLabel: 'Accessible text for collapsing the section.',
  previousLabel: 'Accessible text for moving to the previous page or period.',
  nextLabel: 'Accessible text for moving to the next page or period.',
  firstLabel: 'Accessible text for navigating to the first page.',
  lastLabel: 'Accessible text for navigating to the last page.',
  decreaseLabel: 'Accessible text for decreasing the numeric value.',
  increaseLabel: 'Accessible text for increasing the numeric value.',
  fromLabel: 'Label for the start of a date range.',
  toLabel: 'Label for the end of a date range.',
  submitLabel: 'Accessible text for sending the prompt.',
  stopLabel: 'Accessible text for stopping the current operation.',
  jumpLabel: 'Accessible text for jumping to the latest chat message.',
  pageCount: 'Total number of pages available to the pagination control.',
  navigation: 'Shows directional pagination actions.',
  buttons:
    'Per-button visibility and presentation overrides; false hides the corresponding action.',
  apply: 'Commits the editor draft through the application-provided handler.',
  cancel:
    'Cancel action or handler for discarding the current draft; false hides an action descriptor.',
  save: 'Save action or handler for committing the current draft; false hides an action descriptor.',
  deleteAction: 'Delete action descriptor; false omits the action.',
  reset: 'Reset action descriptor; false omits the action.',
  parseValue:
    'Converts typed text into a valid field value; return undefined when parsing fails.',
  change: 'Updates the draft assignee selection without committing the field.',
  defaultUnits: 'Default allocation units applied when assigning a resource.',
  showAvatars: 'Displays resource avatars beside assignee labels.',
};

const calendar = {
  month: 'Month currently displayed, expressed as a library ISO date string.',
  focusedDate: 'ISO date of the day that currently has keyboard focus.',
  referenceDate:
    'Reference ISO date used for Today and relative calendar presentation.',
  selection:
    'Current selected date/range, or the selection mode where the declared type is a mode string.',
  preview: 'Date range currently previewed while the user chooses a selection.',
  calendarSystem:
    'Calendar system used for display; stored values retain the ISO date representation.',
  system: 'Calendar system used to render month and year values.',
  numberOfMonths: 'Number of months displayed simultaneously.',
  pagedNavigation:
    'Moves by the number of visible months instead of by a single month.',
  reverseMonths: 'Displays simultaneous months in reverse order.',
  captionLayout: 'Chooses a text caption or month/year selection dropdowns.',
  endMonth:
    'Latest month available through navigation; this does not disable individual date values.',
  disableNavigation: 'Disables navigation between calendar months or years.',
  showWeekNumber: 'Displays the week-number column.',
  weekNumbering: 'Uses ISO week numbers or locale-based week numbering.',
  formatWeekNumber: 'Formats a numeric week number for display.',
  presets: 'Predefined labeled date selections offered as quick actions.',
  cellSize: 'Size of calendar day cells in pixels.',
  timeZone:
    'Time zone used for resolving Today; ISO date values themselves do not shift zones.',
  weekStartsOn:
    'First weekday of the week, from 0 (Sunday) through 6 (Saturday).',
  isDateDisabled: 'Return true to prevent selection of the supplied ISO date.',
  showOutsideDays:
    'Renders dates belonging to adjacent months in the current month grid.',
  allowOutsideMonthSelection:
    'Allows selecting visible dates from adjacent months.',
  fixedWeeks: 'Keeps a fixed six-week layout for every month.',
  showTodayButton: 'Shows the action for selecting or navigating to Today.',
  showPreviousButton: 'Shows the previous-period navigation action.',
  showNextButton: 'Shows the next-period navigation action.',
  showMonthLabel: 'Displays the current month caption.',
  showWeekdays: 'Displays weekday column labels.',
  defaultView: 'Initial calendar view, month or year.',
  isMonthDisabled: 'Return true to prevent selection of the supplied month.',
  dayClassName:
    'Additional day-cell classes, optionally computed from the date and day state.',
  renderDay:
    'Custom content renderer for a day, receiving its ISO date and selected/disabled/preview state.',
  formatMonth: 'Formats the month caption for the supplied locale.',
  formatWeekday:
    'Formats the weekday column label for the supplied date and locale.',
  formatDayLabel: 'Formats the accessible name for a calendar day.',
  onMonthChange:
    'Receives the newly requested visible month; update month in controlled compositions.',
  onFocusedDateChange:
    'Receives the ISO date to which calendar keyboard focus moved.',
  onPreviewDateChange:
    'Receives the date currently being previewed, or undefined when the preview clears.',
  validateSelection:
    'Validates a proposed selection. Return false or an explanatory string to reject it.',
  onInvalidSelection:
    'Receives the rejection reason and the attempted date when selection validation fails.',
  onViewChange: 'Receives the newly selected calendar view.',
  caption: 'Custom content replacing the calendar caption.',
  labelAction: 'Optional action associated with the month/year label.',
  showLabel: 'Shows the current period label.',
  showPrevious: 'Shows the previous-period button.',
  showNext: 'Shows the next-period button.',
  previousDisabled: 'Disables the previous-period button.',
  nextDisabled: 'Disables the next-period button.',
  onPrevious: 'Requests navigation to the previous period.',
  onNext: 'Requests navigation to the next period.',
  dates: 'ISO dates displayed by the calendar grid or weekday row.',
  weekNumberLabel: 'Accessible label for the week-number column.',
  format: 'Formats a date for the supplied locale.',
  date: 'ISO date represented by this day button.',
  outside:
    'Marks a day belonging to a month outside the currently displayed month.',
  focused: 'Marks the item or date that currently has keyboard focus.',
  previewed: 'Marks a day included in the current selection preview.',
  previewInvalid:
    'Marks the preview as unavailable without changing the committed selection.',
  previewDescriptionId:
    'ID of the accessible explanation associated with invalid preview dates.',
  rangeStart: 'Marks the first day of the selected range.',
  rangeEnd: 'Marks the last day of the selected range.',
  previewStart: 'Marks the first day of the preview range.',
  previewEnd: 'Marks the last day of the preview range.',
  today: 'Marks the day corresponding to Today.',
  onPreview: 'Updates the date preview; undefined clears it.',
  selectedDates: 'Independent ISO dates selected in multiple-selection mode.',
  visibleMonths: 'Months shown together, used to distinguish outside dates.',
  weekNumber: 'Formats the week-number label for the supplied date.',
  isDisabled: 'Return true when the supplied date must not be interactive.',
  onEscape: 'Handles Escape from the month/year grid.',
  defaultMonth: 'Initial displayed month when month is not controlled.',
  excludeDisabled: 'Prevents a selected range from including disabled dates.',
  mode: 'Selects single-date, multiple-date or date-range selection behavior.',
};

const extra = {
  resources:
    'Resources available for selection, with IDs and display metadata.',
  selectedResourceIds: 'IDs of the currently selected resources.',
  classNames:
    'CSS class overrides for named internal parts; expand the type for the supported part names.',
  contentClassNames:
    'CSS classes for the item icon, copy, label and description.',
  unassigned: 'Optional choice for representing an unassigned resource.',
  resourceDataAttribute:
    'Data attribute used to identify resource items in the rendered list.',
  isResourceDisabled: 'Return true for resources that cannot be selected.',
  getAvatarColor: 'Returns the avatar accent color for a resource.',
  collapsed: 'Whether the feedback panel details are collapsed.',
  resource: 'Resource data used to render the avatar.',
  defaultLabel: 'Label for the default or unset color choice.',
  colorAriaLabel: 'Returns the accessible label for a palette option.',
  includeDefault: 'Includes a default/unset choice in the color palette.',
  defaultDisabled: 'Disables the default/unset palette choice.',
  customLabel: 'Label for choosing a custom color.',
  customHexLabel: 'Accessible label for entering a custom hexadecimal color.',
  invalidColor: 'Validation message shown when the entered color is invalid.',
  colorLabels: 'Maps color values to localized display/accessibility labels.',
  optional: 'Allows the color value to be cleared or left unset.',
  showPoints: 'Shows markers at chart data points.',
  showValues: 'Shows formatted numeric values beside chart data points.',
  showGrid: 'Shows the chart grid lines.',
  legend: 'Legend text identifying the chart series.',
  tooltip: 'Enables hover/focus tooltips for chart or timeline values.',
  tooltipIndicator: 'Style of the visual indicator used with chart tooltips.',
  interpolation:
    'Connects line/area values with straight segments or stepped transitions.',
  areaFill: 'Uses a solid or gradient fill for the area chart.',
  days: 'Weekday labels and identifiers displayed by the time grid.',
  cells: 'Keys of the currently selected time-grid cells.',
  weekendDays: 'Weekday numbers that should use the weekend presentation.',
  workingHours:
    'Working-time boundaries used to distinguish working and non-working cells.',
  gridLabel: 'Accessible name for the time-grid matrix.',
  hourLabel: 'Formats the label for an hour row.',
  cellLabel:
    'Returns the accessible label for a day/time cell and its selected state.',
  onPointerDown: 'Starts a pointer interaction on the supplied time-grid cell.',
  onPointerEnter:
    'Extends a pointer interaction to the supplied day/hour cell.',
  invalidText:
    'Validation message shown when the duration cannot be parsed or accepted.',
  unitButtons: 'Shows the controls for selecting a duration unit.',
  unitLabels: 'Overrides localized labels for duration units.',
  unitLabel: 'Accessible label for the duration-unit control.',
  modeLabel: 'Accessible label for the duration mode control.',
  workingLabel: 'Label for working-time duration mode.',
  elapsedLabel: 'Label for elapsed-time duration mode.',
  defaultUnit: 'Unit assumed when a duration value does not specify one.',
  allowedUnits: 'Duration units offered by the editor.',
  allowElapsed:
    'Allows elapsed-time duration values in addition to working-time values.',
  maximumFractionDigits:
    'Maximum number of fractional digits used when formatting a duration.',
  kind: 'Date/time value kind handled by the temporal control.',
  calendar:
    'Calendar presentation, navigation and selection options for the temporal picker.',
  minTime: 'Earliest permitted time, expressed in the control time format.',
  maxTime: 'Latest permitted time, expressed in the control time format.',
  timeStep:
    'Step between selectable times in seconds; defaults to 60 for minute precision or 1 for second precision.',
  precision: 'Includes minutes only or also exposes seconds.',
  timeFormat:
    'Uses locale-default, explicit 12-hour or explicit 24-hour time presentation.',
  endpoint: 'Range endpoint being edited, from or to.',
  picker: 'Configuration passed to the popup temporal picker.',
};

const sources = {
  'pdf-viewer/types.ts': {
    source:
      'PDF URL, Uint8Array, ArrayBuffer or Blob. null or an omitted source shows the empty viewer.',
    fileName: 'Display/download filename override for the document.',
    initialPage:
      'Initial one-based page number, default 1; clamped to the available pages.',
    initialZoom:
      'Initial zoom, default page-width. Use a numeric scale from 0.25 to 5 (1 = 100%), page-width or page-fit.',
    onLoad: 'Receives pageCount and fileName when a document has loaded.',
    onPageChange: 'Receives the current one-based page number when it changes.',
    onZoomChange:
      'Receives the selected zoom mode/value and the resolved numeric scale.',
    onError: 'Receives document loading, worker or viewer operation errors.',
  },
  'pdf-viewer/component.tsx': {
    text: 'Overrides any of the default PDF viewer labels; unspecified labels keep their defaults.',
    height: 'Viewer height as a CSS length or a number in pixels.',
    onReady:
      'Receives the viewer controller so your application can navigate, zoom, search, print or download.',
    renderToolbar:
      'Replaces the toolbar using the controller, current state and default toolbar props supplied to the callback.',
    renderStatus:
      'Replaces loading, empty and error status content using the current viewer state.',
  },
  'pdf-viewer/controller.ts': {
    setPrintTitle: 'Sets the title used for the temporary printable document.',
    retry: 'Retries loading the last source after an error.',
    setCallbacks:
      'Updates application callbacks without recreating the viewer.',
    subscribe:
      'Subscribes to viewer state changes; returns an unsubscribe function.',
    attach:
      'Initializes the viewer in its container before loading a document.',
    goToPage:
      'Navigates to a one-based page number, clamped to the document page count.',
    setZoom:
      'Applies a numeric scale or page-width/page-fit mode when a document is ready.',
    rotate: 'Rotates all pages clockwise by 90 degrees.',
    search:
      'Searches the document; previous selects search direction and again continues to the next match.',
    clearSearch: 'Closes the search state and removes match highlighting.',
    download: 'Downloads the currently loaded PDF.',
    print: 'Prepares and opens the print view for the loaded PDF.',
    cancelPrint: 'Cancels an in-progress print preparation.',
    destroy: 'Releases the document, worker, listeners and viewer resources.',
  },
  'pdf-viewer/toolbar.tsx': {
    config:
      'Toolbar groups, visibility and button options. false hides all tools; an array chooses groups; an object configures individual controls.',
    text: 'Partial overrides for the default PDF viewer toolbar labels.',
    searchOpen: 'Whether the viewer search field is currently shown.',
    onToggleSearch:
      'Requests toggling the search panel and supplies its triggering element for focus restoration.',
  },
  'ai/chat.tsx': { from: 'Message author role: user, assistant or system.' },
  'calendar/types.ts': {
    from: 'First ISO date in the selected range.',
    to: 'Last ISO date in the selected range.',
  },
  'calendar/picker.tsx': {
    max: 'Maximum selected date count in multiple mode, or maximum range length in range mode.',
  },
  'distribution-chart/types.ts': {
    type: 'Chart presentation: bar, line or area.',
  },
  'search-input/index.tsx': {
    type: 'Native input behavior: search or plain text.',
  },
};

const words = (name) =>
  name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
export function supplementalDescription(name, node) {
  const file = node?.getSourceFile().fileName.split('/packages/ui/src/')[1];
  if (/\/translations\.ts$/.test(file ?? ''))
    return `Localized text for ${words(name)}; retain any substitution placeholders.`;
  if (sources[file]?.[name]) return sources[file][name];
  if (common[name]) return common[name];
  if (calendar[name]) return calendar[name];
  if (extra[name]) return extra[name];
  if (
    /ClassName$/.test(name) ||
    /Class$/.test(name) ||
    /ClassNames$/.test(name)
  )
    return `Additional CSS classes for the ${words(name.replace(/ClassNames?$/, '').replace(/Class$/, ''))} part of the component.`;
  if (/\/translations\.ts$/.test(file ?? ''))
    return `Localized text for ${words(name)}; retain any substitution placeholders.`;
  return '';
}
