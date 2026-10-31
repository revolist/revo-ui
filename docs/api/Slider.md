# Slider

Scalar and interval controls with labels, value badges, thumb values, ticks and units.

[Live examples and formatted usage](https://ui.rv-grid.com/#sliders) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Slider } from '@revolist/ui/preact'`

React: `import { Slider } from '@revolist/ui/react'`

Vue: `import { Slider } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Slider"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `min` | `number` | Yes |  |
| `max` | `number` | Yes |  |
| `value` | `number` | Yes |  |
| `step` | `string \| number \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `id` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `ariaLabel` | `string` | Yes |  |
| `ariaValueText` | `string \| undefined` | No |  |
| `ariaDescribedBy` | `string \| undefined` | No |  |
| `onChange` | `(value: number, event: Event & { currentTarget: HTMLInputElement; }) => void` | Yes |  |
| `onCommit` | `((value: number, event: Event & { currentTarget: HTMLInputElement; }) => void) \| undefined` | No |  |
| `onKeyDown` | `((event: KeyboardEvent) => void) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
