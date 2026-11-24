# Baseline variance bar

`renderVarianceBar` positions a numeric value on an explicit `min`–`max` domain and draws a bar between that value and a configurable `baseline` (default zero). An optional `reference` adds a comparison marker. Values and markers outside the domain are visually clamped; invalid values or domains produce an empty visual. Provide a localized `label` describing the values.

Import `@revolist/ui/cell-visuals/variance-bar.style.scss` or the cell-visual styles. Customize geometry and colors using the `--rv-variance-bar-*` properties.
