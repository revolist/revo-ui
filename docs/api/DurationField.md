# DurationField

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/duration-and-effort/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { DurationField } from '@revolist/ui/duration'`

React: `import { DurationField } from '@revolist/ui/react'`

Vue: `import { DurationField } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="DurationField"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| ParsedDuration \| null` | Yes |  |
| `onChange` | `(value: ParsedDuration \| null) => void` | Yes |  |
| `onCommit` | `((value: ParsedDuration \| null) => void) \| undefined` | No | A completed slider or unit/mode interaction, distinct from text entry. |
| `onValidityChange` | `((valid: boolean) => void) \| undefined` | No |  |
| `onDraftChange` | `((text: string) => void) \| undefined` | No | Product forms can keep raw invalid drafts for their existing error/commit pipeline. |
| `label` | `string \| undefined` | No |  |
| `invalidText` | `string \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `readOnly` | `boolean \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `slider` | `boolean \| DurationSliderOptions \| undefined` | No |  |
| `unitButtons` | `boolean \| undefined` | No |  |
| `unitLabels` | `Partial<Record<DurationUnit, string>> \| undefined` | No |  |
| `unitLabel` | `string \| undefined` | No |  |
| `placeholder` | `string \| undefined` | No | Override the input hint, independently of the configured default unit. |
| `modeLabel` | `string \| undefined` | No |  |
| `workingLabel` | `string \| undefined` | No |  |
| `elapsedLabel` | `string \| undefined` | No |  |
| `defaultUnit` | `DurationUnit` | Yes |  |
| `allowedUnits` | `readonly DurationUnit[] \| undefined` | No |  |
| `allowElapsed` | `boolean \| undefined` | No |  |
| `required` | `boolean \| undefined` | No |  |
| `min` | `number \| undefined` | No | Numeric bounds apply to the authored value, without implicit calendar conversions. |
| `max` | `number \| undefined` | No |  |
| `maximumFractionDigits` | `number \| undefined` | No |  |
| `autoApply` | `boolean \| undefined` | No | Apply completed edits automatically. Set false to require explicit Apply. |
| `showActions` | `boolean \| undefined` | No | Show Apply/Cancel buttons. Defaults to true only when autoApply is false. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
