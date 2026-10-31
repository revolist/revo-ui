# Select

JSX option descriptors for the shared dropdown.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Direct Preact entry: `@revolist/ui/select`. For other framework adapters use `Dropdown`, `Combobox`, or `MultiSelect`.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| readonly string[] \| undefined` | No |  |
| `defaultValue` | `string \| number \| readonly string[] \| undefined` | No |  |
| `optionPolicy` | `((props: SelectOptionProps) => SelectOptionProps) \| undefined` | No | Optional domain policy for option descriptors; no native option nodes are mounted. |
| `multiple` | `boolean \| undefined` | No |  |
| `onValueChange` | `((value: string) => void) \| ((value: string[]) => void) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
