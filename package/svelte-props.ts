import type { SvelteModelCallbacks } from './svelte-adapter.models';
import type { Snippet } from 'svelte';
import type { ComponentChildren, VNode } from 'preact';
import type { UiComponentName, UiComponentProps } from './component-catalog';

export interface SvelteUiHandle {
  /** Adapter host, available after browser mount and null after disposal. */
  getElement(): HTMLElement | null;
}

export interface SvelteUiProps {
  component: UiComponentName;
  props?: Record<string, any>;
  children?: Snippet<[Record<string, unknown>]>;
  slots?: Record<string, Snippet<[Record<string, unknown>]>>;
  onValueChange?: (value: unknown) => void;
  onUiEvent?: (event: { name: string; args: unknown[] }) => void;
}

import type { SvelteContentKey } from './svelte-adapter';

type ContentKey = SvelteContentKey;
type KnownProps<P> = {
  [K in keyof P as string extends K
    ? never
    : number extends K
      ? never
      : K]: P[K];
};
type Content<T> = [Extract<T, VNode | readonly ComponentChildren[]>] extends [
  never,
]
  ? T
  :
      | Exclude<T, VNode | readonly ComponentChildren[]>
      | Snippet<[Record<string, unknown>]>;

type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : T;
type Args<F> = NonNullable<F> extends (...args: infer A) => unknown ? A : [];
type Scope<
  Names extends readonly string[],
  Values extends unknown[],
> = Names extends readonly [
  infer Head extends string,
  ...infer Rest extends string[],
]
  ? {
      [K in Head]: Values extends [infer Value, ...unknown[]]
        ? Value
        : undefined;
    } & Scope<Rest, Tail<Values>>
  : {};
type DropdownName =
  | 'Dropdown'
  | 'Combobox'
  | 'MultiSelect'
  | 'DropdownPopupContent';
type RenderScope<K, F, N> = N extends DropdownName
  ? K extends 'renderOption'
    ? Scope<['option', 'selected'], Tail<Args<F>>>
    : K extends 'renderValue'
      ? Scope<['option'], Tail<Args<F>>>
      : K extends 'renderPlaceholder'
        ? Scope<['placeholder'], Tail<Args<F>>>
        : K extends 'renderSelectedValue'
          ? Scope<['selectedOptions'], Tail<Args<F>>>
          : K extends 'renderNoResults'
            ? Record<string, never>
            : K extends 'renderContent'
              ? { content: Args<F>[0] }
              : { args: Args<F> }
  : N extends 'PdfViewer'
    ? K extends 'renderToolbar'
      ? Scope<['controller', 'state', 'toolbarProps'], Args<F>>
      : K extends 'renderStatus'
        ? Scope<['state'], Args<F>>
        : { args: Args<F> }
    : N extends 'Tooltip'
      ? { context: Args<F>[0] }
      : N extends 'ReorderList'
        ? Scope<['item', 'index'], Args<F>>
        : { args: Args<F> };

type DirectProps<P, N> = P extends unknown
  ? {
      [K in keyof KnownProps<P> as K extends 'ref' | 'key' | 'children'
        ? never
        : K]: K extends `render${string}`
        ? Snippet<[RenderScope<K, P[K], N>]>
        : K extends ContentKey
          ? Content<P[K]>
          : P[K];
    }
  : never;

type SlotAlias<K, N> = N extends
  | DropdownName
  | 'PdfViewer'
  | 'Tooltip'
  | 'ReorderList'
  ? K extends 'renderOption'
    ? 'option'
    : K extends 'renderValue'
      ? 'value'
      : K extends 'renderPlaceholder'
        ? 'placeholder'
        : K extends 'renderSelectedValue'
          ? 'selectedValue'
          : K extends 'renderNoResults'
            ? 'noResults'
            : K extends 'renderContent'
              ? 'content'
              : K extends 'renderToolbar'
                ? 'toolbar'
                : K extends 'renderStatus'
                  ? 'status'
                  : K extends 'renderItem'
                    ? 'item'
                    : K extends 'renderHandle'
                      ? 'handle'
                      : never
  : never;
type ContentSlots<P, N> = {
  [K in
    | Exclude<
        Extract<keyof KnownProps<P>, ContentKey>,
        SlotAlias<keyof KnownProps<P>, N>
      >
    | 'default']?: Snippet;
};
type RenderSlots<P, N> = {
  [K in keyof KnownProps<P> as SlotAlias<K, N>]?: Snippet<
    [RenderScope<K, P[K], N>]
  >;
};

type ModelCallback<N> = N extends keyof SvelteModelCallbacks
  ? SvelteModelCallbacks[N]
  : never;
type ModelProps<P, N> = P extends unknown
  ? Omit<P, Extract<ModelCallback<N>, keyof P>> &
      Partial<Pick<P, Extract<ModelCallback<N>, keyof P>>>
  : never;

type ChildrenProps<P> = 'children' extends keyof P
  ? {} extends Pick<P, 'children'>
    ? { children?: Snippet }
    : { children: Snippet }
  : { children?: Snippet };

/** Named adapters retain the shared control's required props and callback types. */
export type SvelteComponentProps<N extends UiComponentName> = ModelProps<
  DirectProps<UiComponentProps<N>, N>,
  N
> &
  ChildrenProps<KnownProps<UiComponentProps<N>>> & {
    slots?: ContentSlots<UiComponentProps<N>, N> &
      RenderSlots<UiComponentProps<N>, N>;
    onUiEvent?: SvelteUiProps['onUiEvent'];
  };

/** Shared named-component signature; preserves each control's bindable keys. */
export type SvelteNamedComponent<
  N extends UiComponentName,
  Bindings extends keyof SvelteComponentProps<N> | '' = '',
> = import('svelte').Component<
  SvelteComponentProps<N>,
  SvelteUiHandle,
  Bindings
>;
