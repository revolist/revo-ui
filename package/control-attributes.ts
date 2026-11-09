/** Native control presentation shared by Preact, Stencil, DOM and Charts. */
export type ControlTag = 'button' | 'input' | 'select' | 'textarea' | 'summary';
export type ControlAttributes = Record<string, any>;
export function controlClassName(...values: unknown[]): string {
  values = values.map((value) =>
    value &&
    typeof value === 'object' &&
    'value' in value &&
    'subscribe' in value
      ? value.value
      : value,
  );
  const classes = values.flatMap((value) =>
    typeof value === 'string'
      ? value.split(/\s+/)
      : value && typeof value === 'object'
        ? Object.entries(value)
            .filter(([, enabled]) => enabled)
            .map(([name]) => name)
        : [],
  );
  return [...new Set(classes.filter(Boolean))].join(' ');
}
export function controlAttributes(
  tag: ControlTag,
  attributes: ControlAttributes = {},
): ControlAttributes {
  const {
    class: nativeClass,
    className,
    unstyled,
    busy,
    rounded,
    ...rest
  } = attributes;
  const isBusy = tag === 'button' && busy === true;
  if (isBusy) {
    // A disabled native button blocks keyboard activation and form submission.
    // Drop consumer handlers too, including synthetic dispatched events.
    for (const key of Object.keys(rest)) if (/^on/i.test(key)) delete rest[key];
    rest.disabled = true;
    rest['aria-busy'] = true;
    rest.onClickCapture = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
  }
  const inputType = tag === 'input' ? (attributes.type ?? 'text') : undefined;
  const base =
    tag === 'button'
      ? unstyled
        ? ''
        : 'rv-btn'
      : tag === 'summary'
        ? 'rv-disclosure-summary'
        : inputType === 'checkbox'
          ? 'rv-checkbox'
          : inputType === 'radio'
            ? 'rv-radio'
            : inputType === 'range'
              ? 'rv-native-slider'
              : inputType === 'hidden'
                ? ''
                : 'rv-control';
  return {
    ...(tag === 'button' ? { type: 'button' } : {}),
    ...rest,
    class: controlClassName(
      base,
      nativeClass,
      className,
      tag === 'button' && rounded && 'rv-btn-rounded',
      isBusy && 'rv-btn-busy',
      isBusy && attributes.disabled && 'rv-btn-busy-disabled',
    ),
  };
}
