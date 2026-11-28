# CalendarNavigator

Calendar views, date selection and date ranges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarNavigator } from '@revolist/ui/preact'`

React: `import { CalendarNavigator } from '@revolist/ui/react'`

Vue: `import { CalendarNavigator } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarNavigator"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `value` | `ISODateString` | Yes | Current selected civil date. |
| `today` | `ISODateString` | Yes | Current civil date used by the Today action. |
| `onChange` | `(date: ISODateString) => void` | Yes | Reports the selected or navigated date. |
| `stepDays` | `number \| undefined` | No | Number of days to advance or retreat; defaults to seven. |
| `className` | `string \| undefined` | No | Additional class names on the navigator. |
| `labels` | `{ previous?: string; next?: string; today?: string; calendar?: string; dialog?: string; title?: (value: ISODateString) => string; } \| undefined` | No | Localized action labels and the formatted date title. |
| `calendar` | `Omit<DatePickerProps, "value" \| "onChange" \| "label" \| "openLabel" \| "dateInput" \| "renderTrigger"> \| undefined` | No | Calendar presentation and localization options. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
