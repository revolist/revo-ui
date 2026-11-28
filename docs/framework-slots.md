# Framework content and slots

The UI controls are Preact-based. React content is owned by React portals; Vue slots are owned by Vue; Angular projected content and `rvUiSlot` embedded views remain owned by Angular. Existing render callback props remain supported. A supplied slot takes precedence over its matching prop. The adapters' existing server-rendering boundaries remain unchanged.

## Framework examples

```tsx
<Button><strong>Save</strong></Button>
<SegmentedSwitch options={options} value={value} onChange={setValue}
  renderOption={(option, state) => <strong>{option.label} {state.active ? '✓' : ''}</strong>} />
```

```vue
<Dialog
  :open="open"
><p>Body</p><template #footer><Button>Save</Button></template></Dialog>
<SegmentedSwitch :options="options" :value="value" @change="onChange">
  <template #option="{ option, state }"><strong>{{ option.label }} {{ state.active }}</strong></template>
</SegmentedSwitch>
```

```html
<rv-button>Save</rv-button>
<rv-segmented-switch [options]="options" [value]="value">
  <ng-template rvUiSlot="option" let-option="option" let-state="state">
    <strong>{{ option.label }} {{ state.active }}</strong>
  </ng-template>
</rv-segmented-switch>
```

Import `UiSlotDirective` into Angular standalone components using templates. Static named content uses its content-prop name; default content uses ordinary children or `rvUiSlot="default"`. Scoped slots use the following names and contexts. TypeScript consumers can import `UiComponentSlotContexts<'ComponentName'>` from `@revolist/ui/vue` or `@revolist/ui/angular`.

`CollapsibleSection.renderRoot` is a low-level Preact renderer: its children are Preact VNodes and cannot be forwarded into another framework's renderer. React, Vue, and Angular consumers can supply a Preact callback; Svelte retains its existing render snippet API, which can replace the root but cannot forward those children. Use the title, description, and default content slots for framework-owned content.

## Scoped slots

| Components                                        | Slot: context fields                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dropdown, Combobox, MultiSelect                   | `option`: option, selected; `value`: option; `placeholder`: placeholder; `selectedValue`: selectedOptions; `content`: content; `noResults`: none |
| DropdownPopupContent                              | `option`: option, selected; `noResults`: none                                                                                                    |
| SegmentedSwitch, SegmentedControl, Tabs           | `option`, `count`: option, state                                                                                                                 |
| Calendar, CalendarMonthGrid, CalendarPicker       | `day`: date, context                                                                                                                             |
| DatePicker, DateRangePicker                       | `day`: date, context; `trigger`: props                                                                                                           |
| DistributionChart, BarChart, LineChart, AreaChart | `tooltip`: datum, index                                                                                                                          |
| HistoryReview                                     | `changes`: context                                                                                                                               |
| AiResultView                                      | `table`: result                                                                                                                                  |
| Tooltip                                           | `content`: context                                                                                                                               |
| ReorderList                                       | `item`, `handle`: item, index                                                                                                                    |
| PdfViewer                                         | `toolbar`: controller, state, toolbarProps; `status`: state                                                                                      |
| AssigneeField                                     | `picker`: props; `value`: option, units                                                                                                          |

`AiChatEmptyState.renderContent` is a DOM mounting callback with cleanup, not a node renderer; continue using that callback or its ordinary children. Some content props contain application data as well as content. Consult the component's prop declaration for the accepted value and use slots only for the content variant.

## Content inside component data

Slots can replace content fields within the supplied data. Each repeated slot receives the original item and its zero-based index. The adapter leaves the caller's data unchanged and passes original items to callbacks. React uses a render prop named `render` plus the capitalized slot name; it also accepts React elements directly in nested content fields. Vue and Angular use the named slot and `rvUiSlot` forms shown above; Svelte accepts the same names in `slots`.

```vue
<Stepper label="Setup" :steps="steps">
  <template #stepIcon="{ step }"><MyIcon :name="step.id" /></template>
  <template #stepContent="{ step, index }"><StepForm :step="step" :index="index" /></template>
</Stepper>
```

```tsx
<Stepper
  label="Setup"
  steps={steps}
  renderStepContent={({ step, index }) => (
    <StepForm step={step} index={index} />
  )}
/>
```

```html
<rv-stepper label="Setup" [steps]="steps">
  <ng-template rvUiSlot="stepContent" let-step="step" let-index="index">
    <app-step-form [step]="step" [index]="index" />
  </ng-template>
</rv-stepper>
```

