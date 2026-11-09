# Assistant result components

Import from `@revolist/ui/ai` or `@revolist/ui/preact`. React and Vue export the same component names through their adapters; Angular/Svelte can use the shared component catalog.

- `AiResultTable` (`table.tsx`): labeled scalar rows with semantic column headers, a caption, empty state and horizontal scrolling.
- `AiResultMetrics` (`metrics.tsx`): labeled metric cards for totals.
- `AiResultText` (`text.tsx`): escaped plain-text results.
- `AiResultView` (`index.tsx`): dispatches the discriminated `AiResultContent` union.

```ts
const presentation: AiResultContent = {
  kind: 'table',
  title: 'Visible summary',
  description: '46 visible records',
  columns: [{ label: 'Region' }, { label: 'Amount (Sum)', numeric: true }],
  rows: [['Europe', 42260]],
};
```

An action supplies `AiActionResult.presentation`; the adapter forwards it as `AiAssistantMountState.result`. This explicitly disclosed presentation takes priority over legacy `details`. Raw action `data` is never automatically rendered or sent to a model. The local transcript clones bounded results (16 KiB each) and retains the existing whole-turn budget. Standalone components receive their result directly.

Hosts may supply `renderTable` on `mountAiAssistant` or `AiResultView` to use a
specialized table component. This is trusted application configuration, separate
from result data. The Pro assistant uses a read-only compact RevoGrid with capped
column widths and a bounded scroll viewport; standalone UI uses the semantic
table without a grid dependency.

To add a renderer, create its component and discriminated data type here, add the case to `AiResultView`, export it through the AI/Preact entrypoints and framework catalog/adapters, then add renderer and affected-consumer coverage. Domain actions supply labels and scalar values; UI components never import product packages or infer domain types from JSON.
