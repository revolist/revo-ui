# PDF viewer

`PdfViewer` provides continuous PDF pages, selectable text, internal/external links,
find highlights and match navigation, page navigation, zoom/fit, rotation, local
file opening, original-file download, and all-page printing. PDF.js renders the
pages; controls and colors come from the shared UI library.

Install the optional `pdfjs-dist` peer (`^6.4.299`). Serve the worker from the
**same installed version** as the library. For Vite:

```tsx
import { PdfViewer } from '@revolist/ui/react';
// Preact: @revolist/ui/pdf-viewer or @revolist/ui/preact
// Vue: import { PdfViewer } from '@revolist/ui/vue'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import '@revolist/ui/styles.css';

<PdfViewer
  source="/documents/report.pdf"
  workerSrc={workerSrc}
  height={640}
  onLoad={({ pageCount }) => console.log(pageCount)}
/>;
```

The core runtime, viewer runtime and PDF.js viewer CSS load on mount. Importing UI
components during SSR does not evaluate PDF.js. Other bundlers can copy the worker
into their public assets and pass its URL. Configure CSP `worker-src` for your
worker and `style-src` for PDF.js styles. PDF URLs must obey the server's CORS rules.

`source` accepts a URL, `Uint8Array`, `ArrayBuffer`, `Blob` or `File`. Bytes are
copied before worker transfer. Changing `source` replaces the current document;
`null` clears it. Opening a local file changes the viewer's current document;
the next external source change replaces it. `fileName` controls download names.

`initialPage` is one-based; `initialZoom` is a scale (0.25–5), `page-width` (default)
or `page-fit`. `documentOptions` forwards PDF.js loading settings such as
`password`, `httpHeaders`, `withCredentials`, `cMapUrl`, `standardFontDataUrl` and
`wasmUrl`. Supply these asset URLs for documents requiring nonembedded fonts,
CMaps or WASM decoders. Keep the options object stable: changing it, `workerSrc`,
`initialPage` or `initialZoom` recreates the viewer. Password prompts, annotation
editing, embedded JavaScript and interactive forms are outside this component's
contract. Loading, worker startup/runtime and viewer initialization errors are
shown inline and emitted through `onError`. Retry starts a fresh worker for the
last source. Replacing/clearing a source or destroying the viewer settles any
pending `load()` call without waiting for the old PDF.js task.

The default toolbar is the separate `PdfViewerToolbar` component. It is exported
from the PDF, Preact, React and Vue entrypoints, and registered for Angular/Svelte
generic hosts. It has no separate library preview.
The viewer composes smaller toolbar, search, header and status views around the
shared document controller.

Use `toolbar={false}` to hide the toolbar, or keep the existing group array,
for example `toolbar={['navigation', 'zoom', 'search', 'download']}`. For individual
controls, pass a configuration object:

```tsx
<PdfViewer
  source="/report.pdf"
  workerSrc={workerSrc}
  showHeader={false}
  toolbar={{
    tools: ['navigation', 'zoom', 'search', 'rotate', 'download', 'print'],
    buttons: {
      previous: false,
      rotate: { disabled: true },
      print: { variant: 'primary', className: 'document-print' },
    },
    showPageCount: false,
    zoomLevels: ['page-width', 'page-fit', 0.5, 1, 1.5, 2],
    zoomStep: 1.5,
  }}
/>
```