| Components                                                      | Nested slot: context fields                                                                                     |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Stepper                                                         | `stepIcon`, `stepContent`: step, index                                                                          |
| CommandPalette                                                  | `commandIcon`: command, index                                                                                   |
| Attachments                                                     | `itemPreview`: item, index                                                                                      |
| ActivityTimeline                                                | `entryAvatar`, `entryTimestamp`, `entryHeader`, `entryContent`, `entryActions`, `entryDetails`: entry, index    |
| Trace                                                           | `stepTitle`, `stepStatus`, `stepDetails`: step, index, path (indices from the root, including the current step) |
| ChoiceChips                                                     | `optionLabel`, `optionInfo`: option, index                                                                      |
| SegmentedSwitch, SegmentedControl, Tabs, RadioGroup             | `optionLabel`: option, index                                                                                    |
| DialogActionFooter                                              | `cancelLabel`, `saveLabel`, `deleteLabel`, `resetLabel`: no context                                             |
| MetricTile                                                      | `visualIcon`: no context; requires `visual` options                                                             |
| MetricPanel                                                     | `itemVisualIcon`: item, index; applies to items with `visual` options                                           |
| BrushRange                                                      | `chartTooltip`: datum, index; requires chart options                                                            |
| CalendarNavigator, TemporalPicker, TemporalDraft, DateTimeField | `calendarFooter`: no context; `calendarDay`: date, context                                                      |

The footer's default Cancel and Save actions can receive labels without explicit action options. Delete and Reset remain opt-in; a slot does not enable an absent or disabled action. For icon-only segmented choices, supply each option's `ariaLabel` when its visible label comes from a slot.

The inventory below lists declared top-level content props and node-rendering callbacks in the public catalog. Nested content is listed in the preceding table. Names under scoped renderer props correspond to the scoped-slot table above.

## Component inventory

