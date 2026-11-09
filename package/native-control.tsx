import { Select as SharedSelect } from './select';
import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';
import { useTitleTooltip } from './core/title-tooltip';
import { forwardRef } from 'preact/compat';
import { registerControl, renderControl } from './control-presentation';

type NativeAttributes<K extends keyof JSX.IntrinsicElements> = Omit<
  JSX.IntrinsicElements[K],
  'class' | 'className' | 'ref'
> & {
  class?:
    | JSX.IntrinsicElements[K]['class']
    | Record<string, boolean | undefined>;
  className?: JSX.IntrinsicElements[K]['className'];
};

/** Compat normalizes text onChange to input globally. Restore the native commit
 * event after VNode creation so these transparent adapters keep both contracts. */
function nativeNode(
  tag: 'input' | 'select' | 'textarea' | 'button' | 'summary',
  attributes: Record<string, any>,
  ...children: any[]
) {
  const { onChange, ...props } = attributes;
  const node = renderControl(h, tag, props, ...children);
  if (onChange && !(tag === 'button' && attributes.busy))
    Object.assign(node.props, { onChange });
  return node;
}

/** Transparent adapters preserve native event signatures and DOM refs. */
function useHintRef<T extends HTMLElement>(
  title: unknown,
  ref: import('preact').Ref<T>,
) {
  const hint = useTitleTooltip<T>(
    typeof title === 'string' ? title : undefined,
  );
  return useCallback(
    (element: T | null) => {
      hint.current = element;
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    },
    [ref],
  );
}
export const Input = registerControl(
  forwardRef<HTMLInputElement, NativeAttributes<'input'>>(
    ({ title, ...props }, ref) => {
      const hint = useHintRef<HTMLInputElement>(title, ref);
      return nativeNode('input', { ...props, ref: hint });
    },
  ),
  'input',
);
export const TextArea = registerControl(
  forwardRef<HTMLTextAreaElement, NativeAttributes<'textarea'>>(
    ({ children, title, ...props }, ref) => {
      const hint = useHintRef<HTMLTextAreaElement>(title, ref);
      return nativeNode('textarea', { ...props, ref: hint }, children);
    },
  ),
  'textarea',
);
// Unstyled interaction surfaces retain native semantics; their component owns geometry and paint.
export const ButtonControl = registerControl(
  forwardRef<
    HTMLButtonElement,
    NativeAttributes<'button'> & {
      unstyled?: boolean;
      busy?: boolean;
      rounded?: boolean;
    }
  >(({ children, title, ...props }, ref) => {
    const tooltip = useTitleTooltip<HTMLButtonElement>(
      typeof title === 'string' ? title : undefined,
    );
    const setRef = useCallback(
      (element: HTMLButtonElement | null) => {
        tooltip.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      },
      [ref],
    );
    return nativeNode(
      'button',
      {
        ...props,
        ref: setRef,
        'aria-label':
          props['aria-label'] ??
          (!children && typeof title === 'string' ? title : undefined),
      },
      children,
    );
  }),
  'button',
);
export const Summary = registerControl(
  forwardRef<HTMLElement, NativeAttributes<'summary'>>(
    ({ children, title, ...props }, ref) => {
      const hint = useHintRef<HTMLElement>(title, ref);
      return nativeNode('summary', { ...props, ref: hint }, children);
    },
  ),
  'summary',
);
export { nativeControlTag } from './control-presentation';

/** Selection uses the shared Dropdown rather than browser-native UI. */
export const Select = registerControl(SharedSelect, 'select');

export { Fieldset } from './fieldset';
