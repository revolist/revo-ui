# Compact charts

`BarChart`, `LineChart`, and `AreaChart` are standalone Preact presentation components. `DistributionChart` selects the same implementations by `type`; Pro imports that owner for distribution filters. Existing compact defaults and selected interval masks remain unchanged.

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

Use the shared `--rv-distribution-*` variables to customize a visualization. Defaults use theme surfaces, text/borders and standard blue `--rv-ui-accent`. Arrow keys, Home and End move focus through data points. Category progression stays left-to-right in RTL pages so bars, SVG points, labels and keyboard order agree; legends and surrounding controls follow the page direction.

## Ownership and scope

These are nonnegative, single-measure compact distributions. Nonfinite/negative values retain the existing normalization to zero. They do not replace `@revolist/charts`: that product already owns multiple measures, stacked/grouped/horizontal/radial charts, axes/domains, legend actions, shared tooltips and exports. Keep those options in its existing model/renderer; never import this optional Preact adapter into the native Charts runtime.

Gallery examples demonstrate each option and the existing Pro-style range-brush composition.