| Component             | Content slots                                                    | Scoped renderer props                                                                                         |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Cursor                | `default`                                                        | —                                                                                                             |
| CursorBody            | `default`                                                        | —                                                                                                             |
| CursorName            | `default`                                                        | —                                                                                                             |
| CursorMessage         | `default`                                                        | —                                                                                                             |
| ActionBar             | `default`                                                        | —                                                                                                             |
| HistoryReview         | `default`                                                        | `renderChanges`                                                                                               |
| FilterBar             | `default`                                                        | —                                                                                                             |
| Stepper               | `completedContent`                                               | —                                                                                                             |
| AiChat                | `default`                                                        | —                                                                                                             |
| AiChatContent         | `default`                                                        | —                                                                                                             |
| AiChatComposer        | `actions`, `footer`                                              | —                                                                                                             |
| AiChatEmptyState      | `default`                                                        | —                                                                                                             |
| AiMessage             | `default`                                                        | —                                                                                                             |
| AiMessageContent      | `default`                                                        | —                                                                                                             |
| AiMessageActions      | `default`                                                        | —                                                                                                             |
| AiReasoning           | `default`                                                        | —                                                                                                             |
| AiTask                | `default`                                                        | —                                                                                                             |
| AiTaskItem            | `default`                                                        | —                                                                                                             |
| AiPromptInput         | `actions`, `footer`                                              | —                                                                                                             |
| AiResult              | `actions`, `default`                                             | —                                                                                                             |
| AiResultView          | —                                                                | `renderTable`                                                                                                 |
| AiAssistant           | `default`, `footer`                                              | —                                                                                                             |
| AiRequestTrail        | `footer`                                                         | —                                                                                                             |
| Input                 | `default`                                                        | —                                                                                                             |
| SvgButton             | `iconContent`, `default`                                         | —                                                                                                             |
| SegmentedSwitch       | —                                                                | `renderOption`, `renderCount`                                                                                 |
| ChoiceChipInfoButton  | `default`                                                        | —                                                                                                             |
| ChoiceChip            | `default`, `info`                                                | —                                                                                                             |
| SearchInput           | `default`                                                        | —                                                                                                             |
| SearchActionBar       | `actions`, `default`                                             | —                                                                                                             |
| FilterChip            | `default`                                                        | —                                                                                                             |
| FormField             | `label`, `default`, `hint`                                       | —                                                                                                             |
| DisclosureSummary     | `default`, `icon`                                                | —                                                                                                             |
| EditorSplitLayout     | `default`                                                        | —                                                                                                             |
| EditorPane            | `default`                                                        | —                                                                                                             |
| EditorList            | `default`                                                        | —                                                                                                             |
| EditorListItem        | `default`, `icon`, `label`, `description`                        | —                                                                                                             |
| EditorListItemContent | `icon`, `label`, `description`                                   | —                                                                                                             |
| EditorListGroup       | `default`                                                        | —                                                                                                             |
| Calendar              | `footer`                                                         | `renderDay`                                                                                                   |
| CalendarHeader        | `caption`                                                        | —                                                                                                             |
| CalendarDay           | `content`                                                        | —                                                                                                             |
| CalendarMonthGrid     | —                                                                | `renderDay`                                                                                                   |
| CalendarPicker        | `footer`                                                         | `renderDay`                                                                                                   |
| Dropdown              | —                                                                | `renderContent`, `renderOption`, `renderValue`, `renderPlaceholder`, `renderSelectedValue`, `renderNoResults` |
| DropdownPopup         | `default`                                                        | —                                                                                                             |
| DropdownPopupContent  | —                                                                | `renderOption`, `renderNoResults`                                                                             |
| IconButton            | `default`                                                        | —                                                                                                             |
| ToggleButton          | `default`                                                        | —                                                                                                             |
| ButtonGroup           | `default`                                                        | —                                                                                                             |
| SegmentedControl      | —                                                                | `renderOption`, `renderCount`                                                                                 |
| Tabs                  | —                                                                | `renderOption`, `renderCount`                                                                                 |
| TabPanel              | `default`                                                        | —                                                                                                             |
| TextInput             | `default`                                                        | —                                                                                                             |
| Textarea              | `default`                                                        | —                                                                                                             |
| NumberInput           | `default`                                                        | —                                                                                                             |
| Chip                  | `default`                                                        | —                                                                                                             |
| FieldHint             | `default`                                                        | —                                                                                                             |
| FieldError            | `default`                                                        | —                                                                                                             |
| FormSection           | `default`                                                        | —                                                                                                             |
| Disclosure            | `default`, `summary`                                             | —                                                                                                             |
| CollapsibleSection    | `title`, `description`, `default`                                | `renderRoot` (Preact root callback; see note above)                                                           |
| Panel                 | `default`                                                        | —                                                                                                             |
| Toolbar               | `default`                                                        | —                                                                                                             |
| ToolbarGroup          | `default`                                                        | —                                                                                                             |
| Badge                 | `default`                                                        | —                                                                                                             |
| LoadingOverlay        | `default`                                                        | —                                                                                                             |
| EmptyState            | `default`                                                        | —                                                                                                             |
| Menu                  | `default`                                                        | —                                                                                                             |
| MenuItem              | `default`                                                        | —                                                                                                             |
| Submenu               | `default`                                                        | —                                                                                                             |
| Pagination            | `default`                                                        | —                                                                                                             |
| Button                | `default`                                                        | —                                                                                                             |
| Pane                  | `default`                                                        | —                                                                                                             |
| SplitLayout           | `default`                                                        | —                                                                                                             |
| Alert                 | `default`, `icon`, `title`, `description`, `actions`             | —                                                                                                             |
| Listbox               | `default`                                                        | —                                                                                                             |
| ListboxOption         | `default`, `icon`, `label`, `description`                        | —                                                                                                             |
| ListboxGroup          | `default`                                                        | —                                                                                                             |
| ListboxOptionContent  | `icon`, `label`, `description`                                   | —                                                                                                             |
| Combobox              | —                                                                | `renderContent`, `renderOption`, `renderValue`, `renderPlaceholder`, `renderSelectedValue`, `renderNoResults` |
| MultiSelect           | —                                                                | `renderContent`, `renderOption`, `renderValue`, `renderPlaceholder`, `renderSelectedValue`, `renderNoResults` |
| Popover               | `default`                                                        | —                                                                                                             |
| Tooltip               | `default`                                                        | `renderContent`                                                                                               |
| Dialog                | `default`, `footer`                                              | —                                                                                                             |
| ConfirmDialog         | `default`, `footer`                                              | —                                                                                                             |
| DatePicker            | `footer`                                                         | `renderTrigger`, `renderDay`                                                                                  |
| DateRangePicker       | `footer`                                                         | `renderDay`, `renderTrigger`                                                                                  |
| DialogHeader          | `default`                                                        | —                                                                                                             |
| DialogBody            | `default`                                                        | —                                                                                                             |
| DialogFooter          | `default`                                                        | —                                                                                                             |
| DistributionChart     | —                                                                | `renderTooltip`                                                                                               |
| BarChart              | —                                                                | `renderTooltip`                                                                                               |
| LineChart             | —                                                                | `renderTooltip`                                                                                               |
| AreaChart             | —                                                                | `renderTooltip`                                                                                               |
| BrushRange            | `startLabel`, `selectionLabel`, `endLabel`                       | —                                                                                                             |
| OptionButton          | `label`, `detail`                                                | —                                                                                                             |
| HighlightedTextInput  | `default`, `highlight`                                           | —                                                                                                             |
| InlineFieldGroup      | `default`                                                        | —                                                                                                             |
| FieldSummary          | `default`                                                        | —                                                                                                             |
| FieldLibrary          | `count`, `icon`, `default`                                       | —                                                                                                             |
| FieldGroupHeading     | `default`, `actions`                                             | —                                                                                                             |
| FieldGroup            | `default`, `heading`, `actions`                                  | —                                                                                                             |
| FieldList             | `default`, `placeholder`                                         | —                                                                                                             |
| FieldRow              | `default`, `indicator`                                           | —                                                                                                             |
| FieldContent          | `icon`, `default`                                                | —                                                                                                             |
| FieldItem             | `default`                                                        | —                                                                                                             |
| FieldLibraryList      | `default`                                                        | —                                                                                                             |
| SelectedField         | `indicator`, `label`, `icon`, `actions`                          | —                                                                                                             |
| FieldActions          | `default`                                                        | —                                                                                                             |
| FieldStatusBadge      | `default`                                                        | —                                                                                                             |
| DialogForm            | `default`                                                        | —                                                                                                             |
| DialogCloseButton     | `default`                                                        | —                                                                                                             |
| DialogActionFooter    | `default`, `start`, `end`                                        | —                                                                                                             |
| DialogActions         | `default`                                                        | —                                                                                                             |
| DialogTitleInput      | `default`                                                        | —                                                                                                             |
| EditableDialogHeader  | `default`, `description`                                         | —                                                                                                             |
| ControlTooltip        | `content`                                                        | —                                                                                                             |
| InspectorSection      | `default`                                                        | —                                                                                                             |
| ComparisonPreview     | `formatted`                                                      | —                                                                                                             |
| FilterBadge           | `label`                                                          | —                                                                                                             |
| ReorderList           | `empty`                                                          | `renderItem`, `renderHandle`                                                                                  |
| ReorderHandle         | `default`                                                        | —                                                                                                             |
| ActivityMessage       | `avatar`, `timestamp`, `header`, `default`, `actions`, `details` | —                                                                                                             |
| MetricTile            | `default`, `visualIcon` (requires `visual` options)              | —                                                                                                             |
| MetricPanel           | `default`                                                        | —                                                                                                             |
| PdfViewer             | —                                                                | `renderToolbar`, `renderStatus`                                                                               |
| DateTimeField         | `default`                                                        | —                                                                                                             |
| AssigneeField         | —                                                                | `renderPicker`, `renderValue`                                                                                 |
| AssigneePickerLayout  | `default`                                                        | —                                                                                                             |

