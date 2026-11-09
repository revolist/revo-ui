import { createDropdownHost } from './control.view';
import { defineDropdown, destroyDropdown } from './index';
import type { DropdownOption, DropdownProps } from './dropdown.types';

/** Application-owned state for DOM consumers of the shared Dropdown. */
export interface DropdownControl<T = string> {
  readonly element: HTMLDivElement;
  value: T;
  source: DropdownOption<T>[];
  disabled: boolean;
  onChange?: (value: T) => void;
  update(props: Partial<DropdownProps<T>>): void;
  destroy(): void;
}

export function createDropdownControl<T = string>(
  document: Document,
  initial: DropdownProps<T>,
): DropdownControl<T> {
  const { element, mount, input, release } = createDropdownHost(document);
  let props = { ...initial };
  let destroyed = false;
  const draw = () => {
    if (destroyed) return;
    input.name = props.name ?? '';
    input.disabled = !!props.disabled || !props.name;
    input.value = props.value == null ? '' : String(props.value);
    defineDropdown(mount, {
      ...props,
      config: { nativeTabNavigation: true, ...props.config },
      name: undefined,
      className: `rv-select ${props.className ?? ''}`,
      onChange: (next) => {
        const value = (Array.isArray(next) ? next[0] : next) as T;
        props = { ...props, value };
        draw();
        control.onChange?.(value);
      },
    });
  };
  const control: DropdownControl<T> = {
    element,
    get value() {
      return props.value as T;
    },
    set value(value) {
      props = { ...props, value };
      draw();
    },
    get source() {
      return props.source ?? [];
    },
    set source(source) {
      props = { ...props, source };
      draw();
    },
    get disabled() {
      return !!props.disabled;
    },
    set disabled(disabled) {
      props = { ...props, disabled };
      draw();
    },
    onChange: initial.onChange
      ? (value) => initial.onChange?.(value)
      : undefined,
    update(next) {
      if ('onChange' in next)
        control.onChange = next.onChange
          ? (value) => next.onChange?.(value)
          : undefined;
      props = { ...props, ...next };
      draw();
    },
    destroy() {
      if (!destroyed) {
        destroyed = true;
        destroyDropdown(mount);
        release();
      }
    },
  };
  draw();
  return control;
}

const renderedControls = new WeakMap<
  HTMLElement,
  {
    control: DropdownControl;
    owner: symbol;
    keys: string[];
  }
>();

/** Lifecycle boundary for Stencil/other VNode factories that cannot render Preact components. */
export function renderDropdownControl<T>(
  h: (tag: any, props: any, ...children: any[]) => T,
  props: DropdownProps,
): T {
  const owner = Symbol();
  let mountedHost: HTMLElement | undefined;
  const release = () => {
    if (!mountedHost) return;
    const mounted = renderedControls.get(mountedHost);
    // A replaced VNode can release its old ref after the next ref took ownership.
    if (mounted?.owner === owner) {
      mounted.control.destroy();
      renderedControls.delete(mountedHost);
    }
    mountedHost = undefined;
  };
  return h('span', {
    ref: (host: HTMLElement | null) => {
      if (!host) {
        release();
        return;
      }
      if (mountedHost && mountedHost !== host) release();
      mountedHost = host;
      const mounted = renderedControls.get(host);
      if (mounted) {
        mounted.owner = owner;
        // VNode props replace the previous descriptor; DOM control updates are partial.
        const removed = Object.fromEntries(
          mounted.keys.map((key) => [key, undefined]),
        );
        mounted.keys = Object.keys(props);
        mounted.control.update({ ...removed, ...props });
        if (mounted.control.element.parentElement !== host)
          host.append(mounted.control.element);
      } else {
        const control = createDropdownControl(host.ownerDocument, props);
        renderedControls.set(host, {
          control,
          owner,
          keys: Object.keys(props),
        });
        host.append(control.element);
      }
    },
  });
}
