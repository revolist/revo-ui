# Metric tiles and panels

`MetricTile` displays a label, a formatted value and optional detail. `MetricPanel` composes tiles from an `items` array, individual child components, or both. Use them for campaign totals, financial summaries and other application-provided metrics. The host owns data, formatting, translations and the meaning of a positive or negative change.

```tsx
import { MetricPanel, MetricTile } from '@revolist/ui/preact';

<MetricPanel
  label="Campaign performance"
  items={[
    { label: 'Spend', value: '$643.6K', detail: '76% of budget' },
    {
      label: 'Conversions',
      value: '27.8K',
      detail: '-6%',
      detailTone: 'negative',
    },
  ]}
/>;

<MetricPanel label="Overview">
  <MetricTile label="Revenue" value="$12K" detail="+2%" detailTone="positive" />
</MetricPanel>;
```

The same component names are available from the React, Vue, Angular and Svelte entry points. `MetricTile` uses a description list, and a panel with a `label` exposes a named group. A value or detail beginning with `+` followed by a number is green by default. Set `valueTone` or `detailTone` to `positive`, `negative`, or `neutral` to override that choice—for example, a rise in cost can be negative. Include the sign or descriptive text because color alone does not supply meaning. Values and details may be strings or numbers, including zero. `children` on a tile can add custom content.

For native hosts, `createMetricPanelElement(document, props)` and `renderMetricPanelInto(host, props)` mount and update the same presentation. Call `releaseMetricElement(element)` for an element created by the native helpers when finished. `createMetricTileElement` creates a standalone tile. Renderer-neutral `renderMetricPanel` and `renderMetricTile` are also exported from `@revolist/ui`.

The panel uses a responsive grid and theme tokens. Set `--rv-metric-tile-min-width`, `--rv-metric-tile-height`, `--rv-metric-tile-background`, `--rv-metric-panel-border`, `--rv-metric-panel-radius`, `--rv-metric-positive` and `--rv-metric-negative` to customize it. Native consumers can import `@revolist/ui/styles.css` or `@revolist/ui/metric-panel.scss`; styled framework entry points register the layout styles.

For a more visual card, pass `visual` to `MetricTile`: provide an `accent`, optional `icon`, caller-owned `trend` samples, and optional `detailLead`/`detailRest` and `progress` with a localized `label` and caption. Progress is bounded to 0–100 for its native element. The same option works with panels, renderer-neutral hosts, and `createMetricTileElement`.

For visual tiles with an icon, pass `compact: { badge: '48%' }` to show the icon and badge with the full card on hover or keyboard focus. Supply a formatted and localized badge from the host.

Pass `summary` with a marker color and optional legend to render a compact metric heading. The host supplies the formatted value, detail, and localized labels.