Components without a declared top-level content or scoped renderer extension point: `CircularSlider`, `CursorPointer`, `BackupHistory`, `FileTree`, `CommandPalette`, `Cascader`, `Attachments`, `Trace`, `ActivityTimeline`, `Tree`, `AiSuggestions`, `AiActionStatus`, `AiResultTable`, `AiResultMetrics`, `AiResultText`, `AiChangePreview`, `SvgIcon`, `RemoveButton`, `Checkbox`, `Switch`, `ChoiceChips`, `CalendarNavigator`, `MiniCalendar`, `CalendarWeekdays`, `CalendarYearGrid`, `SharedResourcePicker`, `ResourcePickerAvatar`, `ColorPalette`, `ColorPicker`, `PreactRangeSlider`, `SingleValueSlider`, `SliderField`, `RadioGroup`, `NumberStepper`, `LookupField`, `ToolbarSeparator`, `CountBadge`, `Spinner`, `MenuSeparator`, `ResizeHandle`, `CircularProgress`, `Rating`, `StatusFeedbackPanel`, `Toaster`, `StatusBadge`, `Avatar`, `ProgressBar`, `Legend`, `TimeGrid`, `FieldIcon`, `FieldRemoveButton`, `FieldRemoveIcon`, `FieldDropIndicator`, `IconChoiceGroup`, `IconToggleButton`, `TypographyControls`, `FilterBadgeInfoButton`, `RatingStar`, `RatingChoice`, `TimelineTrack`, `IconToolbar`, `PdfViewerToolbar`, `NumberDraft`, `MaskedDraft`, `DurationField`, `DurationDraft`, `HtmlEditor`, `TemporalPicker`, `TemporalDraft`, `AssigneePicker`.
