# TypographyControls

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/formatting-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { TypographyControls } from '@revolist/ui/preact'`

React: `import { TypographyControls } from '@revolist/ui/react'`

Vue: `import { TypographyControls } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="TypographyControls"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `TypographyValue` | Yes |  |
| `fonts` | `readonly string[] \| undefined` | No |  |
| `labels` | `{ readonly fontFamily: string; readonly defaultFont: string; readonly fontSize: string; readonly typographySection: string; readonly bold: string; readonly italic: string; readonly underline: string; readonly strike: string; }` | Yes |  |
| `icons` | `Record<"bold" \| "italic" \| "underline" \| "strike", string>` | Yes |  |
| `onChange` | `(patch: Partial<TypographyValue>) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
