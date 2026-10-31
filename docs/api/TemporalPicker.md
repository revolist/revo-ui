# TemporalPicker

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/#calendar-and-dates) · [Component index](../../README.md#complete-component-reference)

Preact: `import { TemporalPicker } from '@revolist/ui/date-time'`

React: `import { TemporalPicker } from '@revolist/ui/react'`

Vue: `import { TemporalPicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="TemporalPicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `TemporalControlValue` | Yes |  |
| `onChange` | `(value: TemporalControlValue) => void` | Yes |  |
| `onValidityChange` | `((valid: boolean) => void) \| undefined` | No |  |
| `onSelectionComplete` | `((value: TemporalControlValue) => void) \| undefined` | No | Complete calendar selection, distinct from an in-progress keyboard draft. |
| `kind` | `LocalDateControlKind \| undefined` | No |  |
| `dateInput` | `boolean \| DateInputOptions \| undefined` | No | Typed date entry is enabled by default; false retains calendar-only controls. |
| `selection` | `"multiple" \| "single" \| "range" \| undefined` | No |  |
| `calendar` | `TemporalCalendarOptions \| undefined` | No |  |
| `required` | `boolean \| undefined` | No |  |
| `minTime` | `string \| undefined` | No |  |
| `maxTime` | `string \| undefined` | No |  |
| `timeStep` | `number \| undefined` | No |  |
| `precision` | `"minute" \| "second" \| undefined` | No |  |
| `timeFormat` | `"locale" \| "12h" \| "24h" \| undefined` | No |  |
| `text` | `Partial<TemporalPickerText> \| undefined` | No |  |
| `actions` | `Partial<EditorActionText> \| undefined` | No |  |
| `classNames` | `{ endpoints?: string; } \| undefined` | No | Endpoint-only adjustment, for the existing Timeline end-arrow interaction. |
| `endpoint` | `"from" \| "to" \| undefined` | No |  |
| `autoApply` | `boolean \| undefined` | No | Apply completed edits automatically. Set false to require explicit Apply. |
| `showActions` | `boolean \| undefined` | No | Show Apply/Cancel buttons. Defaults to true only when autoApply is false. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
