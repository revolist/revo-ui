/** @jsxRuntime classic */
/** @jsx h */
import type { ClassPreset } from './presets/types';
import { h as preactH, type ComponentChildren, type JSX } from 'preact';

export type AlertPreset = ClassPreset & { props?: { tone?: 'neutral' | 'warning' | 'danger' | 'success' } };

export type AlertProps = Omit<JSX.IntrinsicElements['div'], 'title'> & {
  preset?: AlertPreset;
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
    preset,
    children,
    tone: toneProp,
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
  const tone = toneProp ?? preset?.props?.tone ?? 'neutral';
  const h = (tag: string, attributes: any, ...children: any[]) =>
    renderer(tag, attributes, children);
  return (
    <div
      {...attributes}
      class={`rv-alert rv-alert--${tone}${icon ? ' rv-alert--with-icon' : ''}${actions ? ' rv-alert--with-actions' : ''} ${preset?.className ?? ''} ${className} ${htmlClass}`.trim()}
      data-part="root"
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-label={label ?? attributes['aria-label']}
    >
      {icon && (
        <span class="rv-alert__icon" data-part="icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div class="rv-alert__content" data-part="content">
        {title && <div class="rv-alert__title" data-part="title">{title}</div>}
        {description && <div class="rv-alert__description" data-part="description">{description}</div>}
        {children}
      </div>
      {actions && <div class="rv-alert__actions" data-part="actions">{actions}</div>}
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
