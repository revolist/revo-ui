# Metric stack visual

`renderMetricStack(h, { value, detail?, tone? })` displays host-formatted primary and supporting text. Supported tones are `positive`, `negative`, and `neutral`; the caller owns localization and interpretation. Colors can be themed with `--rv-metric-stack-positive`, `--rv-metric-stack-negative`, and `--rv-metric-stack-neutral`.

Set `layout: 'inline'` to place the detail beside the value. `trend: 'up' | 'down'` adds an icon, and `detailLabel` supplies localized accessible text. Use `valueTone` to style the primary value, including `muted` for an empty state.
