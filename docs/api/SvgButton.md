# SvgButton

Actions, grouped commands, toggled state, icons, compact sizing, busy states and pill corners.

[Live examples and formatted usage](https://ui.rv-grid.com/components/buttons/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { SvgButton } from '@revolist/ui/preact'`

React: `import { SvgButton } from '@revolist/ui/react'`

Vue: `import { SvgButton } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="SvgButton"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes |  |
| `rounded` | `boolean \| undefined` | No |  |
| `busy` | `boolean \| undefined` | No |  |
| `variant` | `"link" \| "ghost" \| "solid" \| undefined` | No | Explicit variants retain shared appearance when consumer classes are supplied. |
| `badge` | `string \| number \| undefined` | No |  |
| `badgeClassName` | `string \| undefined` | No |  |
| `icon` | `string \| undefined` | No |  |
| `iconContent` | `ComponentChildren` | No |  |
| `visibleLabel` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `iconClassName` | `string \| undefined` | No |  |
| `labelClassName` | `string \| undefined` | No |  |
| `children` | `ComponentChildren` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
