import { h, type ComponentChildren, type JSX } from 'preact';
import { ButtonControl } from '../native-control';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { TooltipController } from '../surfaces';
import { RemoveButton } from '../buttons/remove-button';
import { SvgIcon } from '../icons/icon';
import circleInfoIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-info.svg?raw';

export type ChoiceChipValue = string | number;

export type ChoiceChipOption<T extends ChoiceChipValue = ChoiceChipValue> = {
  value: T;
  label: any;
  color?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  style?: any;
  testId?: string;
  info?: ComponentChildren;
  onRemove?: () => void;
  removeLabel?: string;
};

export type ChoiceChipsProps<T extends ChoiceChipValue = ChoiceChipValue> = {
  value?: T | readonly T[];
  options: readonly ChoiceChipOption<T>[];
  onChange: (value: T, option: ChoiceChipOption<T>) => void;
  ariaLabel: string;
  appearance?: 'soft' | 'outlined';
  /** Keep choices on one scrollable row, with hidden scrollbars and soft edge fades. */
  scrollable?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  testId?: string;
};

/** Shared wrapping choice control for compact presets and granularities. */
export function ChoiceChips<T extends ChoiceChipValue = ChoiceChipValue>({
  value,
  options,
  onChange,
  ariaLabel,
  appearance = 'soft',
  scrollable = false,
  size = 'medium',
  className = '',
  itemClassName = '',
  disabled = false,
  testId,
}: ChoiceChipsProps<T>): any {
  const root = useRef<HTMLDivElement>(null);
  const [scrollEdges, setScrollEdges] = useState('');
  const updateScrollEdges = () => {
    const element = root.current;
    if (!scrollable || !element) return;
    const left = element.scrollLeft > 1;
    const right =
      element.scrollWidth - element.clientWidth - element.scrollLeft > 1;
    setScrollEdges(`${left ? 'left' : ''} ${right ? 'right' : ''}`.trim());
  };
  useLayoutEffect(() => {
    if (!scrollable || !root.current) return;
    updateScrollEdges();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateScrollEdges);
    observer.observe(root.current);
    for (const child of root.current.children) observer.observe(child);
    return () => observer.disconnect();
  }, [scrollable, options]);
  const selected = Array.isArray(value)
    ? value
    : value === undefined
      ? []
      : [value];

  return (
    <div
      ref={root}
      onScroll={scrollable ? updateScrollEdges : undefined}
      data-scroll-edges={scrollable ? scrollEdges : undefined}
      class={`rv-choice-chips rv-choice-chips--${appearance} rv-choice-chips--${size}${scrollable ? ' rv-choice-chips--scrollable' : ''} ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {options.map((option) => {
        const active = selected.includes(option.value);
        const itemDisabled = disabled || !!option.disabled;
        return (
          <ChoiceChip
            key={String(option.value)}
            className={`${itemClassName} ${option.className ?? ''}`.trim()}
            style={option.style}
            color={option.color}
            selected={active}
            aria-label={option.ariaLabel}
            title={option.title}
            disabled={itemDisabled}
            data-value={String(option.value)}
            data-testid={option.testId}
            onSelect={() => {
              if (!itemDisabled) onChange(option.value, option);
            }}
            info={option.info}
            onRemove={option.onRemove}
            removeLabel={option.removeLabel}
          >
            {option.label}
          </ChoiceChip>
        );
      })}
    </div>
  );
}

export function ChoiceChipInfoButton({
  'data-tooltip': details,
  title,
  ref: forwardedRef,
  ...props
}: JSX.IntrinsicElements['button'] & { 'data-tooltip'?: string }) {
  const anchor = useRef<HTMLButtonElement | null>(null);
  const text = details ?? (typeof title === 'object' ? title.value : title);
  useLayoutEffect(() => {
    if (!anchor.current || !text) return;
    const tooltip = new TooltipController();
    tooltip.bind(anchor.current, text, { trigger: 'click' });
    return () => tooltip.destroy();
  }, [text]);
  return (
    <ButtonControl
      {...props}
      type="button"
      ref={(node: HTMLButtonElement | null) => {
        anchor.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      class={`rv-choice-chip-info ${props.className ?? props.class ?? ''}`.trim()}
    >
      <SvgIcon svg={circleInfoIcon} size={12} />
    </ButtonControl>
  );
}

/** Optional actions are siblings of the selection button, never nested buttons. */
export function ChoiceChip({
  children,
  color,
  selected,
  onSelect,
  info,
  onRemove,
  removeLabel,
  removeClassName = '',
  className = '',
  disabled,
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'onSelect' | 'children'> & {
  children: ComponentChildren;
  color?: string;
  selected?: boolean;
  onSelect?: JSX.MouseEventHandler<HTMLButtonElement>;
  info?: ComponentChildren;
  onRemove?: () => void;
  removeLabel?: string;
  removeClassName?: string;
}) {
  const style = color
    ? typeof props.style === 'string'
      ? `${props.style};--rv-choice-chip-color:${color}`
      : { ...props.style, '--rv-choice-chip-color': color }
    : props.style;
  if (!info && !onRemove && onSelect)
    return (
      <button
        {...props}
        style={style}
        data-color={color ? 'true' : undefined}
        type="button"
        class={`rv-choice-chip ${className}`.trim()}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onSelect}
      >
        {children}
      </button>
    );
  return (
    <span
      class={`rv-choice-chip rv-choice-chip--composite ${className}`.trim()}
      role={props.role}
      style={style}
      data-color={color ? 'true' : undefined}
      data-selected={selected ? 'true' : undefined}
      aria-disabled={disabled || undefined}
    >
      {onSelect ? (
        <button
          {...props}
          type="button"
          class="rv-choice-chip-label"
          aria-pressed={selected}
          disabled={disabled}
          onClick={onSelect}
        >
          {children}
        </button>
      ) : (
        <span class="rv-choice-chip-label">{children}</span>
      )}
      {info}
      {onRemove && (
        <RemoveButton
          compact
          className={removeClassName}
          disabled={typeof disabled === 'object' ? disabled.value : disabled}
          locale={{
            title: removeLabel ?? 'Remove',
            ariaLabel: removeLabel ?? 'Remove',
          }}
          onClick={onRemove}
        />
      )}
    </span>
  );
}
