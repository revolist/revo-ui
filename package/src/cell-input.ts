import './cell-input.scss';

/** Compact native input presentation for grid-hosted editors. */
export function cellInputProps<T extends Record<string, unknown>>(
  attributes: T,
) {
  return {
    type: 'text',
    enterKeyHint: 'enter',
    ...attributes,
    class: 'rv-cell-input',
  };
}

/** Render through the host's VNode factory while keeping native markup in UI. */
export function renderCellInput<H extends (...args: any[]) => any>(
  h: H,
  attributes: Record<string, unknown>,
): ReturnType<H> {
  return h('input', cellInputProps(attributes));
}
