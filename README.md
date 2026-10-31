# Revo UI

**RevoGrid's UI component library for financial apps, reporting dashboards, and project management.**

Compose data-rich workspaces with shared controls, pickers, charts, timelines, dialogs, and feedback. Use React, Vue, Angular, Svelte, Preact, or vanilla TypeScript. The package name remains **`@revolist/ui`**.

[Live components](https://ui.rv-grid.com/#buttons) · [Interactive overview](https://ui.rv-grid.com/) · [Framework guides](https://ui.rv-grid.com/?page=frameworks) · [RevoGrid](https://rv-grid.com/) · [Pro documentation](https://pro.rv-grid.com/)

[![Revo UI components for financial dashboards and project management](docs/assets/components-preview.jpg)](https://ui.rv-grid.com/)

## Contents

- [Getting started](#getting-started)
- [Framework integrations](#framework-integrations)
- [Complete component reference](#complete-component-reference)
- [Usage contracts](#usage-contracts)
- [Buttons and navigation](#buttons-and-navigation)
- [Dropdowns with user images](#dropdowns-with-user-images)
- [Advanced slider](#advanced-slider)
- [Conditional chart colors](#conditional-chart-colors)
- [Interactive timeline](#interactive-timeline)
- [Theming, sizing, and motion](#theming-sizing-and-motion)
- [Accessibility and localization](#accessibility-and-localization)
- [RevoGrid products](#revogrid-products)
- [Licensing](#licensing)

## Getting started

Install from a registry configured with access to `@revolist/ui`, or use the package in the RevoGrid workspace. Preact is the shared rendering peer; also install your application's host framework. React adapters require `react-dom`.

```sh
pnpm add @revolist/ui preact
```

Import the shared stylesheet once in your application entry point:

```ts
import '@revolist/ui/styles.css';
```

A controlled React example:

```tsx
import { useState } from 'react';
import { Button, TextInput } from '@revolist/ui/react';

export function ReportName() {
  const [name, setName] = useState('Monthly revenue');
  return (
    <>
      <TextInput aria-label="Report name" value={name} onValueChange={setName} />
      <Button rounded variant="primary" onClick={() => console.log(name)}>
        Create report
      </Button>
    </>
  );
}
```

Controls can be used without a RevoGrid instance. Grid cell templates, providers, row data, and product-specific scheduling logic stay in their owning product packages.

## Framework integrations

| Framework | Entry point | Integration | Guide |
| --- | --- | --- | --- |
| React | `@revolist/ui/react` | Named React components; controlled props, callbacks, children, and custom content. | [React usage](https://ui.rv-grid.com/?page=frameworks#react) |
| Vue | `@revolist/ui/vue` | Named Vue components, events and slots; declared value models support `v-model`. | [Vue usage](https://ui.rv-grid.com/?page=frameworks#vue) |
| Angular | `@revolist/ui/angular` | Standalone `UiComponent` host with `component`, `props`, `uiEvent`, `valueChange`, and `rvUiSlot` templates. | [Angular usage](https://ui.rv-grid.com/?page=frameworks#angular) |
| Svelte 5 | `@revolist/ui/svelte` | `UiComponent` host with reactive props, callbacks, and content snippets. | [Svelte usage](https://ui.rv-grid.com/?page=frameworks#svelte) |
| Preact | `@revolist/ui/preact` | Direct components with Preact state, hooks, and render callbacks. | [Preact usage](https://ui.rv-grid.com/?page=frameworks#preact) |
| Vanilla TypeScript | `@revolist/ui/framework` | `createFrameworkMount` and `uiComponents`; call `render` to update and `destroy` on disposal. | [Vanilla usage](https://ui.rv-grid.com/?page=frameworks#vanilla-typescript) |

Additional entries include `@revolist/ui/native` for DOM controllers and presentation helpers, `@revolist/ui/react-control` / `vue-control` / `angular-control` / `svelte-control` for framework-owned controls, and dedicated entries such as `@revolist/ui/select`, `@revolist/ui/timeline-track`, and `@revolist/ui/pdf-viewer`. Use the installed package's TypeScript declarations for exact prop types.

## Complete component reference

Every component in the shared adapter catalog is listed below. Each name links to a generated prop/API reference, followed by its live example page, where variants and expandable, formatted usage examples are grouped together. Composition helpers are documented alongside their parent control; not every helper has an isolated specimen.

### Buttons

Actions, grouped commands, toggled state, icons, compact sizing, busy states and pill corners.

[Button](docs/api/Button.md) ([examples](https://ui.rv-grid.com/#buttons)) | [IconButton](docs/api/IconButton.md) ([examples](https://ui.rv-grid.com/#buttons)) | [SvgButton](docs/api/SvgButton.md) ([examples](https://ui.rv-grid.com/#buttons)) | [ToggleButton](docs/api/ToggleButton.md) ([examples](https://ui.rv-grid.com/#buttons)) | [ButtonGroup](docs/api/ButtonGroup.md) ([examples](https://ui.rv-grid.com/#buttons)) | [DeleteButton](docs/api/DeleteButton.md) ([examples](https://ui.rv-grid.com/#buttons)) | [RemoveButton](docs/api/RemoveButton.md) ([examples](https://ui.rv-grid.com/#buttons)) | [Icon](docs/api/Icon.md) ([examples](https://ui.rv-grid.com/#buttons)) | [SvgIcon](docs/api/SvgIcon.md) ([examples](https://ui.rv-grid.com/#buttons))

### Selection controls

Checkboxes, switches, radio groups, choice chips and option rows for independent or exclusive choices.

[Checkbox](docs/api/Checkbox.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [Switch](docs/api/Switch.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [RadioGroup](docs/api/RadioGroup.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [ChoiceChips](docs/api/ChoiceChips.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [ChoiceChip](docs/api/ChoiceChip.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [ChoiceChipInfoButton](docs/api/ChoiceChipInfoButton.md) ([examples](https://ui.rv-grid.com/#selection-controls)) | [OptionButton](docs/api/OptionButton.md) ([examples](https://ui.rv-grid.com/#selection-controls))

### Tabs and lists

Switch content, group options and present plain, icon or descriptive selection rows.

[SegmentedControl](docs/api/SegmentedControl.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [SegmentedSwitch](docs/api/SegmentedSwitch.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [Tabs](docs/api/Tabs.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [TabPanel](docs/api/TabPanel.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [Listbox](docs/api/Listbox.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [ListboxOption](docs/api/ListboxOption.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [ListboxGroup](docs/api/ListboxGroup.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [ListboxOptionContent](docs/api/ListboxOptionContent.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [EditorList](docs/api/EditorList.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [EditorListItem](docs/api/EditorListItem.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [EditorListItemContent](docs/api/EditorListItemContent.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists)) | [EditorListGroup](docs/api/EditorListGroup.md) ([examples](https://ui.rv-grid.com/#tabs-and-lists))

### Inputs and forms

Text, search and numeric entry; field labels, validation, inline layouts and editor drafts.

[Input](docs/api/Input.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [TextInput](docs/api/TextInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [Textarea](docs/api/Textarea.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [SearchInput](docs/api/SearchInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [NumberInput](docs/api/NumberInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [NumberStepper](docs/api/NumberStepper.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [DateInput](docs/api/DateInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [TimeInput](docs/api/TimeInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [DateTimeInput](docs/api/DateTimeInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [FormField](docs/api/FormField.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [FieldHint](docs/api/FieldHint.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [FieldError](docs/api/FieldError.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [FormSection](docs/api/FormSection.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [HighlightedTextInput](docs/api/HighlightedTextInput.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [InlineFieldGroup](docs/api/InlineFieldGroup.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [NumberDraft](docs/api/NumberDraft.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [MaskedDraft](docs/api/MaskedDraft.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms)) | [HtmlEditor](docs/api/HtmlEditor.md) ([examples](https://ui.rv-grid.com/#inputs-and-forms))

### Selects, chips and resources

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Dropdown](docs/api/Dropdown.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [DropdownPopup](docs/api/DropdownPopup.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [DropdownPopupContent](docs/api/DropdownPopupContent.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [Combobox](docs/api/Combobox.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [MultiSelect](docs/api/MultiSelect.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [Chip](docs/api/Chip.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [FilterChip](docs/api/FilterChip.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [RemovableChip](docs/api/RemovableChip.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [Avatar](docs/api/Avatar.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [ResourcePicker](docs/api/ResourcePicker.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [SharedResourcePicker](docs/api/SharedResourcePicker.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [ResourcePickerAvatar](docs/api/ResourcePickerAvatar.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [AssigneePicker](docs/api/AssigneePicker.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [AssigneeField](docs/api/AssigneeField.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) | [AssigneePickerLayout](docs/api/AssigneePickerLayout.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources))

### Sliders

Scalar and interval controls with labels, value badges, thumb values, ticks and units.

[Slider](docs/api/Slider.md) ([examples](https://ui.rv-grid.com/#sliders)) | [RangeSlider](docs/api/RangeSlider.md) ([examples](https://ui.rv-grid.com/#sliders)) | [SingleValueSlider](docs/api/SingleValueSlider.md) ([examples](https://ui.rv-grid.com/#sliders)) | [PreactRangeSlider](docs/api/PreactRangeSlider.md) ([examples](https://ui.rv-grid.com/#sliders)) | [SliderField](docs/api/SliderField.md) ([examples](https://ui.rv-grid.com/#sliders))

### Timeline track

Controlled timeline events with move/resize interactions, event colors, weighted phases and tooltips.

[TimelineTrack](docs/api/TimelineTrack.md) ([examples](https://ui.rv-grid.com/#timeline-track))

### Calendar and dates

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Calendar](docs/api/Calendar.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarHeader](docs/api/CalendarHeader.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarWeekdays](docs/api/CalendarWeekdays.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarDay](docs/api/CalendarDay.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarMonthGrid](docs/api/CalendarMonthGrid.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarYearGrid](docs/api/CalendarYearGrid.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [CalendarPicker](docs/api/CalendarPicker.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [DatePicker](docs/api/DatePicker.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [DateRangePicker](docs/api/DateRangePicker.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [DurationField](docs/api/DurationField.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [DurationDraft](docs/api/DurationDraft.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [TemporalPicker](docs/api/TemporalPicker.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [TemporalDraft](docs/api/TemporalDraft.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [DateTimeField](docs/api/DateTimeField.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [TimeGrid](docs/api/TimeGrid.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates)) | [Legend](docs/api/Legend.md) ([examples](https://ui.rv-grid.com/#calendar-and-dates))

### Color

Choose a color from a palette or picker and apply shared semantic interface colors.

[ColorPicker](docs/api/ColorPicker.md) ([examples](https://ui.rv-grid.com/#color)) | [ColorPalette](docs/api/ColorPalette.md) ([examples](https://ui.rv-grid.com/#color))

### Field configurators

Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.

[FieldIcon](docs/api/FieldIcon.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldSummary](docs/api/FieldSummary.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldLibrary](docs/api/FieldLibrary.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldGroupHeading](docs/api/FieldGroupHeading.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldGroup](docs/api/FieldGroup.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldList](docs/api/FieldList.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldRow](docs/api/FieldRow.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldContent](docs/api/FieldContent.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldItem](docs/api/FieldItem.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldLibraryList](docs/api/FieldLibraryList.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [SelectedField](docs/api/SelectedField.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldActions](docs/api/FieldActions.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldStatusBadge](docs/api/FieldStatusBadge.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldRemoveButton](docs/api/FieldRemoveButton.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldRemoveIcon](docs/api/FieldRemoveIcon.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [FieldDropIndicator](docs/api/FieldDropIndicator.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [ReorderList](docs/api/ReorderList.md) ([examples](https://ui.rv-grid.com/#field-configurators)) | [ReorderHandle](docs/api/ReorderHandle.md) ([examples](https://ui.rv-grid.com/#field-configurators))

### Formatting controls

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[InspectorSection](docs/api/InspectorSection.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [IconChoiceGroup](docs/api/IconChoiceGroup.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [IconToggleButton](docs/api/IconToggleButton.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [TypographyControls](docs/api/TypographyControls.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [ComparisonPreview](docs/api/ComparisonPreview.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [FilterBadgeInfoButton](docs/api/FilterBadgeInfoButton.md) ([examples](https://ui.rv-grid.com/#formatting-controls)) | [FilterBadge](docs/api/FilterBadge.md) ([examples](https://ui.rv-grid.com/#formatting-controls))

### Charts and range selection

Compact bar, line and area charts with values, labels, tooltips and a composed range brush.

[DistributionChart](docs/api/DistributionChart.md) ([examples](https://ui.rv-grid.com/#charts-and-range-selection)) | [BarChart](docs/api/BarChart.md) ([examples](https://ui.rv-grid.com/#charts-and-range-selection)) | [LineChart](docs/api/LineChart.md) ([examples](https://ui.rv-grid.com/#charts-and-range-selection)) | [AreaChart](docs/api/AreaChart.md) ([examples](https://ui.rv-grid.com/#charts-and-range-selection)) | [BrushRange](docs/api/BrushRange.md) ([examples](https://ui.rv-grid.com/#charts-and-range-selection))

### Dialogs and floating surfaces

Dialogs, confirmations, contextual surfaces and editable dialog sections with shared actions.

[Dialog](docs/api/Dialog.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [ConfirmDialog](docs/api/ConfirmDialog.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [Popover](docs/api/Popover.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [Tooltip](docs/api/Tooltip.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [ControlTooltip](docs/api/ControlTooltip.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogHeader](docs/api/DialogHeader.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogBody](docs/api/DialogBody.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogFooter](docs/api/DialogFooter.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogForm](docs/api/DialogForm.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogCloseButton](docs/api/DialogCloseButton.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogActionFooter](docs/api/DialogActionFooter.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogActions](docs/api/DialogActions.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [DialogTitleInput](docs/api/DialogTitleInput.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces)) | [EditableDialogHeader](docs/api/EditableDialogHeader.md) ([examples](https://ui.rv-grid.com/#dialogs-and-floating-surfaces))

### Menus and toolbars

Command menus, nested commands, separators and grouped toolbar actions.

[Menu](docs/api/Menu.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [MenuItem](docs/api/MenuItem.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [MenuSeparator](docs/api/MenuSeparator.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [Submenu](docs/api/Submenu.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [Toolbar](docs/api/Toolbar.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [ToolbarGroup](docs/api/ToolbarGroup.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars)) | [ToolbarSeparator](docs/api/ToolbarSeparator.md) ([examples](https://ui.rv-grid.com/#menus-and-toolbars))

### Status and feedback

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Badge](docs/api/Badge.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [CountBadge](docs/api/CountBadge.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [Alert](docs/api/Alert.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [Spinner](docs/api/Spinner.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [LoadingOverlay](docs/api/LoadingOverlay.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [EmptyState](docs/api/EmptyState.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [FeedbackPanel](docs/api/FeedbackPanel.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [StatusFeedbackPanel](docs/api/StatusFeedbackPanel.md) ([examples](https://ui.rv-grid.com/#status-and-feedback)) | [StatusBadge](docs/api/StatusBadge.md) ([examples](https://ui.rv-grid.com/#status-and-feedback))

### Layout

Compose panes, split layouts, panels and disclosures with an interactive resize divider.

[Panel](docs/api/Panel.md) ([examples](https://ui.rv-grid.com/#layout)) | [Pane](docs/api/Pane.md) ([examples](https://ui.rv-grid.com/#layout)) | [SplitLayout](docs/api/SplitLayout.md) ([examples](https://ui.rv-grid.com/#layout)) | [EditorPane](docs/api/EditorPane.md) ([examples](https://ui.rv-grid.com/#layout)) | [EditorSplitLayout](docs/api/EditorSplitLayout.md) ([examples](https://ui.rv-grid.com/#layout)) | [ResizeHandle](docs/api/ResizeHandle.md) ([examples](https://ui.rv-grid.com/#layout)) | [Disclosure](docs/api/Disclosure.md) ([examples](https://ui.rv-grid.com/#layout)) | [DisclosureSummary](docs/api/DisclosureSummary.md) ([examples](https://ui.rv-grid.com/#layout))

### Pagination

Page selection and compact or numbered navigation.

[Pagination](docs/api/Pagination.md) ([examples](https://ui.rv-grid.com/#pagination))

### Progress and rating

Linear/circular completion and star-based rating controls.

[ProgressBar](docs/api/ProgressBar.md) ([examples](https://ui.rv-grid.com/#progress-and-rating)) | [CircularProgress](docs/api/CircularProgress.md) ([examples](https://ui.rv-grid.com/#progress-and-rating)) | [Rating](docs/api/Rating.md) ([examples](https://ui.rv-grid.com/#progress-and-rating)) | [RatingStar](docs/api/RatingStar.md) ([examples](https://ui.rv-grid.com/#progress-and-rating)) | [RatingChoice](docs/api/RatingChoice.md) ([examples](https://ui.rv-grid.com/#progress-and-rating))

### Activity messages

Compose an activity entry from an avatar, timestamp, header, body, details and actions.

[ActivityMessage](docs/api/ActivityMessage.md) ([examples](https://ui.rv-grid.com/#activity-messages))

### AI assistant

Presentation for messages, prompts, suggestions, reasoning, tasks, action state and result summaries. Applications provide the model and tools.

[AiChat](docs/api/AiChat.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiChatContent](docs/api/AiChatContent.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiChatComposer](docs/api/AiChatComposer.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiChatEmptyState](docs/api/AiChatEmptyState.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiMessage](docs/api/AiMessage.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiMessageContent](docs/api/AiMessageContent.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiMessageActions](docs/api/AiMessageActions.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiReasoning](docs/api/AiReasoning.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiTask](docs/api/AiTask.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiTaskItem](docs/api/AiTaskItem.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiPromptInput](docs/api/AiPromptInput.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiSuggestions](docs/api/AiSuggestions.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiActionStatus](docs/api/AiActionStatus.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiResult](docs/api/AiResult.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiChangePreview](docs/api/AiChangePreview.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiAssistant](docs/api/AiAssistant.md) ([examples](https://ui.rv-grid.com/#ai-assistant)) | [AiRequestTrail](docs/api/AiRequestTrail.md) ([examples](https://ui.rv-grid.com/#ai-assistant))

### PDF viewer

Display local or remote PDFs with navigation, search, zoom, rotation, print/download actions and a composable toolbar.

[PdfViewer](docs/api/PdfViewer.md) ([examples](https://ui.rv-grid.com/#pdf-viewer)) | [PdfViewerToolbar](docs/api/PdfViewerToolbar.md) ([examples](https://ui.rv-grid.com/#pdf-viewer))


### JSX select adapter

[**Select**](docs/api/Select.md) ([examples](https://ui.rv-grid.com/#selects-chips-and-resources)) is an additional direct Preact adapter exported from `@revolist/ui/select`. Its JSX `<option>` children are data descriptors for the shared dropdown, not mounted native select elements. Use `value` / `onValueChange` for controlled state, `defaultValue` for uncontrolled state, and `multiple` for an array of selected strings. React/Vue applications can use their named `Combobox`, `MultiSelect`, or `Dropdown` adapters.

```tsx
import { Select } from '@revolist/ui/select';

<Select aria-label="View" value={view} onValueChange={setView}>
  <option value="table">Table</option>
  <option value="board">Board</option>
  <option value="calendar" disabled>Calendar</option>
</Select>
```

## Usage contracts

| Concern | Contract |
| --- | --- |
| Controlled state | Keep values in the application and pass the matching callback. `TextInput` uses `onValueChange`; many pickers/sliders use `onChange`; verify the component's typed contract. |
| Dropdown data | `source` is an array of `{ value, label, ...metadata }` descriptors. `disabled` options remain visible and are skipped by keyboard selection. |
| Custom dropdown content | `renderOption` changes option content; `renderValue` changes the selected value. Preact receives `(h, option, selected)` / `(h, option)`. React callbacks omit the element-factory argument; Vue uses named slots. |
| Angular/Svelte hosts | Use names from the component catalog. `valueChange` / `onValueChange` is tied to the component's declared value model, not every callback. For a generic callback such as `onClick`, supply that callback in `props` so the host can forward it. |
| Forms | Associate inputs with a visible label or an accessible name. Use shared field hint/error presentation and pass disabled/invalid state explicitly. |
| Overlays | Use the shared popup lifecycle. Dropdowns inside top-layer dialogs/calendars can opt into `config.topLayer`. Standalone selects dismiss and advance focus on Tab/Shift+Tab. |
| Lifecycle | Framework adapters clean up their mounts. Manual framework mounts and native controllers must be destroyed when their view is removed. |
| AI components | These render chat, prompt, task and result UI. Your application provides model access, data, authorization and tool execution. |
| PDF viewer | Supply a PDF source and compatible PDF.js worker configuration. Remote files require appropriate CORS access. Tool groups, text and toolbar/status rendering are configurable. See the [PDF viewer examples](https://ui.rv-grid.com/#pdf-viewer). |
| Charts | Revo UI includes compact bar/line/area primitives and a range brush. The separate [RevoGrid Charts product](https://rv-grid.com/charts/) provides the larger charting surface. |

The following snippets use the direct Preact APIs; the framework guides show their equivalent integration patterns. Values and callbacks such as `saved` / `setSaved` are application-owned state inside your component; the linked live examples include the complete surrounding setup.

## Buttons and navigation

```tsx
import { Button, IconButton, ToggleButton } from '@revolist/ui/preact';

<Button variant="primary" rounded onClick={save}>Save report</Button>
<Button rounded href="https://rv-grid.com/">Explore RevoGrid</Button>
<Button size="compact" disabled>Unavailable</Button>
<Button variant="solid" busy={saving}>Saving</Button>
<ToggleButton pressed={pinned} onPressedChange={setPinned}>Pin</ToggleButton>
```

`Button` variants: `default`, `solid`, `primary`, `secondary`, `danger`, `danger-outline`, `ghost`, and `link`. `size` is `default` or `compact`. `rounded` applies pill corners, including icon controls. `href` renders native anchor navigation. `busy` blocks activation while preserving the variant's appearance.

## Dropdowns with user images

```tsx
import { Avatar, Dropdown } from '@revolist/ui/preact';

const people = [
  { value: 'alex', label: 'Alex Morgan', photo: '/people/alex.jpg' },
  { value: 'sam', label: 'Sam Rivera', photo: '/people/sam.jpg' },
];
const personContent = (_h: unknown, person: { label: string; photo?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <Avatar value={person.photo} label="" initials={person.label[0]} size={16} />
    <span>{person.label}</span>
  </span>
);

<Dropdown
  className="rv-select"
  source={people}
  value={personId}
  onChange={next => setPersonId(String(next))}
  config={{ ariaLabel: 'Team member', topLayer: true, nativeTabNavigation: true }}
  renderOption={personContent}
  renderValue={personContent}
/>
```

Use `Combobox` for search and `MultiSelect` for multiple values. See [user images, search and resource examples](https://ui.rv-grid.com/#selects-chips-and-resources).

## Advanced slider

```tsx
import { SliderField } from '@revolist/ui/filter/filters/slider/single';

<SliderField
  label="Saved"
  ariaLabel="Savings goal completion"
  layout="stacked"
  min={0}
  max={20000}
  step={50}
  value={saved}
  valuePlacement="end"
  formatValue={value => `${Math.round(value / 20000 * 100)}%`}
  onChange={setSaved}
/>
```

`layout="stacked"` gives the slider a full-width row; `valuePlacement="end"` puts the formatted value beside the label. Optional accent colors, ticks and thumb callouts are shown on the [Sliders page](https://ui.rv-grid.com/#sliders).

## Conditional chart colors

```tsx
import { BarChart } from '@revolist/ui/preact';

const largestExpense = Math.max(...expenses.map(item => item.value));

<BarChart
  data={expenses}
  ariaLabel="Expenses by category"
  height={170}
  showGrid
  showLabels
  tooltipIndicator="dot"
  barColor={datum => datum.value === largestExpense ? '#f97316' : undefined}
/>
```

Each datum has `key`, `value`, and `tooltip: { title, details? }`; optional `selected` controls emphasis. `barColor` accepts a CSS color or `(datum, index) => color | undefined`. Returning `undefined` retains the theme color. Tooltip markers use the resolved bar color. See [Charts and range selection](https://ui.rv-grid.com/#charts-and-range-selection).

## Interactive timeline

```tsx
import { TimelineTrack } from '@revolist/ui/timeline-track';

// Application-owned rows; retain these metadata fields when committing changes.
const initialRows = [
  { id: 'build', event: { start: 8, end: 12, label: 'Build', color: '#2563eb', textColor: '#ffffff' } },
  { id: 'review', event: {
    start: 14, end: 18, label: 'Review', color: '#7c3aed', textColor: '#ffffff',
    segments: [{ color: '#7c3aed', weight: 3 }, { color: '#c2410c', weight: 1 }],
  } },
];

<TimelineTrack
  rows={rows}
  selected={selected}
  range={{ start: 0, end: 24 }}
  onSelect={setSelected}
  onEventChange={(id, event) => setRows(current => current.map(row => row.id === id ? { ...row, event } : row))}
  formatValue={value => `${String(value).padStart(2, '0')}:00`}
/>
```

Events support single colors or weighted color segments. Moving/resizing preserves metadata and scales phase proportions. Hover/focus tooltips show the event name and range; use `getTooltip` for custom text or `tooltip={false}` to disable them. Pointer dragging and Left/Right keyboard controls are demonstrated on [Timeline track](https://ui.rv-grid.com/#timeline-track).

`TimeGrid` is the separate weekly-availability surface. Compose it with `useTimeGridInteraction` for painting and keyboard movement; provide cells, focus state, day/hour labels, weekends and working hours. See [weekly planning and calendar examples](https://ui.rv-grid.com/#calendar-and-dates).

## Theming, sizing, and motion

Load shared styles once, then configure semantic tokens rather than duplicating control styles. The gallery demonstrates light/dark themes and right-to-left layouts. [Explore interface colors](https://ui.rv-grid.com/?page=colors).

```css
.my-workspace {
  --rv-ui-accent: #2563eb;
  --rv-control-height: 32px;
  --rv-control-font-size: 0.875rem;
}
```

Standard single-line inputs, dropdowns and buttons use matching 32px minimum height and 14px text at the default root font size. Explicit compact controls, multiline editors, editable titles and grid scene controls have their own sizing. Use `rv-control--compact` where the compact field presentation is needed.

Motion follows the system's reduced-motion preference. `data-rv-ui-motion="off"` on the document root disables shared UI motion; removing it restores system behavior. Do not force animations on for users who requested reduced motion.

## Accessibility and localization

- Give icon-only actions and controls meaningful accessible names; connect visible labels, hints and errors to their fields.
- Preserve keyboard focus and use the shared dropdown, dialog and tooltip lifecycles. Disabled options remain announced but cannot be chosen.
- Provide localized labels through each component's `text`, `labels`, or related typed configuration. Use the date/calendar APIs for locale and calendar-system choices.
- Keep application state and authorization in the host application. A visual disabled or readonly state does not replace server-side permissions.
- Test your composed workflow with keyboard, reduced motion, light/dark themes and RTL. Accessibility of an application depends on its content and composition, not only the controls.

## RevoGrid products

| Product | Website | Documentation |
| --- | --- | --- |
| RevoGrid | [rv-grid.com](https://rv-grid.com/) | [Core docs](https://rv-grid.com/guide/) |
| Grid Pro | [RevoGrid Pro](https://pro.rv-grid.com/) | [Pro guides](https://pro.rv-grid.com/guides/installation/) |
| Pivot | [Pivot tables](https://rv-grid.com/pivot/) | [Pivot guide](https://pro.rv-grid.com/guides/pivot/) |
| Charts | [JavaScript charts](https://rv-grid.com/charts/) | [Pro documentation](https://pro.rv-grid.com/) |
| Gantt | [Gantt charts](https://rv-grid.com/gantt/) | [Gantt guide](https://pro.rv-grid.com/guides/gantt/) |
| Scheduler | [Resource scheduling](https://rv-grid.com/jsscheduler/) | [Pro documentation](https://pro.rv-grid.com/) |
| Kanban | [Kanban boards](https://rv-grid.com/kanban/) | [Pro documentation](https://pro.rv-grid.com/) |

## Licensing

Revo UI is [MIT licensed](LICENSE). Anyone can use, modify, and distribute it, including in commercial projects.
