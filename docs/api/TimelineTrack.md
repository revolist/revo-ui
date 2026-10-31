# TimelineTrack

Controlled timeline events with move/resize interactions, event colors, weighted phases and tooltips.

[Live examples and formatted usage](https://ui.rv-grid.com/components/timeline-track/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { TimelineTrack } from '@revolist/ui/preact'`

React: `import { TimelineTrack } from '@revolist/ui/react'`

Vue: `import { TimelineTrack } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="TimelineTrack"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `rows` | `readonly TimelineTrackItem<T>[]` | Yes |  |
| `tooltip` | `boolean \| undefined` | No |  |
| `formatValue` | `((value: number) => string) \| undefined` | No |  |
| `getTooltip` | `((event: T) => string) \| undefined` | No |  |
| `selected` | `string \| number \| undefined` | No |  |
| `range` | `TimelineTrackRange` | Yes | Finite bounds with end greater than start. |
| `labels` | `Partial<TimelineTrackLabels> \| undefined` | No |  |
| `onSelect` | `(id: string \| number) => void` | Yes |  |
| `onEventChange` | `(id: string \| number, event: T) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
