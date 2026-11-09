import { TooltipController } from './core/popover-controller';
import { h } from 'preact';
import { createPreactElement } from './preact-mount';
import {
  controlAttributes,
  type ControlTag,
  type ControlAttributes,
} from './control-attributes';
export * from './control-attributes';
export function renderControl<H extends (...args: any[]) => any>(
  h: H,
  tag: ControlTag,
  attributes?: ControlAttributes | null,
  ...children: any[]
): ReturnType<H> {
  const props = attributes ?? {};
  if (tag === 'button' && props.busy === true) {
    const content = children.length ? children : [props.children];
    return h(
      tag,
      controlAttributes(tag, props),
      h('span', { class: 'rv-button-spinner', 'aria-hidden': 'true' }),
      ...content,
    );
  }
  return h(tag, controlAttributes(tag, props), ...children);
}
export function createControl<K extends ControlTag>(
  document: Document,
  tag: K,
  attributes: ControlAttributes = {},
): HTMLElementTagNameMap[K] {
  const view = renderControl(h, tag, attributes);
  if (attributes.onChange && !(tag === 'button' && attributes.busy))
    Object.assign(view.props, { onChange: attributes.onChange });
  return createPreactElement<HTMLElementTagNameMap[K]>(document, view);
}
const controlTags = new WeakMap<object, ControlTag>();
export function registerControl<T extends object>(
  component: T,
  tag: ControlTag,
): T {
  controlTags.set(component, tag);
  return component;
}
export function nativeControlTag(type: unknown): string | undefined {
  return typeof type === 'string'
    ? type
    : type && (typeof type === 'function' || typeof type === 'object')
      ? controlTags.get(type as object)
      : undefined;
}

const iconTooltips = new WeakMap<HTMLElement, () => void>();

/** Decorate a native icon control after installing its trusted bundled SVG. */
export function decorateIconAction(element: HTMLElement, label: string): void {
  element.classList.add('rv-btn', 'rv-btn-ghost', 'rv-btn-icon');
  element.setAttribute('aria-label', label);
  iconTooltips.get(element)?.();
  element.removeAttribute('title');
  element.querySelector('.rv-control-tooltip')?.remove();
  const surface = createPreactElement<HTMLSpanElement>(
    element.ownerDocument,
    <span class="rv-control-tooltip" role="tooltip" hidden>
      {label}
    </span>,
  );
  element.append(surface);
  iconTooltips.set(
    element,
    new TooltipController().bind(element, label, { surface }),
  );
}
