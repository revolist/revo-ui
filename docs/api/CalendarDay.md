# CalendarDay

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarDay } from '@revolist/ui/preact'`

React: `import { CalendarDay } from '@revolist/ui/react'`

Vue: `import { CalendarDay } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarDay"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `date` | `ISODateString` | Yes |  |
| `label` | `string` | Yes |  |
| `className` | `string \| undefined` | No |  |
| `outside` | `boolean` | Yes |  |
| `hidden` | `boolean` | Yes |  |
| `disabled` | `boolean` | Yes |  |
| `focused` | `boolean` | Yes |  |
| `selected` | `boolean` | Yes |  |
| `previewed` | `boolean` | Yes |  |
| `previewInvalid` | `boolean \| undefined` | No |  |
| `previewDescriptionId` | `string \| undefined` | No |  |
| `rangeStart` | `boolean` | Yes |  |
| `rangeEnd` | `boolean` | Yes |  |
| `previewStart` | `boolean` | Yes |  |
| `previewEnd` | `boolean` | Yes |  |
| `today` | `boolean` | Yes |  |
| `content` | `ComponentChildren` | No |  |
| `setRef` | `(date: ISODateString, element: HTMLButtonElement \| null) => void` | Yes |  |
| `onFocus` | `(date: ISODateString) => void` | Yes |  |
| `onPreview` | `(date?: ISODateString) => void` | Yes |  |
| `onKeyDown` | `(event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>, date: ISODateString) => void` | Yes |  |
| `onSelect` | `(date: ISODateString) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
