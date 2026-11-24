# Change visual

`renderChange(h, options)` presents a positive, negative or neutral change. The
caller provides `value` to choose the state and `label` for the displayed value.
By default, negative labels are parenthesized and positive and negative arrows
follow the label. Existing threshold classes can be supplied through `classes`.

For a ranking or growth indicator whose signed value is already formatted, the
host can supply its own arrows and place them before the label:

```ts
renderChange(h, {
  value: -3,
  label: '−3',
  icons: { positive: '↗', negative: '↘' },
  iconPosition: 'before',
  negativeParentheses: false,
});
```

`icons.neutral` is optional. Set an icon to an empty string to suppress it.
The host owns localized text, numeric formatting and any meaning assigned to the
change direction.