| Toolbar option                                     | Behavior                                                                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools`                                            | Visible groups: `open`, `navigation`, `zoom`, `search`, `rotate`, `download`, `print`. Omit for all; `[]` hides all.                          |
| `buttons`                                          | Keys: `open`, `first`, `last`, `previous`, `next`, `zoomOut`, `zoomIn`, `search`, `rotate`, `download`, `print`. `false` hides the button.    |
| Button options                                     | `disabled`, `variant`, `className`, `title`. Built-in loading/page/zoom/printing constraints still apply. Labels and icons remain accessible. |
| `boundaryButtons`                                  | Show first/last page buttons; default `false`. Navigation uses shared `Pagination`.                                                           |
| `showPageInput`, `showPageCount`, `showZoomSelect` | Hide individual fields with `false`.                                                                                                          |
| `zoomLevels`                                       | Unique finite scales from .25 to 5 and/or `page-width`, `page-fit`. Invalid entries are ignored; the current zoom is always included.         |
| `zoomStep`                                         | Multiplier greater than 1 for zoom buttons; invalid values fall back to 1.25.                                                                 |
| `className`                                        | Additional toolbar class.                                                                                                                     |

Button visibility and disabled state also apply to the mobile action menu.
Hiding/disabling search disables its Ctrl/Cmd+F shortcut and closes an open search
bar. Hiding/disabling Open also removes empty/error-state Open actions.
`showHeader={false}` hides document details; a temporary print-progress/cancel
strip remains available while printing. These settings change the UI; controller
commands remain available to the application.

Override visible and accessible labels with `text` (English defaults are exported
as `defaultPdfViewerText`). This includes loading, empty/error states, search feedback, mobile menus, tooltips,
and the print-frame title. Partial overrides fall back to English. `pageCount`
accepts `{pages}` and `{of}`; `pageSummary` also accepts `{page}`;
`matchSummary` accepts `{match}`, `{total}` and `{matches}`; `zoomPercentage`
accepts `{percent}`. These templates let
translations change word order. For example:

```tsx
<PdfViewer
  workerSrc={workerSrc}
  source="/report.pdf"
  text={{
    open: 'Ouvrir le PDF',
    pageCount: 'sur {pages}',
    pageSummary: 'Page {page} sur {pages}',
    matchSummary: 'Résultat {match} sur {total}',
    error: 'Impossible d’afficher ce PDF',
    errorDescription: 'Vérifiez le document et réessayez.',
    operationError: 'Impossible de terminer cette opération.',
    printDocument: 'Document à imprimer',
  }}
/>
```

Runtime diagnostics remain available through `snapshot.error` and `onError`;
inline errors use translated `errorDescription` or `operationError` instead of
raw PDF.js messages. For PDF.js-generated page accessibility/annotation text,
pass its localization service as `l10n` (the `l10n` constructor option of PDF.js `PDFViewer`),
with the application's matching PDF.js locale resources. Changing `l10n`
recreates the viewer. Document contents, filenames and browser-owned file/print
dialogs retain their own language; they are not UI translation keys.

`renderToolbar(controller, state, toolbarProps)` and `renderStatus(state)`
replace their respective views. The third toolbar argument contains controller,
state, resolved text, config, search state/ID, `onOpen`, `onToggleSearch` and
`appendTo`. Reuse it to retain the default commands inside a custom composition:

```tsx
import { PdfViewer, PdfViewerToolbar } from '@revolist/ui/react';

<PdfViewer
  workerSrc={workerSrc}
  source="/report.pdf"
  renderToolbar={(_controller, _state, toolbarProps) => (
    <PdfViewerToolbar {...toolbarProps} />
  )}
