import { h as preactH, type JSX } from 'preact';
import { selectionSettle } from '../core/settle-motion';
import {
  motionAllowed,
  presetAnimation,
  type MotionPreset,
} from '../presets/motion';

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

export type SegmentedSwitchPreset = {
  motion?: MotionPreset;
  className?: string;
  props?: { iconOnly?: boolean; disabled?: boolean };
};

export type SegmentedSwitchProps<
  T extends SegmentedSwitchValue = SegmentedSwitchValue,
> = {
  preset?: SegmentedSwitchPreset;
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

/** Animate only after a controlled change has actually selected the target. */
function animateSelection(
  root: HTMLElement,
  previous: DOMRect,
  target: HTMLButtonElement,
  motion?: MotionPreset,
) {
  if (
    typeof window === 'undefined' ||
    typeof target.animate !== 'function' ||
    !motionAllowed(root)
  )
    return;
  requestAnimationFrame(() => {
    if (!root.isConnected || !target.classList.contains('on')) return;
    root.querySelector('.rv-segmented-switch-indicator')?.remove();
    delete root.dataset.sliding;
    const bounds = root.getBoundingClientRect();
    const next = target.getBoundingClientRect();
    const selected = getComputedStyle(target);
    const indicator = document.createElement('span');
    indicator.className = 'rv-segmented-switch-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    Object.assign(indicator.style, {
      left: `${previous.left - bounds.left - root.clientLeft}px`,
      top: `${next.top - bounds.top - root.clientTop}px`,
      width: `${previous.width}px`,
      height: `${next.height}px`,
      borderRadius: selected.borderRadius,
      background: selected.backgroundColor,
      borderColor: selected.borderColor,
      boxShadow: selected.boxShadow,
    });
    if (root.classList.contains('rv-tabs--underline')) {
      const thickness = Number.parseFloat(selected.borderBottomWidth) || 0;
      Object.assign(indicator.style, {
        top: `${next.bottom - bounds.top - root.clientTop - thickness}px`,
        height: `${thickness}px`,
        border: '0',
        borderRadius: '0',
        background: selected.borderBottomColor,
        boxShadow: 'none',
      });
    }
    const distance = next.left - previous.left;
    const configured = presetAnimation(
      motion,
      'selection',
      {
        keyframes: [
          { transform: 'translateX(0)', width: `${previous.width}px` },
          {
            transform: `translateX(${distance}px) scaleX(${selectionSettle.scale})`,
            width: `${next.width}px`,
            offset: selectionSettle.offset,
          },
          {
            transform: `translateX(${distance}px)`,
            width: `${next.width}px`,
          },
        ],
        options: {
          duration: selectionSettle.duration,
          easing: selectionSettle.easing,
        },
      },
      { distance, startWidth: previous.width, endWidth: next.width },
    );
    if (!configured) return;
    root.appendChild(indicator);
    root.dataset.sliding = '';
    const animation = indicator.animate(
      configured.keyframes,
      configured.options,
    );
    const cleanup = () => {
      indicator.remove();
      if (!root.querySelector('.rv-segmented-switch-indicator'))
        delete root.dataset.sliding;
    };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  });
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
    preset,
    value,
    options,
    onChange,
    ariaLabel,
    className = '',
    itemClassName = '',
    countClassName = '',
    activeClassName = 'on',
    disabled: disabledProp,
    iconOnly: iconOnlyProp,
    title,
    role = 'tablist',
    testId,
    renderOption,
    renderCount,
  }: SegmentedSwitchProps<T>,
): any {
  const disabled = disabledProp ?? preset?.props?.disabled ?? false;
  const iconOnly = iconOnlyProp ?? preset?.props?.iconOnly ?? false;
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
    const buttons = (
      event.currentTarget as HTMLButtonElement
    ).parentElement?.querySelectorAll<HTMLButtonElement>(
      '.rv-segmented-switch-item:not(:disabled)',
    );
    const root = (event.currentTarget as HTMLButtonElement).parentElement;
    const previous = (
      event.currentTarget as HTMLButtonElement
    ).getBoundingClientRect();
    onChange(target.value, target, event);
    if (root && buttons?.[targetIndex])
      animateSelection(root, previous, buttons[targetIndex], preset?.motion);
    buttons?.[targetIndex]?.focus();
  };

  return h(
    'div',
    {
      class:
        `rv-segmented-switch${iconOnly ? ' rv-segmented-switch--icon-only' : ''} ${preset?.className ?? ''} ${className}`.trim(),
      role,
      'data-part': 'root',
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
          'data-part': 'item',
          'data-state': active ? 'active' : 'inactive',
          'data-value': String(option.value),
          'data-testid': option.testId,
          onKeyDown: (event: KeyboardEvent) => moveFocus(event, option.value),
          onClick: (event: MouseEvent) => {
            if (itemDisabled || active) return;
            const target = event.currentTarget as HTMLButtonElement;
            const root = target.parentElement;
            const previous = root
              ?.querySelector<HTMLElement>('.rv-segmented-switch-item.on')
              ?.getBoundingClientRect();
            onChange(option.value, option, event);
            if (root && previous)
              animateSelection(root, previous, target, preset?.motion);
          },
        },
        h(
          'span',
          { class: 'rv-segmented-switch-label', 'data-part': 'label' },
          renderOption ? renderOption(option, state) : option.label,
        ),
        option.count !== undefined
          ? h(
              'span',
              {
                class: `rv-segmented-switch-count ${countClassName}`.trim(),
                'data-part': 'count',
              },
              renderCount ? renderCount(option, state) : option.count,
            )
          : null,
      );
    }),
  );
}
