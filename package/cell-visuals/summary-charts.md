# Summary charts

`renderDotHistogram(h, options)` renders a compact binned distribution. Supply finite numeric `values`, a localized `label`, and optional `formatValue`, `bins`, `maxPoints`, `maxStack`, and `isHighlighted`. The default limits are 21 bins, 50 values, and eight dots per bin. Empty and invalid values produce an empty plot.

`renderSegmentedSummary(h, options)` composes the shared segmented bar and a legend. Supply localized `label`, ordered `parts` with `label`, nonnegative `value`, and `color`; `legendOrder` can present those parts in a different order and `formatValue` can localize counts.

For native DOM, import `createDotHistogramElement` and `createSegmentedSummaryElement` from `@revolist/ui/cell-visuals` or `@revolist/ui/native`, and call `releaseSummaryChartElement` when removing a created chart. Import `@revolist/ui/cell-visuals/summary-charts.style.scss` and `@revolist/ui/cell-visuals/segmented-bar.style.scss` for standalone styling. Chart colors and plot height support CSS custom properties.

Native dot histograms accept a `tooltip(value, index)` callback returning `title`, optional `subtitle`, `metricLabel`, and `metricValue`. Dots become keyboard-focusable and show the shared tooltip on hover or focus; the index refers to the original `values` array. Release the chart when removing it to clean up its tooltip.

`renderDottedComparison` renders independently configurable dotted bars and reference markers using a shared maximum and column width. `renderStackedDotPlot` displays caller-positioned marks with a configurable reference line. Both accept localized chart labels. Native hosts can use `createDottedComparisonElement` and `createStackedDotPlotElement`, then call `releaseSummaryChartElement` on removal; standalone styles are in `@revolist/ui/cell-visuals/dotted-summary.style.scss`.

The native dotted comparison accepts a `tooltip(value, reference, index)` callback with localized title, subtitle and rows; the stacked dot plot accepts overall `tooltip` content and an optional `pointTooltip(point, index)` callback for individual, keyboard-focusable dots. The index refers to the original points array, including when invalid coordinates are skipped. Tooltip-enabled comparison columns and plots support hover and keyboard focus. Release the chart when removing it to dispose its tooltip.
