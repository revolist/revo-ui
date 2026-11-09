# ColorPalette

Choose a color from a palette or picker and apply shared semantic interface colors.

[Live examples and formatted usage](https://ui.rv-grid.com/components/color/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ColorPalette } from '@revolist/ui/preact'`

React: `import { ColorPalette } from '@revolist/ui/react'`

Vue: `import { ColorPalette } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ColorPalette"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `ColorPaletteValue` | Yes |  |
| `options` | `readonly ColorPaletteOption[] \| undefined` | No |  |
| `ariaLabel` | `string` | Yes |  |
| `defaultLabel` | `string` | Yes |  |
| `colorAriaLabel` | `(option: ColorPaletteOption) => string` | Yes |  |
| `disabled` | `boolean \| undefined` | No |  |
| `includeDefault` | `boolean \| undefined` | No |  |
| `defaultDisabled` | `boolean \| undefined` | No |  |
| `onChange` | `(value: ColorPaletteValue) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
