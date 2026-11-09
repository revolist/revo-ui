import { h, render, type ComponentType, type VNode } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { componentRenderSlots } from './component-metadata';

export interface UiContentTarget<T> {
  id: number;
  element: HTMLElement;
  content: T;
  scope: Record<string, unknown>;
}
export interface UiFrameworkMount<T> {
  render(
    component: ComponentType<any>,
    props: Record<string, any>,
    transform?: (
      props: Record<string, any>,
      content: (value: T, scope?: Record<string, unknown>) => VNode<any>,
    ) => Record<string, any>,
  ): void;
  destroy(): void;
}

/** Preact owns controls; the host framework owns content inside published targets. */
export function createFrameworkMount<T>(
  host: HTMLElement,
  publish: (targets: UiContentTarget<T>[]) => void,
): UiFrameworkMount<T> {
  const targets = new Map<HTMLElement, UiContentTarget<T>>();
  let disposed = false;
  let nextId = 0;
  function Content({
    content,
    scope,
  }: {
    content: T;
    scope: Record<string, unknown>;
  }) {
    const ref = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
      const element = ref.current;
      if (!element || disposed) return;
      const id = targets.get(element)?.id ?? nextId++;
      targets.set(element, { id, element, content, scope });
      publish([...targets.values()]);
    }, [content, scope]);
    useLayoutEffect(() => {
      const element = ref.current;
      return () => {
        if (element) targets.delete(element);
        if (!disposed) publish([...targets.values()]);
      };
    }, []);
    return h('span', {
      ref,
      style: { display: 'contents' },
      'data-rv-framework-content': '',
    });
  }
  const content = (value: T, scope: Record<string, unknown> = {}) =>
    h(Content, { content: value, scope });
  return {
    render(component, props, transform) {
      if (disposed) throw new Error('Cannot update a destroyed UI mount');
      render(h(component, transform ? transform(props, content) : props), host);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      render(null, host);
      targets.clear();
    },
  };
}

/** Build slot props without giving framework VNodes or templates to Preact. */
export function withFrameworkContent<T>(
  name: string,
  props: Record<string, any>,
  slots: Record<string, T>,
  content: (value: T, scope?: Record<string, unknown>) => VNode<any>,
): Record<string, any> {
  const result = { ...props };
  const mappings = componentRenderSlots(name);
  for (const [key, value] of Object.entries(slots)) {
    if (value == null) continue;
    const mapping = mappings[key];
    if (mapping) {
      result[mapping.prop] = (...args: unknown[]) => {
        if (mapping.skipFactory) args = args.slice(1);
        return content(
          value,
          Object.fromEntries(
            mapping.args.map((key, index) => [key, args[index]]),
          ),
        );
      };
    } else result[key === 'default' ? 'children' : key] = content(value);
  }
  return result;
}
