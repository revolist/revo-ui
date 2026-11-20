import { h, type ComponentChildren } from 'preact';
import { badgeClassName, type BadgeOptions } from './badge';

export type BadgePreset = {
  className?: string;
  props?: BadgeOptions;
};

/** Shared badge presentation, independent of toolbar and form controls. */
export function Badge({
  preset,
  children,
  className = '',
  variant,
  shape,
}: BadgeOptions & {
  preset?: BadgePreset;
  children?: ComponentChildren;
  className?: string;
  label?: string;
}) {
  return (
    <span
      data-part="root"
      class={`${badgeClassName({ variant: variant ?? preset?.props?.variant, shape: shape ?? preset?.props?.shape })} ${preset?.className ?? ''} ${className}`}
    >
      {children}
    </span>
  );
}
