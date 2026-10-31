# PdfViewerToolbar

Display local or remote PDFs with navigation, search, zoom, rotation, print/download actions and a composable toolbar.

[Live examples and formatted usage](https://ui.rv-grid.com/#pdf-viewer) · [Component index](../../README.md#complete-component-reference)

Preact: `import { PdfViewerToolbar } from '@revolist/ui/preact'`

React: `import { PdfViewerToolbar } from '@revolist/ui/react'`

Vue: `import { PdfViewerToolbar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="PdfViewerToolbar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `controller` | `PdfViewerController` | Yes |  |
| `state` | `Readonly<PdfViewerState>` | Yes |  |
| `config` | `PdfViewerToolbarConfig \| undefined` | No |  |
| `text` | `Partial<{ viewer: string; pages: string; toolbar: string; first: string; last: string; open: string; previous: string; next: string; zoomPercentage: string; page: string; of: string; zoom: string; zoomIn: string; zoomOut: string; fitWidth: string; fitPage: string; rotate: string; search: string; previousMatch: string; nextMatch: string; closeSearch: string; matches: string; noMatches: string; searching: string; download: string; print: string; printing: string; loading: string; empty: string; emptyHint: string; errorDescription: string; operationError: string; printDocument: string; pageCount: string; pageSummary: string; matchSummary: string; error: string; retry: string; more: string; cancelPrint: string; }> \| undefined` | No |  |
| `searchOpen` | `boolean \| undefined` | No |  |
| `searchId` | `string \| undefined` | No |  |
| `onOpen` | `() => void` | Yes |  |
| `onToggleSearch` | `(origin: HTMLElement) => void` | Yes |  |
| `appendTo` | `HTMLElement \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
