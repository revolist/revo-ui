# Revo UI

**RevoGrid's UI component library for financial apps, reporting dashboards, and project management.**

Compose data-rich workspaces with shared controls, pickers, charts, timelines, dialogs, and feedback. Use React, Vue, Angular, Svelte, Preact, or vanilla TypeScript. Revo UI is published as the public npm package **[`@revolist/ui`](https://www.npmjs.com/package/@revolist/ui)** and is MIT licensed for personal and commercial projects.

[GitHub repository](https://github.com/revolist/revo-ui) · [npm package](https://www.npmjs.com/package/@revolist/ui) · [Live components](https://ui.rv-grid.com/components/buttons/) · [Interactive overview](https://ui.rv-grid.com/) · [Framework guides](https://ui.rv-grid.com/frameworks/) · [RevoGrid](https://rv-grid.com/) · [Pro documentation](https://pro.rv-grid.com/)

[![Revo UI components for financial dashboards and project management](https://raw.githubusercontent.com/revolist/revo-ui/main/docs/assets/components-preview.jpg)](https://ui.rv-grid.com/)

Explore the [Revo UI gallery](https://ui.rv-grid.com/) for live previews, component variants, and expandable code examples. The [gallery repository](https://github.com/revolist/revo-ui) contains the gallery app and generated component API documentation.

## Contents

- [Getting started](#getting-started)
- [Framework integrations](#framework-integrations)
- [Components](#components)
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
- [Repository and support](#repository-and-support)
- [Licensing](#licensing)

## Getting started

Release publishing sends `@revolist/ui` to both npm and GitHub Packages. npm is the default for public installation. To install the GitHub Packages copy, configure `@revolist:registry=https://npm.pkg.github.com` and authenticate with a token that has package read access. GitHub package visibility is managed separately in GitHub's package settings.

Install the public package from npm. The published package bundles its Preact rendering runtime; install your application's host framework separately. React adapters require both `react` and `react-dom`. Install `preact` separately when using Preact in your own application code.

```sh
pnpm add @revolist/ui
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
      <TextInput
        aria-label="Report name"
        value={name}
        onValueChange={setName}
      />
      <Button rounded variant="primary" onClick={() => console.log(name)}>
        Create report
      </Button>
    </>
  );
}
```

Controls can be used without a RevoGrid instance. Grid cell templates, providers, row data, and product-specific scheduling logic stay in their owning product packages.

## Popover dismissal

`Popover` accepts `closeOnOutside` and `closeOnEscape`, both enabled by default, matching `PopoverController`. Set either to `false` independently; changes also apply while open. `open` remains controlled: update it in `onClose` (Vue: `@close`), or close it directly from an action.

```vue
<Popover
  :open="open"
  :anchor="anchor"
  :close-on-outside="false"
  :close-on-escape="false"
  @close="open = false"
>
  <button @click="open = false">Done</button>
</Popover>
```

## Framework integrations

| Framework          | Entry point              | Integration                                                                                                  | Guide                                                                  |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| React              | `@revolist/ui/react`     | Named React components; controlled props, callbacks, children, and custom content.                           | [React usage](https://ui.rv-grid.com/frameworks/react/)                |
| Vue                | `@revolist/ui/vue`       | Named Vue components, events and slots; declared value models support `v-model`.                             | [Vue usage](https://ui.rv-grid.com/frameworks/vue/)                    |
| Angular            | `@revolist/ui/angular`   | Standalone `UiComponent` host with `component`, `props`, `uiEvent`, `valueChange`, and `rvUiSlot` templates. | [Angular usage](https://ui.rv-grid.com/frameworks/angular/)            |
| Svelte 5           | `@revolist/ui/svelte`    | `UiComponent` host with reactive props, callbacks, and content snippets.                                     | [Svelte usage](https://ui.rv-grid.com/frameworks/svelte/)              |
| Preact             | `@revolist/ui/preact`    | Direct components with Preact state, hooks, and render callbacks.                                            | [Preact usage](https://ui.rv-grid.com/frameworks/preact/)              |
| Vanilla TypeScript | `@revolist/ui/framework` | `createFrameworkMount` and `uiComponents`; call `render` to update and `destroy` on disposal.                | [Vanilla usage](https://ui.rv-grid.com/frameworks/vanilla-typescript/) |

Additional entries include `@revolist/ui/native` for DOM controllers and presentation helpers, `@revolist/ui/react-control` / `vue-control` / `angular-control` / `svelte-control` for framework-owned controls, and dedicated entries such as `@revolist/ui/select`, `@revolist/ui/timeline-track`, and `@revolist/ui/pdf-viewer`. Use the installed package's TypeScript declarations for exact prop types.

## Components

Browse the same component families as the public gallery. Each page includes live previews, variants, and usage examples.

| Component family                                                                         | What you can build                                                                                       |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Buttons](https://ui.rv-grid.com/components/buttons/)                                    | Actions, icon buttons, toggles, and button groups.                                                       |
| [Inputs and forms](https://ui.rv-grid.com/components/inputs-and-forms/)                  | Text, search, numbers, validation, and field layouts.                                                    |
| [Selects and pickers](https://ui.rv-grid.com/components/selects-chips-and-resources/)    | Searchable dropdowns, multiple selections, user images, and assignees.                                   |
| [Selection controls](https://ui.rv-grid.com/components/selection-controls/)              | Checkboxes, switches, radio buttons, and choice chips.                                                   |
| [Tabs and lists](https://ui.rv-grid.com/components/tabs-and-lists/)                      | Tabs, segmented controls, and selectable lists.                                                          |
| [Sliders](https://ui.rv-grid.com/components/sliders/)                                    | Single values and ranges with labels and value badges.                                                   |
| [Timeline](https://ui.rv-grid.com/components/timeline-track/)                            | Draggable, resizable events with colors and tooltips.                                                    |
| [Calendars and dates](https://ui.rv-grid.com/components/calendar-and-dates/)             | Date and time pickers, ranges, and weekly planning.                                                      |
| [Charts](https://ui.rv-grid.com/components/charts-and-range-selection/)                  | Bar, line, and area charts with tooltips and range selection.                                            |
| [Dialogs and tooltips](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/) | Dialogs, confirmations, popovers, and tooltips.                                                          |
| [Menus and toolbars](https://ui.rv-grid.com/components/menus-and-toolbars/)              | Dropdown menus, nested commands, and toolbar actions.                                                    |
| [Status and feedback](https://ui.rv-grid.com/components/status-and-feedback/)            | Badges, alerts, loading indicators, and empty states.                                                    |
| [Layout](https://ui.rv-grid.com/components/layout/)                                      | Panels, resizable split views, and expandable sections.                                                  |
| [Pagination](https://ui.rv-grid.com/components/pagination/)                              | Page navigation for tables and lists.                                                                    |
| [Progress and rating](https://ui.rv-grid.com/components/progress-and-rating/)            | Progress bars, circular indicators, and star ratings.                                                    |
| [Activity messages](https://ui.rv-grid.com/components/activity-messages/)                | Updates with avatars, timestamps, and actions.                                                           |
| [AI assistant](https://ui.rv-grid.com/components/ai-assistant/)                          | Chat messages, prompts, suggestions, and task states.                                                    |
| [PDF viewer](https://ui.rv-grid.com/components/pdf-viewer/)                              | PDF navigation, search, zoom, and download controls.                                                     |
| [Color](https://ui.rv-grid.com/components/color/)                                        | Palettes, color pickers, and shared semantic interface colors.                                           |
| [Field configurators](https://ui.rv-grid.com/components/field-configurators/)            | Field libraries, selected-field lists, ordering, summaries, actions, and drop feedback.                  |
| [Formatting controls](https://ui.rv-grid.com/components/formatting-controls/)            | Typography choices, icon choices, inspector sections, preview comparisons, and contextual filter badges. |

## Complete component reference

Every component in the shared adapter catalog is listed below. Each name links to a generated prop/API reference, followed by its live example page, where variants and expandable, formatted usage examples are grouped together. Composition helpers are documented alongside their parent control; not every helper has an isolated specimen.

### Buttons

Actions, grouped commands, toggled state, icons, compact sizing, busy states and pill corners.

[Button](https://github.com/revolist/revo-ui/blob/main/docs/api/Button.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [IconButton](https://github.com/revolist/revo-ui/blob/main/docs/api/IconButton.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [SvgButton](https://github.com/revolist/revo-ui/blob/main/docs/api/SvgButton.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [ToggleButton](https://github.com/revolist/revo-ui/blob/main/docs/api/ToggleButton.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [ButtonGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/ButtonGroup.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [DeleteButton](https://github.com/revolist/revo-ui/blob/main/docs/api/DeleteButton.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [RemoveButton](https://github.com/revolist/revo-ui/blob/main/docs/api/RemoveButton.md) ([examples](https://ui.rv-grid.com/components/buttons/)) | [SvgIcon](https://github.com/revolist/revo-ui/blob/main/docs/api/SvgIcon.md) ([examples](https://ui.rv-grid.com/components/buttons/))

### Selection controls

Checkboxes, switches, radio groups, choice chips and option rows for independent or exclusive choices.

[Checkbox](https://github.com/revolist/revo-ui/blob/main/docs/api/Checkbox.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [Switch](https://github.com/revolist/revo-ui/blob/main/docs/api/Switch.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [RadioGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/RadioGroup.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [ChoiceChips](https://github.com/revolist/revo-ui/blob/main/docs/api/ChoiceChips.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [ChoiceChip](https://github.com/revolist/revo-ui/blob/main/docs/api/ChoiceChip.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [ChoiceChipInfoButton](https://github.com/revolist/revo-ui/blob/main/docs/api/ChoiceChipInfoButton.md) ([examples](https://ui.rv-grid.com/components/selection-controls/)) | [OptionButton](https://github.com/revolist/revo-ui/blob/main/docs/api/OptionButton.md) ([examples](https://ui.rv-grid.com/components/selection-controls/))

### Tabs and lists

Switch content, group options and present plain, icon or descriptive selection rows.

[SegmentedControl](https://github.com/revolist/revo-ui/blob/main/docs/api/SegmentedControl.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [SegmentedSwitch](https://github.com/revolist/revo-ui/blob/main/docs/api/SegmentedSwitch.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [Tabs](https://github.com/revolist/revo-ui/blob/main/docs/api/Tabs.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [TabPanel](https://github.com/revolist/revo-ui/blob/main/docs/api/TabPanel.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [Listbox](https://github.com/revolist/revo-ui/blob/main/docs/api/Listbox.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [ListboxOption](https://github.com/revolist/revo-ui/blob/main/docs/api/ListboxOption.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [ListboxGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/ListboxGroup.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [ListboxOptionContent](https://github.com/revolist/revo-ui/blob/main/docs/api/ListboxOptionContent.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [EditorList](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorList.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [EditorListItem](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorListItem.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [EditorListItemContent](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorListItemContent.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/)) | [EditorListGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorListGroup.md) ([examples](https://ui.rv-grid.com/components/tabs-and-lists/))

### Inputs and forms

Text, search and numeric entry; field labels, validation, inline layouts and editor drafts.

[Input](https://github.com/revolist/revo-ui/blob/main/docs/api/Input.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [TextInput](https://github.com/revolist/revo-ui/blob/main/docs/api/TextInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [Textarea](https://github.com/revolist/revo-ui/blob/main/docs/api/Textarea.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [SearchInput](https://github.com/revolist/revo-ui/blob/main/docs/api/SearchInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [NumberInput](https://github.com/revolist/revo-ui/blob/main/docs/api/NumberInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [NumberStepper](https://github.com/revolist/revo-ui/blob/main/docs/api/NumberStepper.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [DateInput](https://github.com/revolist/revo-ui/blob/main/docs/api/DateInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [TimeInput](https://github.com/revolist/revo-ui/blob/main/docs/api/TimeInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [DateTimeInput](https://github.com/revolist/revo-ui/blob/main/docs/api/DateTimeInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [FormField](https://github.com/revolist/revo-ui/blob/main/docs/api/FormField.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [FieldHint](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldHint.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [FieldError](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldError.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [FormSection](https://github.com/revolist/revo-ui/blob/main/docs/api/FormSection.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [HighlightedTextInput](https://github.com/revolist/revo-ui/blob/main/docs/api/HighlightedTextInput.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [InlineFieldGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/InlineFieldGroup.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [NumberDraft](https://github.com/revolist/revo-ui/blob/main/docs/api/NumberDraft.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [MaskedDraft](https://github.com/revolist/revo-ui/blob/main/docs/api/MaskedDraft.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/)) | [HtmlEditor](https://github.com/revolist/revo-ui/blob/main/docs/api/HtmlEditor.md) ([examples](https://ui.rv-grid.com/components/inputs-and-forms/))

### Selects, chips and resources

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Dropdown](https://github.com/revolist/revo-ui/blob/main/docs/api/Dropdown.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [DropdownPopup](https://github.com/revolist/revo-ui/blob/main/docs/api/DropdownPopup.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [DropdownPopupContent](https://github.com/revolist/revo-ui/blob/main/docs/api/DropdownPopupContent.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [Combobox](https://github.com/revolist/revo-ui/blob/main/docs/api/Combobox.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [MultiSelect](https://github.com/revolist/revo-ui/blob/main/docs/api/MultiSelect.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [Chip](https://github.com/revolist/revo-ui/blob/main/docs/api/Chip.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [FilterChip](https://github.com/revolist/revo-ui/blob/main/docs/api/FilterChip.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [Avatar](https://github.com/revolist/revo-ui/blob/main/docs/api/Avatar.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [SharedResourcePicker](https://github.com/revolist/revo-ui/blob/main/docs/api/SharedResourcePicker.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [ResourcePickerAvatar](https://github.com/revolist/revo-ui/blob/main/docs/api/ResourcePickerAvatar.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [AssigneePicker](https://github.com/revolist/revo-ui/blob/main/docs/api/AssigneePicker.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [AssigneeField](https://github.com/revolist/revo-ui/blob/main/docs/api/AssigneeField.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) | [AssigneePickerLayout](https://github.com/revolist/revo-ui/blob/main/docs/api/AssigneePickerLayout.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/))

### Sliders

Scalar and interval controls with labels, value badges, thumb values, ticks and units.

[SingleValueSlider](https://github.com/revolist/revo-ui/blob/main/docs/api/SingleValueSlider.md) ([examples](https://ui.rv-grid.com/components/sliders/)) | [PreactRangeSlider](https://github.com/revolist/revo-ui/blob/main/docs/api/PreactRangeSlider.md) ([examples](https://ui.rv-grid.com/components/sliders/)) | [SliderField](https://github.com/revolist/revo-ui/blob/main/docs/api/SliderField.md) ([examples](https://ui.rv-grid.com/components/sliders/))

### Timeline track

Controlled timeline events with move/resize interactions, event colors, weighted phases and tooltips.

[TimelineTrack](https://github.com/revolist/revo-ui/blob/main/docs/api/TimelineTrack.md) ([examples](https://ui.rv-grid.com/components/timeline-track/))

### Calendar and dates

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Calendar](https://github.com/revolist/revo-ui/blob/main/docs/api/Calendar.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarHeader](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarHeader.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarWeekdays](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarWeekdays.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarDay](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarDay.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarMonthGrid](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarMonthGrid.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarYearGrid](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarYearGrid.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [CalendarPicker](https://github.com/revolist/revo-ui/blob/main/docs/api/CalendarPicker.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [DatePicker](https://github.com/revolist/revo-ui/blob/main/docs/api/DatePicker.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [DateRangePicker](https://github.com/revolist/revo-ui/blob/main/docs/api/DateRangePicker.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [DurationField](https://github.com/revolist/revo-ui/blob/main/docs/api/DurationField.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [DurationDraft](https://github.com/revolist/revo-ui/blob/main/docs/api/DurationDraft.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [TemporalPicker](https://github.com/revolist/revo-ui/blob/main/docs/api/TemporalPicker.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [TemporalDraft](https://github.com/revolist/revo-ui/blob/main/docs/api/TemporalDraft.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [DateTimeField](https://github.com/revolist/revo-ui/blob/main/docs/api/DateTimeField.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [TimeGrid](https://github.com/revolist/revo-ui/blob/main/docs/api/TimeGrid.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/)) | [Legend](https://github.com/revolist/revo-ui/blob/main/docs/api/Legend.md) ([examples](https://ui.rv-grid.com/components/calendar-and-dates/))

### Color

Choose a color from a palette or picker and apply shared semantic interface colors.

[ColorPicker](https://github.com/revolist/revo-ui/blob/main/docs/api/ColorPicker.md) ([examples](https://ui.rv-grid.com/components/color/)) | [ColorPalette](https://github.com/revolist/revo-ui/blob/main/docs/api/ColorPalette.md) ([examples](https://ui.rv-grid.com/components/color/))

### Field configurators

Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.

[FieldIcon](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldIcon.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldSummary](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldSummary.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldLibrary](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldLibrary.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldGroupHeading](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldGroupHeading.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldGroup.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldList](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldList.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldRow](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldRow.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldContent](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldContent.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldItem](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldItem.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldLibraryList](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldLibraryList.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [SelectedField](https://github.com/revolist/revo-ui/blob/main/docs/api/SelectedField.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldActions](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldActions.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldStatusBadge](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldStatusBadge.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldRemoveButton](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldRemoveButton.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldRemoveIcon](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldRemoveIcon.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [FieldDropIndicator](https://github.com/revolist/revo-ui/blob/main/docs/api/FieldDropIndicator.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [ReorderList](https://github.com/revolist/revo-ui/blob/main/docs/api/ReorderList.md) ([examples](https://ui.rv-grid.com/components/field-configurators/)) | [ReorderHandle](https://github.com/revolist/revo-ui/blob/main/docs/api/ReorderHandle.md) ([examples](https://ui.rv-grid.com/components/field-configurators/))

### Formatting controls

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[InspectorSection](https://github.com/revolist/revo-ui/blob/main/docs/api/InspectorSection.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [IconChoiceGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/IconChoiceGroup.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [IconToggleButton](https://github.com/revolist/revo-ui/blob/main/docs/api/IconToggleButton.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [TypographyControls](https://github.com/revolist/revo-ui/blob/main/docs/api/TypographyControls.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [ComparisonPreview](https://github.com/revolist/revo-ui/blob/main/docs/api/ComparisonPreview.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [FilterBadgeInfoButton](https://github.com/revolist/revo-ui/blob/main/docs/api/FilterBadgeInfoButton.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/)) | [FilterBadge](https://github.com/revolist/revo-ui/blob/main/docs/api/FilterBadge.md) ([examples](https://ui.rv-grid.com/components/formatting-controls/))

### Charts and range selection

Compact bar, line and area charts with values, labels, tooltips and a composed range brush.

[DistributionChart](https://github.com/revolist/revo-ui/blob/main/docs/api/DistributionChart.md) ([examples](https://ui.rv-grid.com/components/charts-and-range-selection/)) | [BarChart](https://github.com/revolist/revo-ui/blob/main/docs/api/BarChart.md) ([examples](https://ui.rv-grid.com/components/charts-and-range-selection/)) | [LineChart](https://github.com/revolist/revo-ui/blob/main/docs/api/LineChart.md) ([examples](https://ui.rv-grid.com/components/charts-and-range-selection/)) | [AreaChart](https://github.com/revolist/revo-ui/blob/main/docs/api/AreaChart.md) ([examples](https://ui.rv-grid.com/components/charts-and-range-selection/)) | [BrushRange](https://github.com/revolist/revo-ui/blob/main/docs/api/BrushRange.md) ([examples](https://ui.rv-grid.com/components/charts-and-range-selection/))

### Dialogs and floating surfaces

Dialogs, confirmations, contextual surfaces and editable dialog sections with shared actions.

[Dialog](https://github.com/revolist/revo-ui/blob/main/docs/api/Dialog.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [ConfirmDialog](https://github.com/revolist/revo-ui/blob/main/docs/api/ConfirmDialog.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [Popover](https://github.com/revolist/revo-ui/blob/main/docs/api/Popover.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [Tooltip](https://github.com/revolist/revo-ui/blob/main/docs/api/Tooltip.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [ControlTooltip](https://github.com/revolist/revo-ui/blob/main/docs/api/ControlTooltip.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogHeader](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogHeader.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogBody](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogBody.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogFooter](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogFooter.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogForm](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogForm.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogCloseButton](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogCloseButton.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogActionFooter](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogActionFooter.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogActions](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogActions.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [DialogTitleInput](https://github.com/revolist/revo-ui/blob/main/docs/api/DialogTitleInput.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/)) | [EditableDialogHeader](https://github.com/revolist/revo-ui/blob/main/docs/api/EditableDialogHeader.md) ([examples](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/))

### Menus and toolbars

Command menus, nested commands, separators and grouped toolbar actions.

[Menu](https://github.com/revolist/revo-ui/blob/main/docs/api/Menu.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [MenuItem](https://github.com/revolist/revo-ui/blob/main/docs/api/MenuItem.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [MenuSeparator](https://github.com/revolist/revo-ui/blob/main/docs/api/MenuSeparator.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [Submenu](https://github.com/revolist/revo-ui/blob/main/docs/api/Submenu.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [Toolbar](https://github.com/revolist/revo-ui/blob/main/docs/api/Toolbar.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [ToolbarGroup](https://github.com/revolist/revo-ui/blob/main/docs/api/ToolbarGroup.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/)) | [ToolbarSeparator](https://github.com/revolist/revo-ui/blob/main/docs/api/ToolbarSeparator.md) ([examples](https://ui.rv-grid.com/components/menus-and-toolbars/))

### Status and feedback

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Badge](https://github.com/revolist/revo-ui/blob/main/docs/api/Badge.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [CountBadge](https://github.com/revolist/revo-ui/blob/main/docs/api/CountBadge.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [Alert](https://github.com/revolist/revo-ui/blob/main/docs/api/Alert.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [Spinner](https://github.com/revolist/revo-ui/blob/main/docs/api/Spinner.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [LoadingOverlay](https://github.com/revolist/revo-ui/blob/main/docs/api/LoadingOverlay.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [EmptyState](https://github.com/revolist/revo-ui/blob/main/docs/api/EmptyState.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [StatusFeedbackPanel](https://github.com/revolist/revo-ui/blob/main/docs/api/StatusFeedbackPanel.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/)) | [StatusBadge](https://github.com/revolist/revo-ui/blob/main/docs/api/StatusBadge.md) ([examples](https://ui.rv-grid.com/components/status-and-feedback/))

### Layout

Compose panes, split layouts, panels and disclosures with an interactive resize divider.

[Panel](https://github.com/revolist/revo-ui/blob/main/docs/api/Panel.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [Pane](https://github.com/revolist/revo-ui/blob/main/docs/api/Pane.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [SplitLayout](https://github.com/revolist/revo-ui/blob/main/docs/api/SplitLayout.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [EditorPane](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorPane.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [EditorSplitLayout](https://github.com/revolist/revo-ui/blob/main/docs/api/EditorSplitLayout.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [ResizeHandle](https://github.com/revolist/revo-ui/blob/main/docs/api/ResizeHandle.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [Disclosure](https://github.com/revolist/revo-ui/blob/main/docs/api/Disclosure.md) ([examples](https://ui.rv-grid.com/components/layout/)) | [DisclosureSummary](https://github.com/revolist/revo-ui/blob/main/docs/api/DisclosureSummary.md) ([examples](https://ui.rv-grid.com/components/layout/))

### Pagination

Page selection and compact or numbered navigation.

[Pagination](https://github.com/revolist/revo-ui/blob/main/docs/api/Pagination.md) ([examples](https://ui.rv-grid.com/components/pagination/))

### Progress and rating

Linear/circular completion and star-based rating controls.

[ProgressBar](https://github.com/revolist/revo-ui/blob/main/docs/api/ProgressBar.md) ([examples](https://ui.rv-grid.com/components/progress-and-rating/)) | [CircularProgress](https://github.com/revolist/revo-ui/blob/main/docs/api/CircularProgress.md) ([examples](https://ui.rv-grid.com/components/progress-and-rating/)) | [Rating](https://github.com/revolist/revo-ui/blob/main/docs/api/Rating.md) ([examples](https://ui.rv-grid.com/components/progress-and-rating/)) | [RatingStar](https://github.com/revolist/revo-ui/blob/main/docs/api/RatingStar.md) ([examples](https://ui.rv-grid.com/components/progress-and-rating/)) | [RatingChoice](https://github.com/revolist/revo-ui/blob/main/docs/api/RatingChoice.md) ([examples](https://ui.rv-grid.com/components/progress-and-rating/))

### Activity messages

Compose an activity entry from an avatar, timestamp, header, body, details and actions.

[ActivityMessage](https://github.com/revolist/revo-ui/blob/main/docs/api/ActivityMessage.md) ([examples](https://ui.rv-grid.com/components/activity-messages/))

### AI assistant

Presentation for messages, prompts, suggestions, reasoning, tasks, action state and result summaries. Applications provide the model and tools.

[AiChat](https://github.com/revolist/revo-ui/blob/main/docs/api/AiChat.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiChatContent](https://github.com/revolist/revo-ui/blob/main/docs/api/AiChatContent.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiChatComposer](https://github.com/revolist/revo-ui/blob/main/docs/api/AiChatComposer.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiChatEmptyState](https://github.com/revolist/revo-ui/blob/main/docs/api/AiChatEmptyState.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiMessage](https://github.com/revolist/revo-ui/blob/main/docs/api/AiMessage.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiMessageContent](https://github.com/revolist/revo-ui/blob/main/docs/api/AiMessageContent.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiMessageActions](https://github.com/revolist/revo-ui/blob/main/docs/api/AiMessageActions.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiReasoning](https://github.com/revolist/revo-ui/blob/main/docs/api/AiReasoning.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiTask](https://github.com/revolist/revo-ui/blob/main/docs/api/AiTask.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiTaskItem](https://github.com/revolist/revo-ui/blob/main/docs/api/AiTaskItem.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiPromptInput](https://github.com/revolist/revo-ui/blob/main/docs/api/AiPromptInput.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiSuggestions](https://github.com/revolist/revo-ui/blob/main/docs/api/AiSuggestions.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiActionStatus](https://github.com/revolist/revo-ui/blob/main/docs/api/AiActionStatus.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiResult](https://github.com/revolist/revo-ui/blob/main/docs/api/AiResult.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiChangePreview](https://github.com/revolist/revo-ui/blob/main/docs/api/AiChangePreview.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiAssistant](https://github.com/revolist/revo-ui/blob/main/docs/api/AiAssistant.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/)) | [AiRequestTrail](https://github.com/revolist/revo-ui/blob/main/docs/api/AiRequestTrail.md) ([examples](https://ui.rv-grid.com/components/ai-assistant/))

### PDF viewer

Display local or remote PDFs with navigation, search, zoom, rotation, print/download actions and a composable toolbar.

[PdfViewer](https://github.com/revolist/revo-ui/blob/main/docs/api/PdfViewer.md) ([examples](https://ui.rv-grid.com/components/pdf-viewer/)) | [PdfViewerToolbar](https://github.com/revolist/revo-ui/blob/main/docs/api/PdfViewerToolbar.md) ([examples](https://ui.rv-grid.com/components/pdf-viewer/))

### JSX select adapter

[**Select**](https://github.com/revolist/revo-ui/blob/main/docs/api/Select.md) ([examples](https://ui.rv-grid.com/components/selects-chips-and-resources/)) is an additional direct Preact adapter exported from `@revolist/ui/select`. Its JSX `<option>` children are data descriptors for the shared dropdown, not mounted native select elements. Use `value` / `onValueChange` for controlled state, `defaultValue` for uncontrolled state, and `multiple` for an array of selected strings. React/Vue applications can use their named `Combobox`, `MultiSelect`, or `Dropdown` adapters.

```tsx
import { Select } from '@revolist/ui/select';

<Select aria-label="View" value={view} onValueChange={setView}>
  <option value="table">Table</option>
  <option value="board">Board</option>
  <option value="calendar" disabled>
    Calendar
  </option>
</Select>;
```

## Usage contracts

| Concern                 | Contract                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled state        | Keep values in the application and pass the matching callback. `TextInput` uses `onValueChange`; many pickers/sliders use `onChange`; verify the component's typed contract.                                                                                 |
| Dropdown data           | `source` is an array of `{ value, label, ...metadata }` descriptors. `disabled` options remain visible and are skipped by keyboard selection.                                                                                                                |
| Custom dropdown content | `renderOption` changes option content; `renderValue` changes the selected value. Preact receives `(h, option, selected)` / `(h, option)`. React callbacks omit the element-factory argument; Vue uses named slots.                                           |
| Angular/Svelte hosts    | Use names from the component catalog. `valueChange` / `onValueChange` is tied to the component's declared value model, not every callback. For a generic callback such as `onClick`, supply that callback in `props` so the host can forward it.             |
| Forms                   | Associate inputs with a visible label or an accessible name. Use shared field hint/error presentation and pass disabled/invalid state explicitly.                                                                                                            |
| Overlays                | Use the shared popup lifecycle. Dropdowns inside top-layer dialogs/calendars can opt into `config.topLayer`. Standalone selects dismiss and advance focus on Tab/Shift+Tab.                                                                                  |
| Lifecycle               | Framework adapters clean up their mounts. Manual framework mounts and native controllers must be destroyed when their view is removed.                                                                                                                       |
| AI components           | These render chat, prompt, task and result UI. Your application provides model access, data, authorization and tool execution.                                                                                                                               |
| PDF viewer              | Supply a PDF source and compatible PDF.js worker configuration. Remote files require appropriate CORS access. Tool groups, text and toolbar/status rendering are configurable. See the [PDF viewer examples](https://ui.rv-grid.com/components/pdf-viewer/). |
| Charts                  | Revo UI includes compact bar/line/area primitives and a range brush. The separate [RevoGrid Charts product](https://rv-grid.com/charts/) provides the larger charting surface.                                                                               |

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
const personContent = (
  _h: unknown,
  person: { label: string; photo?: string },
) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <Avatar
      value={person.photo}
      label=""
      initials={person.label[0]}
      size={16}
    />
    <span>{person.label}</span>
  </span>
);

<Dropdown
  className="rv-select"
  source={people}
  value={personId}
  onChange={(next) => setPersonId(String(next))}
  config={{
    ariaLabel: 'Team member',
    topLayer: true,
    nativeTabNavigation: true,
  }}
  renderOption={personContent}
  renderValue={personContent}
/>;
```

Use `Combobox` for search and `MultiSelect` for multiple values. See [user images, search and resource examples](https://ui.rv-grid.com/components/selects-chips-and-resources/).

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
  formatValue={(value) => `${Math.round((value / 20000) * 100)}%`}
  onChange={setSaved}
/>;
```

`layout="stacked"` gives the slider a full-width row; `valuePlacement="end"` puts the formatted value beside the label. Optional accent colors, ticks and thumb callouts are shown on the [Sliders page](https://ui.rv-grid.com/components/sliders/).

## Conditional chart colors

```tsx
import { BarChart } from '@revolist/ui/preact';

const largestExpense = Math.max(...expenses.map((item) => item.value));

<BarChart
  data={expenses}
  ariaLabel="Expenses by category"
  height={170}
  showGrid
  showLabels
  tooltipIndicator="dot"
  barColor={(datum) => (datum.value === largestExpense ? '#f97316' : undefined)}
/>;
```

Each datum has `key`, `value`, and `tooltip: { title, details? }`; optional `selected` controls emphasis. `barColor` accepts a CSS color or `(datum, index) => color | undefined`. Returning `undefined` retains the theme color. Tooltip markers use the resolved bar color. See [Charts and range selection](https://ui.rv-grid.com/components/charts-and-range-selection/).

## Interactive timeline

```tsx
import { TimelineTrack } from '@revolist/ui/timeline-track';

// Application-owned rows; retain these metadata fields when committing changes.
const initialRows = [
  {
    id: 'build',
    event: {
      start: 8,
      end: 12,
      label: 'Build',
      color: '#2563eb',
      textColor: '#ffffff',
    },
  },
  {
    id: 'review',
    event: {
      start: 14,
      end: 18,
      label: 'Review',
      color: '#7c3aed',
      textColor: '#ffffff',
      segments: [
        { color: '#7c3aed', weight: 3 },
        { color: '#c2410c', weight: 1 },
      ],
    },
  },
];

<TimelineTrack
  rows={rows}
  selected={selected}
  range={{ start: 0, end: 24 }}
  onSelect={setSelected}
  onEventChange={(id, event) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, event } : row)),
    )
  }
  formatValue={(value) => `${String(value).padStart(2, '0')}:00`}
/>;
```

Events support single colors or weighted color segments. Moving/resizing preserves metadata and scales phase proportions. Hover/focus tooltips show the event name and range; use `getTooltip` for custom text or `tooltip={false}` to disable them. Pointer dragging and Left/Right keyboard controls are demonstrated on [Timeline track](https://ui.rv-grid.com/components/timeline-track/).

`TimeGrid` is the separate weekly-availability surface. Compose it with `useTimeGridInteraction` for painting and keyboard movement; provide cells, focus state, day/hour labels, weekends and working hours. See [weekly planning and calendar examples](https://ui.rv-grid.com/components/calendar-and-dates/).

## Theming, sizing, and motion

Load shared styles once, then configure semantic tokens rather than duplicating control styles. The gallery demonstrates light/dark themes and right-to-left layouts. [Explore interface colors](https://ui.rv-grid.com/colors/).

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

| Product   | Website                                                 | Documentation                                              |
| --------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| RevoGrid  | [rv-grid.com](https://rv-grid.com/)                     | [Core docs](https://rv-grid.com/guide/)                    |
| Grid Pro  | [RevoGrid Pro](https://pro.rv-grid.com/)                | [Pro guides](https://pro.rv-grid.com/guides/installation/) |
| Pivot     | [Pivot tables](https://rv-grid.com/pivot/)              | [Pivot guide](https://pro.rv-grid.com/guides/pivot/)       |
| Charts    | [JavaScript charts](https://rv-grid.com/charts/)        | [Pro documentation](https://pro.rv-grid.com/)              |
| Gantt     | [Gantt charts](https://rv-grid.com/gantt/)              | [Gantt guide](https://pro.rv-grid.com/guides/gantt/)       |
| Scheduler | [Resource scheduling](https://rv-grid.com/jsscheduler/) | [Pro documentation](https://pro.rv-grid.com/)              |
| Kanban    | [Kanban boards](https://rv-grid.com/kanban/)            | [Pro documentation](https://pro.rv-grid.com/)              |

## Repository and support

- [Revo UI on GitHub](https://github.com/revolist/revo-ui): gallery app, documentation, and project information.
- [Component API reference](https://github.com/revolist/revo-ui/blob/main/docs/component-reference.md#complete-component-reference): individual component props and API details.
- [Issues](https://github.com/revolist/revo-ui/issues): report bugs or request improvements; include your framework, package version, and a minimal reproduction.
- [npm package](https://www.npmjs.com/package/@revolist/ui): published versions and installation information.

## Licensing

Revo UI is [MIT licensed](LICENSE). Anyone can use, modify, and distribute it, including in commercial projects.

See [Current UI APIs](MIGRATION.md) for removed compatibility names and consumer migrations.
