# Segmented proportional bar

`renderSegmentedBar` displays nonnegative finite parts in the order supplied. The optional positive `total` fixes a shared scale; otherwise the parts are normalized to their sum. A part extending beyond the total is clipped to the remaining space, and invalid or negative parts are ignored. Each part may provide a color or a CSS class. Supply a localized `label` describing the breakdown.

Import `@revolist/ui/cell-visuals/segmented-bar.style.scss` or the complete cell-visual stylesheet. Height, remaining-track color and default part color use `--rv-segmented-bar-height`, `--rv-segmented-bar-track` and `--rv-segmented-bar-part`.
