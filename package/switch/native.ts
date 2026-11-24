import type { ElementFactory } from '../native-controls';

export interface NativeSwitchOptions {
  checked: boolean;
  label: unknown;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  labelPosition?: 'before' | 'after';
  style?: Record<string, string | undefined>;
  title?: string;
  testId?: string;
  thumbRef?: unknown;
  onClick?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

/** Framework-neutral markup for the shared switch, including its accessible state. */
export function renderSwitch(
  h: ElementFactory,
  options: NativeSwitchOptions,
  root: unknown = 'button',
) {
  const label = h(
    'span',
    { class: 'rv-switch-label', 'data-part': 'label' },
    options.label,
  );
  const track = h(
    'span',
    { class: 'rv-switch-track', 'data-part': 'track', 'aria-hidden': 'true' },
    [
      h('span', {
        ref: options.thumbRef,
        class: 'rv-switch-thumb',
        'data-part': 'thumb',
      }),
    ],
  );
  return h(
    'button',
    {
      type: 'button',
      class: ['rv-switch', options.className].filter(Boolean).join(' '),
      style: options.style,
      'data-part': 'root',
      'data-state': options.checked ? 'checked' : 'unchecked',
      role: 'switch',
      'aria-checked': String(options.checked),
      'aria-label':
        options.ariaLabel ??
        (typeof options.label === 'string' ? options.label : undefined),
      disabled: options.disabled,
      title: options.title,
      'data-testid': options.testId,
      onClick: options.onClick,
      onKeyDown: options.onKeyDown,
    },
    options.labelPosition === 'after' ? [track, label] : [label, track],
  );
}
