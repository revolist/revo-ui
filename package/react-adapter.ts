import {
  ensureComponentStyles,
  type ComponentStyles,
} from './core/component-styles';
import {
  createElement,
  forwardRef,
  isValidElement,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  ComponentChildren,
  ComponentProps,
  ComponentType,
  VNode,
} from 'preact';
import {
  createFrameworkMount,
  type UiContentTarget,
  type UiFrameworkMount,
} from './framework-mount';

export interface UiReactHandle {
  element: HTMLDivElement | null;
}
const contentProps = [
  'children',
  'footer',
  'label',
  'description',
  'icon',
  'summary',
  'start',
  'end',
  'empty',
  'highlight',
  'actions',
  'heading',
  'placeholder',
  'indicator',
  'avatar',
  'timestamp',
  'header',
  'details',
  'formatted',
  'hint',
  'iconContent',
  'content',
  'loadingContent',
  'errorContent',
  'caption',
  'count',
  'detail',
  'leading',
  'trailing',
  'shortcut',
  'info',
] as const;
type ContentKey = (typeof contentProps)[number];
// A content-named prop may also be a scalar or action-options object. Preserve
// those contracts instead of turning e.g. FieldList.empty into arbitrary JSX.
type ReactContent<T> = [
  Extract<T, VNode<any> | readonly ComponentChildren[]>,
] extends [never]
  ? T
  : ReactNode;
type Tail<A extends unknown[]> = A extends [unknown, ...infer Rest] ? Rest : A;
type RenderArgs<A extends unknown[], K, Factories> = K extends Factories
  ? K extends 'renderPlaceholder' | 'renderSelectedValue'
    ? Tail<A> extends [infer Value, ...unknown[]]
      ? [value: Value]
      : []
    : Tail<A>
  : A;
type RenderProp<F, K, Factories> =
  NonNullable<F> extends (...args: infer A) => unknown
    ? (...args: RenderArgs<A, K, Factories>) => ReactNode
    : F;
export type ReactUiProps<P, Factories extends string = never> = {
  [K in keyof Omit<P, ContentKey | 'ref' | 'key'>]: K extends `render${string}`
    ? RenderProp<P[K], K, Factories>
    : P[K];
} & { [K in Extract<keyof P, ContentKey>]?: ReactContent<P[K]> };
export type ReactUiComponent<
  C extends ComponentType<any>,
  Factories extends string = never,
> = ForwardRefExoticComponent<
  PropsWithoutRef<ReactUiProps<ComponentProps<C>, Factories>> &
    RefAttributes<UiReactHandle>
>;

export function createReactAdapter<
  C extends ComponentType<any>,
  const F extends readonly string[] = [],
>(
  component: C,
  name: string,
  options: { factoryCallbacks?: F; styles?: readonly ComponentStyles[] } = {},
): ReactUiComponent<C, F[number]> {
  const Adapter = forwardRef<
    UiReactHandle,
    ReactUiProps<ComponentProps<C>, F[number]>
  >((props, ref) => {
    const host = useRef<HTMLDivElement>(null);
    const mount = useRef<UiFrameworkMount<ReactNode> | null>(null);
    const [targets, setTargets] = useState<UiContentTarget<ReactNode>[]>([]);
    useImperativeHandle(ref, () => ({ element: host.current }), []);
    useLayoutEffect(() => {
      if (options.styles) ensureComponentStyles(host.current!, options.styles);
      setTargets([]);
      mount.current = createFrameworkMount(host.current!, setTargets);
      return () => {
        mount.current?.destroy();
        mount.current = null;
      };
    }, []);
    useLayoutEffect(() => {
      mount.current?.render(component, props, (original, content) => {
        const contentKeys = new Set<string>([
          ...contentProps,
          'options',
          'source',
        ]);
        const convert = (value: any): any => {
          if (isValidElement(value)) return content(value);
          if (Array.isArray(value)) {
            const converted = value.map(convert);
            return converted.some((item, index) => item !== value[index])
              ? converted
              : value;
          }
          if (value && Object.getPrototypeOf(value) === Object.prototype) {
            const converted = { ...value };
            let changed = false;
            for (const key of Object.keys(value)) {
              if (!contentKeys.has(key)) continue;
              converted[key] = convert(value[key]);
              changed ||= converted[key] !== value[key];
            }
            return changed ? converted : value;
          }
          return value;
        };
        // Keep application data/context identities intact, especially remote sources.
        const result = { ...original };
        for (const key of Object.keys(original))
          if (contentKeys.has(key)) result[key] = convert(original[key]);
        for (const [key, value] of Object.entries(original)) {
          if (!key.startsWith('render') || typeof value !== 'function')
            continue;
          result[key] = (...args: unknown[]) => {
            if (options.factoryCallbacks?.includes(key)) {
              args = args.slice(1);
              // Built-in arrow/tag VNodes belong to Preact and cannot enter React.
              if (key === 'renderPlaceholder' || key === 'renderSelectedValue')
                args = args.slice(0, 1);
            }
            return content(value(...args));
          };
        }
        return result;
      });
    }, [props]);
    return createElement(
      'div',
      { style: { display: 'contents' } },
      createElement('div', {
        ref: host,
        style: { display: 'contents' },
        'data-rv-react-host': name,
      }),
      ...targets.map((target) =>
        createPortal(target.content, target.element, String(target.id)),
      ),
    );
  });
  Adapter.displayName = `Rv${name}`;
  return Adapter as ReactUiComponent<C, F[number]>;
}
