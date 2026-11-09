# SegmentedSwitch

Switch content, group options and present plain, icon or descriptive selection rows.

[Live examples and formatted usage](https://ui.rv-grid.com/components/tabs-and-lists/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { SegmentedSwitch } from '@revolist/ui/preact'`

React: `import { SegmentedSwitch } from '@revolist/ui/react'`

Vue: `import { SegmentedSwitch } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="SegmentedSwitch"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `T` | Yes |  |
| `options` | `SegmentedSwitchOption<T>[]` | Yes |  |
| `onChange` | `(value: T, option: SegmentedSwitchOption<T>) => void` | Yes |  |
| `ariaLabel` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `itemClassName` | `string \| undefined` | No |  |
| `countClassName` | `string \| undefined` | No |  |
| `activeClassName` | `string \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `iconOnly` | `boolean \| undefined` | No | Compact icon layout. Supply icons through renderOption and text through option labels. |
| `title` | `string \| undefined` | No |  |
| `role` | `SegmentedSwitchRole \| undefined` | No |  |
| `testId` | `string \| undefined` | No |  |
| `renderOption` | `((option: SegmentedSwitchOption<T>, state: { active: boolean; disabled: boolean; }) => SegmentedSwitchRenderable) \| undefined` | No |  |
| `renderCount` | `((option: SegmentedSwitchOption<T>, state: { active: boolean; disabled: boolean; }) => SegmentedSwitchRenderable) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
