# PdfViewer

Display local or remote PDFs with navigation, search, zoom, rotation, print/download actions and a composable toolbar.

[Live examples and formatted usage](https://ui.rv-grid.com/#pdf-viewer) · [Component index](../../README.md#complete-component-reference)

Preact: `import { PdfViewer } from '@revolist/ui/preact'`

React: `import { PdfViewer } from '@revolist/ui/react'`

Vue: `import { PdfViewer } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="PdfViewer"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No |  |
| `height` | `string \| number \| undefined` | No |  |
| `text` | `Partial<{ viewer: string; pages: string; toolbar: string; first: string; last: string; open: string; previous: string; next: string; zoomPercentage: string; page: string; of: string; zoom: string; zoomIn: string; zoomOut: string; fitWidth: string; fitPage: string; rotate: string; search: string; previousMatch: string; nextMatch: string; closeSearch: string; matches: string; noMatches: string; searching: string; download: string; print: string; printing: string; loading: string; empty: string; emptyHint: string; errorDescription: string; operationError: string; printDocument: string; pageCount: string; pageSummary: string; matchSummary: string; error: string; retry: string; more: string; cancelPrint: string; }> \| undefined` | No |  |
| `toolbar` | `PdfViewerToolbarConfig \| undefined` | No | Omit for all tools, false for no toolbar, or choose individual groups. |
| `showHeader` | `boolean \| undefined` | No | Hide the filename/page summary header. |
| `onReady` | `((controller: PdfViewerController) => void) \| undefined` | No |  |
| `renderToolbar` | `((controller: PdfViewerController, state: Readonly<PdfViewerState>, toolbarProps: PdfViewerToolbarProps) => ComponentChildren) \| undefined` | No |  |
| `renderStatus` | `((state: Readonly<PdfViewerState>) => ComponentChildren) \| undefined` | No |  |
| `workerSrc` | `string` | Yes | URL of the matching pdfjs-dist/build/pdf.worker.min.mjs, served by your app. |
| `l10n` | `L10n \| undefined` | No | PDF.js localization service for page accessibility and annotation content. |
| `source` | `PdfSource \| null \| undefined` | No |  |
| `fileName` | `string \| undefined` | No |  |
| `initialPage` | `number \| undefined` | No |  |
| `initialZoom` | `PdfZoom \| undefined` | No |  |
| `documentOptions` | `Omit<DocumentInitParameters, "data" \| "url" \| "worker"> \| undefined` | No | Asset URLs, authentication, password and other PDF.js loading options. |
| `onLoad` | `((details: { pageCount: number; fileName: string; }) => void) \| undefined` | No |  |
| `onPageChange` | `((page: number) => void) \| undefined` | No |  |
| `onZoomChange` | `((zoom: PdfZoom, scale: number) => void) \| undefined` | No |  |
| `onError` | `((error: Error) => void) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
