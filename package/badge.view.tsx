import { h, type ComponentChildren } from 'preact';
import { badgeClassName, type BadgeOptions } from './badge';

/** Shared badge presentation, independent of toolbar and form controls. */
export function Badge({
  children,
  className = '',
  variant,
  shape,
}: BadgeOptions & {
  children?: ComponentChildren;
  className?: string;
  label?: string;
}) {
  return (
    <span class={`${badgeClassName({ variant, shape })} ${className}`}>
      {children}
    </span>
  );
}