/>;
```

The standalone toolbar is controlled by its `state` prop; it never loads or owns
a document. Outside a viewer render callback, subscribe to the controller and
pass the current snapshot, plus handlers for Open and Search. Place it within a
`rv-pdf-viewer` container to inherit responsive sizing and theme styles.

Vue, Angular and Svelte
also support `toolbar` (including `toolbarProps`) and `status` scoped slots through their shared adapters.
For Vue, the toolbar configuration prop and toolbar slot are independent.

`onReady` exposes the controller. Its commands are `load(source, fileName?)`,
`retry()`, `goToPage(page)`, `setZoom(zoom)`, `rotate()`, `search(query,
previous?, again?)`, `clearSearch()`, `download()`, `print()` and `cancelPrint()`. Observe state
with `snapshot` or `subscribe(listener)`. `load` handles failures through state
and `onError`; `onLoad` signals when page views and navigation are ready.
`onPageChange` and `onZoomChange` also include changes caused by scrolling/search.
Ctrl/Cmd+F opens viewer search while focus is inside it; Enter/Shift+Enter find
next/previous and Escape closes search and returns focus to its opener. Page edits
commit with Enter or blur; Escape restores the current page. Empty edits preserve
the current page. Narrow containers group rotation, download and print under
**More PDF tools**, using the shared keyboard-accessible menu/popover.

For a native host:

```ts
import { createPdfViewer } from '@revolist/ui/pdf-viewer';
const viewer = createPdfViewer(host, { source: '/report.pdf', workerSrc });
// On host removal:
viewer.destroy();
```

Framework support covers every library integration:

| Integration       | Public API                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Native/TypeScript | `createPdfViewer` from `@revolist/ui/pdf-viewer`; call `destroy()` on removal.                                           |
| Preact            | `PdfViewer`, `PdfViewerToolbar` from `@revolist/ui/preact` or `@revolist/ui/pdf-viewer`.                                 |
| React             | `PdfViewer`, `PdfViewerToolbar` from `@revolist/ui/react`.                                                               |
| Vue               | `PdfViewer`, `PdfViewerToolbar` from `@revolist/ui/vue`; scoped toolbar/status slots.                                    |
| Angular           | `UiComponent`, `UiSlotDirective` from `@revolist/ui/angular`; `component="PdfViewer"` or `component="PdfViewerToolbar"`. |
| Svelte 5          | `UiComponent` from `@revolist/ui/svelte`; the same component names and toolbar/status snippets.                          |

All framework entrypoints expose `PdfViewerProps`, `PdfViewerText`, toolbar
configuration types and `defaultPdfViewerText`. Configuration, translations and
callbacks follow the same viewer contract; document resources are released when
the host component unmounts. Keep `documentOptions`/`l10n` references stable.

Vue:

```vue
<script setup lang="ts">
import { PdfViewer, PdfViewerToolbar } from '@revolist/ui/vue';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
const toolbar = { tools: ['navigation', 'zoom', 'search'] } as const;
</script>
<template>
  <PdfViewer :worker-src="workerSrc" source="/report.pdf" :toolbar="toolbar">
    <template #toolbar="{ toolbarProps }">
      <PdfViewerToolbar v-bind="toolbarProps" />
    </template>
  </PdfViewer>
</template>
```

Angular (import `UiComponent` and `UiSlotDirective` in the standalone component;
set `pdfProps` to a stable `PdfViewerProps` object containing `workerSrc`/`source`):

```html
<rv-ui component="PdfViewer" [props]="pdfProps" (uiEvent)="onPdfEvent($event)">
  <ng-template rvUiSlot="toolbar" let-toolbarProps="toolbarProps">
    <rv-ui component="PdfViewerToolbar" [props]="toolbarProps"></rv-ui>
  </ng-template>
</rv-ui>
```

`uiEvent` emits `{ name, args }` for callbacks supplied in `pdfProps` (such as
`onLoad`, `onPageChange`, `onZoomChange` and `onError`). Callbacks may also be
handled directly through `pdfProps`.

Svelte 5:

```svelte
<script lang="ts">
  import { UiComponent, type PdfViewerProps } from '@revolist/ui/svelte';
  import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
  const pdfProps: PdfViewerProps = { workerSrc, source: '/report.pdf' };
</script>

<UiComponent component="PdfViewer" props={pdfProps} slots={{ toolbar }} />
{#snippet toolbar(scope: Record<string, any>)}
  <UiComponent component="PdfViewerToolbar" props={scope.toolbarProps} />
{/snippet}
```

The custom toolbar slot/snippet is optional; omitting it uses the built-in
toolbar. For a status slot/snippet, the scope contains `state`. Svelte supports
direct callbacks in `props` and `onUiEvent` for supplied callbacks. Every example
also needs the shared stylesheet shown above.

The lower-level `PdfViewerController` is available from
`@revolist/ui/pdf-viewer/controller`; attach it to an absolutely positioned div,
then load a source, and call `destroy()` when removing it. Framework components
release resources automatically.

Print prepares every page in a temporary frame before calling the browser print
dialog. Output is rasterized at up to 144 DPI, independent of visible-page zoom
and rotation. Large documents require memory for all print canvases; printing is
cancelled with **Cancel printing**, when the source changes, or when the viewer is destroyed. The print frame is
released after the print dialog closes. Download preserves the original bytes.

The standalone UI gallery includes a local three-page sample and an empty viewer
under **PDF viewer**. No remote document service is required.
