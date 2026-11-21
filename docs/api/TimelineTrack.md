# TimelineTrack

Controlled timeline events with move/resize interactions, event colors, weighted phases and tooltips.

[Live examples and formatted usage](https://ui.rv-grid.com/components/timeline-track/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { TimelineTrack } from '@revolist/ui/preact'`

React: `import { TimelineTrack } from '@revolist/ui/react'`

Vue: `import { TimelineTrack } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="TimelineTrack"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop              | Type                                                                       | Required | Description                                                                                      |
| ----------------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `preset`          | `ClassPreset \| undefined`                                                 | No       |                                                                                                  |
| `className`       | `string \| undefined`                                                      | No       |                                                                                                  |
| `rows`            | `readonly TimelineTrackItem<T>[]`                                          | Yes      |                                                                                                  |
| `lanes`           | `readonly TimelineTrackLane[] \| undefined`                                | No       | Optional named lanes. Events with a matching laneId share one row.                               |
| `laneResize`      | `Omit<ResizeOptions, "direction"> \| undefined`                            | No       | Controlled width in CSS pixels for the left label panel. Supply min and max for keyboard bounds. |
| `columns`         | `readonly TimelineTrackColumn[] \| undefined`                              | No       | Optional axis labels and vertical grid lines.                                                    |
| `marker`          | `TimelineTrackMarker \| undefined`                                         | No       | Optional vertical reference line with a caption.                                                 |
| `readOnly`        | `boolean \| undefined`                                                     | No       | Display events without move and resize controls.                                                 |
| `onEventActivate` | `((id: string \| number, anchor: HTMLButtonElement) => void) \| undefined` | No       | Activate a read-only event with its button.                                                      |
| `tooltip`         | `boolean \| undefined`                                                     | No       |                                                                                                  |
| `showActions`     | `boolean \| undefined`                                                     | No       | Show click/tap alternatives to dragging. Hosts hiding these must supply equivalent controls.     |
| `formatValue`     | `((value: number) => string) \| undefined`                                 | No       |                                                                                                  |
| `getTooltip`      | `((event: T) => string) \| undefined`                                      | No       |                                                                                                  |
| `selected`        | `string \| number \| undefined`                                            | No       |                                                                                                  |
| `range`           | `TimelineTrackRange`                                                       | Yes      | Finite bounds with end greater than start.                                                       |
| `labels`          | `Partial<TimelineTrackLabels> \| undefined`                                | No       |                                                                                                  |
| `onSelect`        | `((id: string \| number) => void) \| undefined`                            | No       |                                                                                                  |
| `onEventChange`   | `((id: string \| number, event: T) => void) \| undefined`                  | No       |                                                                                                  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

Pass `columns` for vertical lines and axis labels at numeric positions. Pass `lanes` to add a label, description and optional icon beside each row, and use `laneId` on events to place multiple bars in the same lane. Use `marker` for a labeled reference position. Values use the same numeric scale as the range, including for time-based axes. Pass `laneResize` with a width, label, width limits and change callback to make the left label panel resizable.

Use `pattern` on an event for a CSS image layer over its color or weighted segments. Read-only events can display a labeled terminal mark with `endLabel` and can expose details with `onEventActivate`. The timeline runs from earlier to later left to right and scrolls horizontally on narrow screens.
