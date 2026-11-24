# Comparison sparkline

`renderComparisonSparkline(h, options)` renders multiple compact SVG series on a shared numeric scale. The host supplies `series`, a localized `label`, optional `minValue`/`maxValue`, and series presentation (color, solid or gradient fill, fill opacity, dash and endpoint). Arrays may contain nulls or non-finite values; these create gaps. Empty inputs return an empty visual, and gradient IDs are unique per instance. Import from `@revolist/ui/cell-visuals` with shared styles. For RevoGrid, use the Pro `comparisonSparklineRenderer` adapter.

A series may specify `belowThreshold: { value, color }` to draw portions below a numeric limit in a contrasting color. The series fill is clipped to the region above that limit.
