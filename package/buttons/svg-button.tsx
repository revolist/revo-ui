/** @jsxImportSource preact */
import { h, type ComponentChildren, type JSX } from 'preact';
import { controlClassName } from '../control-presentation';
import { ButtonControl } from '../native-control';
import { SvgIcon } from '../icons';

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
  return (
    <ButtonControl
      type="button"
      aria-label={badge !== undefined ? `${label} ${badge}` : label}
      {...attributes}
      disabled={disabled}
      title={title}
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
    </ButtonControl>
  );
}
