# Compact strip plot

`renderStripPlot` displays caller-provided points on a numeric domain in a compact cell. Each point can have its own diameter, color, outline and tooltip. Set `reference` for a marker, `zero` for a shaded region, and `reverse` to reverse the axis. Values outside the domain are clamped and non-finite points are skipped. Supply a localized `label` that describes the points and the meaning of any reference or shaded region.

Import `@revolist/ui/cell-visuals/strip-plot.style.scss` or the full cell-visual stylesheet. Colors and zero-region appearance can be customized with `--rv-strip-plot-axis`, `--rv-strip-plot-zero`, `--rv-strip-plot-reference` and `--rv-strip-plot-point`.
