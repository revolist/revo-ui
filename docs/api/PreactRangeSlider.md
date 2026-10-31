# PreactRangeSlider

Scalar and interval controls with labels, value badges, thumb values, ticks and units.

[Live examples and formatted usage](https://ui.rv-grid.com/#sliders) · [Component index](../../README.md#complete-component-reference)

Preact: `import { PreactRangeSlider } from '@revolist/ui/preact'`

React: `import { PreactRangeSlider } from '@revolist/ui/react'`

Vue: `import { PreactRangeSlider } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="PreactRangeSlider"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `min` | `number` | Yes | Minimum value for the range |
| `max` | `number` | Yes | Maximum value for the range |
| `fromValue` | `number` | Yes | Current value for the start of the range |
| `toValue` | `number` | Yes | Current value for the end of the range |
| `step` | `number \| undefined` | No | Value-domain increment for native range handles. Defaults to the slider's decimal precision. |
| `showTooltips` | `boolean \| undefined` | No | Whether to show tooltips on hover |
| `showRangeDisplay` | `boolean \| undefined` | No | Whether to show the current range values above the slider |
| `showRangeInputs` | `boolean \| undefined` | No | Whether to show numeric inputs for editing the selected range |
| `disabled` | `boolean \| undefined` | No | Disable both native range handles. |
| `scaleFactor` | `number \| undefined` | No | Scaling used to preserve decimals in native range inputs. Defaults to 100. |
| `className` | `string \| undefined` | No | Extra class on the shared slider root. |
| `controlClassName` | `string \| undefined` | No | Extra class on the shared dual-handle control. |
| `fromClassName` | `string \| undefined` | No | Extra classes retained by feature adapters. |
| `toClassName` | `string \| undefined` | No |  |
| `fromAriaLabel` | `string \| undefined` | No | Accessible names for the two native range handles. |
| `toAriaLabel` | `string \| undefined` | No |  |
| `formatInputValue` | `((value: number) => string) \| undefined` | No | Optional function to format values inside the editable inputs. Defaults to &#96;String(value)&#96;, which keeps dot decimals independent of the browser's localized number input rendering. |
| `parseInputValue` | `((value: string) => number) \| undefined` | No | Optional function to parse editable input text back to a number. Return &#96;NaN&#96; to ignore incomplete or invalid text while the user is typing. The default parser accepts both dot and comma decimal separators. |
| `onRangeChange` | `(range: SliderRange) => void` | Yes | Callback fired when the range values change |
| `onRangeCommit` | `((range: SliderRange) => void) \| undefined` | No | Callback fired when a native handle commits its change. |
| `formatValue` | `((value: number) => string) \| undefined` | No | Optional function to format read-only labels and tooltips. Editable inputs use &#96;formatInputValue&#96; so display labels and input text can intentionally use different formats. |
| `formatFromValue` | `((value: number) => string) \| undefined` | No | Optional handle-specific display/accessible value formatters. |
| `formatToValue` | `((value: number) => string) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
