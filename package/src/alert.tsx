/** @jsxRuntime classic */
/** @jsx h */
import { h as preactH, type ComponentChildren, type JSX } from 'preact';

export type AlertProps = Omit<JSX.IntrinsicElements['div'], 'title'> & {
  tone?: 'neutral' | 'warning' | 'danger' | 'success';
  label?: string;
  icon?: ComponentChildren;
  title?: ComponentChildren;
  description?: ComponentChildren;
  actions?: ComponentChildren;
};

/** The same alert markup for Preact and renderer-neutral grid templates. */
export function renderAlert<T>(
  renderer: (tag: string, attributes: any, children?: any) => T,
  {
    children,
    tone = 'neutral',
    label,
    icon,
    title,
    description,
    actions,
    className = '',
    class: htmlClass = '',
    ...attributes
  }: AlertProps,
): T {
  const h = (tag: string, attributes: any, ...children: any[]) =>
    renderer(tag, attributes, children);
  return (
    <div
      {...attributes}
      class={`rv-alert rv-alert--${tone}${icon ? ' rv-alert--with-icon' : ''}${actions ? ' rv-alert--with-actions' : ''} ${className} ${htmlClass}`.trim()}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-label={label ?? attributes['aria-label']}
    >
      {icon && (
        <span class="rv-alert__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div class="rv-alert__content">
        {title && <div class="rv-alert__title">{title}</div>}
        {description && <div class="rv-alert__description">{description}</div>}
        {children}
      </div>
      {actions && <div class="rv-alert__actions">{actions}</div>}
    </div>
  ) as T;
}

export function Alert(props: AlertProps) {
  return renderAlert(preactH, props);
}

namespace h {
  export namespace JSX {
    export type IntrinsicElements = import('preact').JSX.IntrinsicElements;
    export type Element = unknown;
  }
}
