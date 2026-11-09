# Slider compositions

`Slider` / `SingleValueSlider` retains its bare native `input[type=range]` contract. `SliderField` composes that owner with an associated wrapping label and optional value presentation, exported through the shared Preact entry point.

- `layout`: `inline` (default) or `stacked`. Inline labels stack on small screens.
- `valuePlacement`: `end` callout (default), `thumb`, or `none`.
- `formatValue`: formats visible and accessible value text, including units. Explicit `ariaValueText` takes precedence for assistive technology.
- `ticks`: evenly spaced decorative marks, clamped to 2–101; input `step` remains responsible for allowed values.
- `accentColor`: optional per-control accent. Defaults to standard blue; disabled controls use neutral theme colors.

Track and thumb styling comes unchanged from the common slider; only accents and decorative value badges/ticks differ.

All native min/max/step, disabled, focus, keyboard, input/change and commit semantics come from the existing single-thumb slider. Consumers own values. Marks and display chips are decorative; the native input owns accessible value information. Long formatted thumb values should use an end callout. Existing range sliders and brush controls remain separate owners.
