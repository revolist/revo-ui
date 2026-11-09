/** @jsxImportSource preact */
import { h, type ComponentChildren, type JSX } from 'preact';
import { controlClassName } from '../control-presentation';
import { ButtonControl } from '../native-control';
import { SvgIcon } from '../icons';
import { useControlTooltip } from '../core/tooltip';

export interface SvgButtonProps extends Omit<
  JSX.IntrinsicElements['button'],
  'className' | 'children'
> {
  readonly label: string;
  readonly rounded?: boolean;
  readonly busy?: boolean;
  /** Explicit variants retain shared appearance when consumer classes are supplied. */
  readonly variant?: 'link' | 'ghost' | 'solid';
  readonly badge?: string | number;
  readonly badgeClassName?: string;
  readonly icon?: string;
  readonly iconContent?: ComponentChildren;
  readonly visibleLabel?: string;
  readonly className?: string;
  readonly iconClassName?: string;
  readonly labelClassName?: string;
  readonly children?: ComponentChildren;
}

/** Shared native button presentation for trusted bundled SVG controls. */
export function SvgButton({
  label,
  variant,
  icon,
  visibleLabel,
  className,
  iconClassName,
  labelClassName,
  children,
  iconContent,
  badge,
  badgeClassName = '',
  class: nativeClass,
  disabled,
  title,
  ...attributes
}: SvgButtonProps) {
  const tooltip = useControlTooltip(
    typeof title === 'string' ? title : label,
    true,
    {
      className: 'rv-control-tooltip',
      placement: 'above',
    },
  );
  return (
    <ButtonControl
      type="button"
      aria-label={badge !== undefined ? `${label} ${badge}` : label}
      {...attributes}
      disabled={disabled}
      {...tooltip.triggerProps}
      aria-describedby={[attributes['aria-describedby'], tooltip.id]
        .filter(Boolean)
        .join(' ')}
      onFocus={(event) => {
        tooltip.triggerProps.onFocus(event);
        attributes.onFocus?.(event);
      }}
      onBlur={(event) => {
        tooltip.triggerProps.onBlur();
        attributes.onBlur?.(event);
      }}
      onMouseEnter={(event) => {
        tooltip.triggerProps.onMouseEnter(event);
        attributes.onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        tooltip.triggerProps.onMouseLeave();
        attributes.onMouseLeave?.(event);
      }}
      onPointerDown={(event) => {
        tooltip.triggerProps.onPointerDown(event);
        attributes.onPointerDown?.(event);
      }}
      onPointerCancel={(event) => {
        tooltip.triggerProps.onPointerCancel();
        attributes.onPointerCancel?.(event);
      }}
      onKeyDown={(event) => {
        tooltip.triggerProps.onKeyDown(event);
        attributes.onKeyDown?.(event);
      }}
      onClick={(event) => {
        tooltip.hide();
        attributes.onClick?.(event);
      }}
      class={controlClassName(
        className ?? (variant ? '' : 'rv-btn-ghost'),
        variant && `rv-btn-${variant}`,
        nativeClass,
        'rv-icon-action',
        !visibleLabel && 'rv-btn-icon',
      )}
    >
      {icon ? <SvgIcon svg={icon} className={iconClassName} /> : iconContent}
      {visibleLabel ? <span class={labelClassName}>{visibleLabel}</span> : null}
      {badge !== undefined && (
        <span class={`rv-badge ${badgeClassName}`} aria-hidden="true">
          {badge}
        </span>
      )}
      {children}
      {tooltip.tooltip}
    </ButtonControl>
  );
}
