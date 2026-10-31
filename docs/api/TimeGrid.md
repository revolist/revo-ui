# TimeGrid

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/#calendar-and-dates) · [Component index](../../README.md#complete-component-reference)

Preact: `import { TimeGrid } from '@revolist/ui/preact'`

React: `import { TimeGrid } from '@revolist/ui/react'`

Vue: `import { TimeGrid } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="TimeGrid"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean \| undefined` | No |  |
| `legacyClassPrefix` | `string \| undefined` | No |  |
| `days` | `readonly TimeGridDayLabel[]` | Yes |  |
| `cells` | `ReadonlySet<string>` | Yes |  |
| `focused` | `string` | Yes |  |
| `weekendDays` | `readonly number[]` | Yes |  |
| `workingHours` | `TimeGridWorkingHours \| undefined` | No |  |
| `gridLabel` | `string` | Yes |  |
| `hourLabel` | `(hour: number) => string` | Yes |  |
| `cellLabel` | `(day: TimeGridDayLabel, start: string, end: string, selected: boolean) => string` | Yes |  |
| `matrixRef` | `RefObject<HTMLDivElement>` | Yes |  |
| `onFocus` | `(key: string) => void` | Yes |  |
| `onKeyDown` | `(event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>, weekday: number, hour: number) => void` | Yes |  |
| `onClick` | `(event: h.JSX.TargetedMouseEvent<HTMLButtonElement>, weekday: number, hour: number, selected: boolean) => void` | Yes |  |
| `onPointerDown` | `(event: h.JSX.TargetedPointerEvent<HTMLButtonElement>, weekday: number, hour: number, selected: boolean) => void` | Yes |  |
| `onPointerEnter` | `(weekday: number, hour: number) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
