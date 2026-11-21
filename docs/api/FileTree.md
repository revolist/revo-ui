# FileTree

Switch content, group options and present plain, icon or descriptive selection rows.

[Live examples and formatted usage](https://ui.rv-grid.com/components/file-tree/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { FileTree } from '@revolist/ui/preact'`

React: `import { FileTree } from '@revolist/ui/react'`

Vue: `import { FileTree } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="FileTree"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible name of the file list. |
| `nodes` | `readonly FileTreeNode[]` | Yes | Files and folders in display order. |
| `value` | `string \| undefined` | No | Controlled selected path. Use an empty string for no selection. |
| `defaultValue` | `string \| undefined` | No | Initially selected path when uncontrolled. |
| `defaultExpanded` | `readonly string[] \| undefined` | No | Initially open folders. Omit to start with all folders open. |
| `onValueChange` | `((path: string) => void) \| undefined` | No | Called when a file is selected. |
| `statusLabels` | `Partial<Record<FileChangeStatus, { label: string; marker?: string; }>> \| undefined` | No | Localized accessible status names and optional visible marker letters. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |

## Keyboard and selection

Tab and Shift+Tab move through visible folders and files. Enter or Space toggles a folder or selects a file. Collapsed folders remove their descendants from the tab order. The selected file exposes `aria-current`.

Use a unique relative `path` as each node's identity. Folder nodes can be empty. If the application receives flat paths from file operations, group the paths into folder nodes before passing them to `FileTree`. Mark file nodes as `added`, `modified`, or `deleted` to show a visual marker and announce the status. Pass `statusLabels` to translate status names and marker letters.

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
