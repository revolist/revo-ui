# Diverging bars

`renderDivergingBars` displays a numeric array around a shared zero baseline. Supply a localized `label`; `maxAbs` sets a shared absolute scale, and `highlightIndex` emphasizes one zero-based entry. Values outside the scale are clamped. Non-finite values and missing entries leave an empty slot. Without a valid `maxAbs`, the maximum finite magnitude is used.

Import `@revolist/ui/cell-visuals/diverging-bars.style.scss` or the full UI stylesheet. Customize height, gap and colors with `--rv-diverging-bars-height`, `--rv-diverging-bars-gap`, `--rv-diverging-bars-positive`, `--rv-diverging-bars-negative` and `--rv-diverging-bars-highlight`.
