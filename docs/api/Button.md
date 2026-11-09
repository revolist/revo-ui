# Button

Actions, grouped commands, toggled state, icons, compact sizing, busy states and pill corners.

[Live examples and formatted usage](https://ui.rv-grid.com/components/buttons/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Button } from '@revolist/ui/preact'`

React: `import { Button } from '@revolist/ui/react'`

Vue: `import { Button } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Button"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No |  |
| `size` | `"default" \| "compact" \| undefined` | No |  |
| `rounded` | `boolean \| undefined` | No | Pill-shaped corners for any button variant. |
| `target` | `h.JSX.Signalish<h.JSX.HTMLAttributeAnchorTarget \| undefined>` | No |  |
| `variant` | `"link" \| "ghost" \| "solid" \| "default" \| "primary" \| "secondary" \| "danger" \| "danger-outline" \| undefined` | No |  |
| `href` | `string \| undefined` | No | Render navigation with native anchor semantics. |
| `rel` | `string \| undefined` | No |  |
| `busy` | `boolean \| undefined` | No | Show progress and block activation until cleared, preserving variant colors. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
