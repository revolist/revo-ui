import { h as preactH, type JSX } from 'preact';

export type SegmentedSwitchRenderable = any;

export type SegmentedSwitchValue = string | number;

export type SegmentedSwitchOption<
  T extends SegmentedSwitchValue = SegmentedSwitchValue,
> = {
  value: T;
  label: SegmentedSwitchRenderable;
  count?: number | string;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  testId?: string;
  id?: string;
  ariaControls?: string;
  /** Consumer metadata; the switch retains ownership of behavior and tab semantics. */
  buttonAttributes?: Omit<
    JSX.IntrinsicElements['button'],
    | 'children'
    | 'class'
    | 'className'
    | 'id'
    | 'type'
    | 'role'
    | 'tabIndex'
    | 'disabled'
    | 'onClick'
    | 'onKeyDown'
    | 'aria-selected'
    | 'aria-checked'
    | 'aria-controls'
  > & { [attribute: `data-${string}`]: string | number | boolean | undefined };
};

export type SegmentedSwitchRole = 'tablist' | 'radiogroup' | 'group';

export type SegmentedSwitchProps<
  T extends SegmentedSwitchValue = SegmentedSwitchValue,
> = {
  value: T;
  options: SegmentedSwitchOption<T>[];
  onChange: (
    value: T,
    option: SegmentedSwitchOption<T>,
    event?: MouseEvent | KeyboardEvent,
  ) => void;
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  countClassName?: string;
  activeClassName?: string;
  disabled?: boolean;
  /** Compact icon layout. Supply icons through renderOption and text through option labels. */
  iconOnly?: boolean;
  title?: string;
  role?: SegmentedSwitchRole;
  testId?: string;
  renderOption?: (
    option: SegmentedSwitchOption<T>,
    state: { active: boolean; disabled: boolean },
  ) => SegmentedSwitchRenderable;
  renderCount?: (
    option: SegmentedSwitchOption<T>,
    state: { active: boolean; disabled: boolean },
  ) => SegmentedSwitchRenderable;
};

function getItemRole(role: SegmentedSwitchRole) {
  if (role === 'tablist') return 'tab';
  if (role === 'radiogroup') return 'radio';
  return undefined;
}

export function SegmentedSwitch<
  T extends SegmentedSwitchValue = SegmentedSwitchValue,
>(props: SegmentedSwitchProps<T>): any {
  return renderSegmentedSwitch(preactH, props);
}

/** Shared markup and behavior for framework adapters, including server rendering. */
export function renderSegmentedSwitch<
  T extends SegmentedSwitchValue = SegmentedSwitchValue,
>(
  h: (tag: string, attributes: Record<string, any>, ...children: any[]) => any,
  {
    value,
    options,
    onChange,
    ariaLabel,
    className = '',
    itemClassName = '',
    countClassName = '',
    activeClassName = 'on',
    disabled = false,
    iconOnly = false,
    title,
    role = 'tablist',
    testId,
    renderOption,
    renderCount,
  }: SegmentedSwitchProps<T>,
): any {
  const itemRole = getItemRole(role);
  const enabledOptions = options.filter(
    (option) => !disabled && !option.disabled,
  );
  const hasEnabledActiveOption = enabledOptions.some(
    (option) => option.value === value,
  );

  const moveFocus = (event: KeyboardEvent, currentValue: T) => {
    if (
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return;
    if (!enabledOptions.length) return;
    event.preventDefault();
    event.stopPropagation();
    const current = enabledOptions.findIndex(
      (option) => option.value === currentValue,
    );
    const backwards = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const targetIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabledOptions.length - 1
          : (Math.max(0, current) +
              (backwards ? -1 : 1) +
              enabledOptions.length) %
            enabledOptions.length;
    const target = enabledOptions[targetIndex];
    onChange(target.value, target, event);
    const buttons = (
      event.currentTarget as HTMLButtonElement
    ).parentElement?.querySelectorAll<HTMLButtonElement>(
      '.rv-segmented-switch-item:not(:disabled)',
    );
    buttons?.[targetIndex]?.focus();
  };

  return h(
    'div',
    {
      class:
        `rv-segmented-switch${iconOnly ? ' rv-segmented-switch--icon-only' : ''} ${className}`.trim(),
      role,
      'aria-label': ariaLabel,
      title,
      'data-testid': testId,
    },
    ...options.map((option) => {
      const active = option.value === value;
      const itemDisabled = disabled || !!option.disabled;
      const state = { active, disabled: itemDisabled };
      return h(
        'button',
        {
          ...option.buttonAttributes,
          key: String(option.value),
          type: 'button',
          role: itemRole,
          id: option.id,
          'aria-controls': option.ariaControls,
          'aria-selected': itemRole === 'tab' ? String(active) : undefined,
          'aria-checked': itemRole === 'radio' ? String(active) : undefined,
          'aria-pressed': role === 'group' ? String(active) : undefined,
          'aria-label':
            option.ariaLabel ??
            (iconOnly && typeof option.label === 'string'
              ? option.label
              : undefined),
          title:
            option.title ??
            (iconOnly && typeof option.label === 'string'
              ? option.label
              : undefined),
          tabIndex:
            itemRole &&
            !itemDisabled &&
            (active ||
              (!hasEnabledActiveOption && option === enabledOptions[0]))
              ? 0
              : itemRole
                ? -1
                : undefined,
          class:
            `rv-segmented-switch-item ${active ? `on ${activeClassName}` : ''} ${itemClassName} ${option.className ?? ''}`.trim(),
          disabled: itemDisabled,
          'data-value': String(option.value),
          'data-testid': option.testId,
          onKeyDown: (event: KeyboardEvent) => moveFocus(event, option.value),
          onClick: (event: MouseEvent) => {
            if (itemDisabled || active) return;
            onChange(option.value, option, event);
          },
        },
        h(
          'span',
          { class: 'rv-segmented-switch-label' },
          renderOption ? renderOption(option, state) : option.label,
        ),
        option.count !== undefined
          ? h(
              'span',
              {
                class: `rv-segmented-switch-count ${countClassName}`.trim(),
              },
              renderCount ? renderCount(option, state) : option.count,
            )
          : null,
      );
    }),
  );
}
