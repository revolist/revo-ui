# Cell visualization ownership

The renderers in `packages/pro/plugins/charts` are RevoGrid **hyperscript templates**, not independently registered Stencil web components. UI accepts the element factory and explicit display values/options. The same presentation works with Stencil's factory and Preact; native DOM renderers can supply their own factory. It does not import RevoGrid, Pro, or Preact.

The `Cell visuals` gallery section renders the shared functions directly without a grid. Its fixed-size preview frames supply the dimensions normally provided by a cell. Ordinary editable `NumberStepper` remains in Inputs; `editorCounter` uses the separate **Cell stepper** presentation.

| Existing Pro export                       | Shared presentation owner                            | Pro responsibility retained                                                        |
| ----------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| progressBarRenderer                       | UI progress/bar: renderProgressBar                   | Row progress callback, column range/format                                         |
| progressLineRenderer                      | UI cell-visuals: renderProgressLine                  | Row progress callback, formatting, thresholds                                      |
| progressLineWithValueRenderer             | UI cell-visuals: renderProgressLineValue             | Existing progress calculation and thresholds                                       |
| circularProgressRenderer                  | UI progress/circular: renderCircularProgress         | Row progress callback, formatting, thresholds                                      |
| sparklineRenderer                         | UI cell-visuals: renderSparkline                     | Column options, threshold-class callback                                           |
| barChartRenderer                          | UI cell-visuals: renderMiniBarChart                  | Column options, threshold-class callback                                           |
| heatmapRenderer                           | UI cell-visuals: renderHeatmap                       | Column option adapter                                                              |
| badgeRenderer                             | UI cell-visuals: renderBadgeValue                    | Value-style lookup and thresholds                                                  |
| ratingStarRenderer                        | Existing UI native renderRatingStars                 | Column maximum, threshold and accessible-name policy                               |
| timelineRenderer                          | UI cell-visuals: renderTimeline                      | Column range and accessible-name adapter                                           |
| formatTimelineEvents / TimelineEvent      | UI cell-visuals/timeline                             | Existing Pro re-exports remain compatible                                          |
| changeRenderer                            | UI cell-visuals: renderChange                        | Raw row value lookup, thresholds                                                   |
| thumbsRenderer                            | UI cell-visuals: renderThumbs                        | Existing boolean parsing rules                                                     |
| pieChartRenderer / PieData                | UI cell-visuals: renderPie                           | Existing Pro exports and value adapter                                             |
| summaryHeaderRenderer                     | UI cell-visuals: renderPercentageSummary             | Counts, sorting, top items, Others calculation                                     |
| summaryAggregateRenderer                  | UI cell-visuals: renderAggregateSummary              | Existing aggregation formula and showSum/showAvg flags                             |
| columnTypeRenderer / renderColumnTypeIcon | UI cell-visuals: renderLabelledIcon / renderTypeIcon | Grid column-type interpretation and bundled glyph selection                        |
| avatarRenderer / avatarTemplate           | Existing UI avatar owner                             | Row/avatar field lookup, index and label selection                                 |
| avatarWithTextRenderer                    | UI avatar: avatarWithTextTemplate                    | Row/avatar field lookup and label selection                                        |
| editorCounter                             | Existing UI native renderCounter                     | Bounds from column config and original celledit dispatch                           |
| thresholdRenderer                         | **Stays in Pro**                                     | Grid cellProperties contract and threshold policy; it is not an independent widget |

Styles live in `package/cell-visuals/`. Existing Pro stylesheet paths forward/import the shared owner; grid-specific theme selectors remain in Pro. Legacy classes, authored color variables, threshold semantics and renderer exports are retained. Summary calculations have deliberately not been reinterpreted during presentation extraction.

Legacy cell mini bars/sparklines retain their DOM/SVG contracts. The distribution charts and complete standalone Charts engine remain distinct higher-level compositions; this extraction does not replace their aggregation, filtering or interaction controllers.

Presentation refinements: normal-size pie canvases and centered constrained labels, non-scaling sparkline strokes, theme-aware change labels, and explicit summary line height. Pie accepts optional preview size, label font and accessible-name overrides. Cell stepper accepts optional increase/decrease labels, and retains native disabled bounds and legacy counter classes.

Tests are colocated at `package/cell-visuals/cell-visuals.test.tsx`, owned by the canonical UI suite. Existing Pro chart tests remain at their adapters. `tests/e2e-pro/tests/shared-cell-visuals.spec.ts` exercises a real grid matrix and stepper commits; the standalone gallery adds light/dark, desktop/narrow and RTL screenshot/interaction coverage.
