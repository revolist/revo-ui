# Compact charts

`BarChart`, `LineChart`, `AreaChart`, and `DonutChart` are standalone Preact presentation components. `DistributionChart` selects the same implementations by `type`, including `donut`; its framework adapters support the same option. Pro imports that owner for distribution filters. Existing compact defaults and selected interval masks remain unchanged.

## Presentation options

- `height`: plot height, bounded to 40–240px. Labels and legend add natural height.
- `showGrid`: five subtle horizontal guide lines.
- `showLabels`: category labels from each datum's tooltip title, truncated visually with a native title for long text. Full text remains in the keyboard target's accessible label.
- `showValues` and `formatValue`: optional formatted value labels.
- `legend`: single-measure legend with the shared blue accent.
- `showPoints`: hide line/area markers while preserving keyboard access.
- `interpolation`: `linear` (default) or `step` (step-after).
- `areaFill`: `solid` (default) or `gradient`, with instance-safe SVG IDs.
- `tooltip`: set false to hide tooltips without removing accessible labels.
- `tooltipIndicator`: `none` (default), `dot`, `line`, or `dashed`.
- `renderTooltip`: custom Preact content; the same lifecycle handles pointer and keyboard focus.
- `sliceColors`: doughnut slice colors in data order; defaults to chart theme colors.
- `centerLabel`: optional text in the doughnut center, supplied and localized by the host.
- `barPattern`: set `dots` or `stripes` on single-series bars. For multiple series, set `pattern` on each bar series.
- `slicePatterns`: optional `dots` or `stripes` per doughnut slice, aligned with `data`; omit an entry for a solid slice.
- `series`: named value arrays aligned to `data` categories by index, with optional color and `bar`, `line`, or `area` type overrides.
- `seriesMode`: `overlay` (default, with adjacent bars) or `stacked` (cumulative values). Missing, nonfinite and negative values become zero. Series share one nonnegative scale. A series legend and category tooltip list each value; custom tooltip callbacks still receive the original datum. `showValues` displays the category maximum in overlay mode and its sum in stacked mode.

```tsx
<DistributionChart type="bar" ariaLabel="Orders and target" data={months} showLabels series={[
  { key: 'actual', label: 'Orders', type: 'bar', values: [24, 36, 30] },
  { key: 'target', label: 'Target', type: 'line', values: [28, 30, 32] },
]} />
```

Use `seriesMode="stacked"` with bar or area series for cumulative compositions. In stacked mode line series also plot cumulative values. Data and labels remain supplied and localized by the host.

When any category supplies `selected`, unselected bars and points are muted; line and area intervals are emphasized when both endpoint categories are selected. If no category supplies `selected`, all series remain emphasized.

For framework adapters, use `DistributionChart` with `type="donut"`:

```tsx
<DistributionChart
  type="donut"
  ariaLabel="Visits by source, 1,000 total"
  centerLabel="1,000"
  data={[
    { key: 'direct', value: 600, tooltip: { title: 'Direct', details: ['600 visits'] } },
    { key: 'search', value: 400, tooltip: { title: 'Search', details: ['400 visits'] } },
  ]}
/>
```

The center label is visual; include the total in `ariaLabel` when it conveys information. Focus a segment and use the arrow keys, Home or End to inspect its tooltip. Empty and zero-only data render the neutral ring. For Preact-only code, `DonutChart` is also exported from `@revolist/ui/distribution-chart`.

Use the shared `--rv-distribution-*` variables to customize a visualization. Defaults use theme surfaces, text/borders and standard blue `--rv-ui-accent`. Arrow keys, Home and End move focus through data points. Category progression stays left-to-right in RTL pages so bars, SVG points, labels and keyboard order agree; legends and surrounding controls follow the page direction.

## Ownership and scope

These are nonnegative, single-measure compact distributions. Nonfinite/negative values retain the existing normalization to zero. They do not replace `@revolist/charts`: that product already owns multiple measures, stacked/grouped/horizontal/radial charts, axes/domains, legend actions, shared tooltips and exports. Keep those options in its existing model/renderer; never import this optional Preact adapter into the native Charts runtime.

Gallery examples demonstrate each option and the existing Pro-style range-brush composition.
