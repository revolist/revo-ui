import {
  h as preactH,
  render,
  type ComponentProps,
  type ComponentType,
} from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onUpdated,
  watchPostEffect,
  shallowRef,
  Teleport,
  type DefineComponent,
  type Slot,
} from 'vue';

export interface VueAdapterOptions {
  /** Maps Vue's default v-model to the existing controlled component contract. */
  model?: { prop: string; callback: string };
  /** Maps scoped Vue slots to Preact render callbacks. */
  renderSlots?: Record<
    string,
    { prop: string; args: readonly string[]; skipFactory?: boolean }
  >;
}

type ModelKeys<O> = O extends { model: { prop: infer K; callback: infer C } }
  ? K | C
  : never;
type ModelValue<P, O> = O extends { model: { prop: infer K } }
  ? K extends keyof P
    ? P[K]
    : unknown
  : never;
export type VueUiProps<
  P,
  O extends VueAdapterOptions = VueAdapterOptions,
> = Omit<P, 'children' | 'ref' | 'key' | Extract<ModelKeys<O>, keyof P>> &
  Partial<Pick<P, Extract<ModelKeys<O>, keyof P>>> &
  (O extends { model: object }
    ? {
        modelValue?: ModelValue<P, O>;
        'onUpdate:modelValue'?: (value: ModelValue<P, O>) => void;
      }
    : {});

export type VueUiComponent<
  C extends ComponentType<any>,
  O extends VueAdapterOptions = {},
> = DefineComponent<VueUiProps<ComponentProps<C>, O>>;

/** Vue owns slot trees through Teleport. Preact only owns their host elements. */
export function createVueAdapter<
  P extends object,
  const O extends VueAdapterOptions = {},
>(
  component: ComponentType<P>,
  name: string,
  options: O = {} as O,
): DefineComponent<VueUiProps<P, O>> {
  return defineComponent({
    name: `Rv${name}`,
    inheritAttrs: false,
    setup(_props, { attrs, slots, expose }) {
      const host = shallowRef<HTMLElement | null>(null);
      type Target = {
        element: HTMLElement;
        slot: Slot;
        scope: Record<string, unknown>;
        id: number;
      };
      const active = new Map<HTMLElement, Target>();
      const targets = shallowRef<Target[]>([]);
      let disposed = false;
      let nextId = 0;
      let synchronizedSlots = new Map<string, Slot>();
      const slotEntries = () =>
        Object.entries(slots).filter(
          (entry): entry is [string, Slot] => typeof entry[1] === 'function',
        );
      function SlotHost({
        slot,
        scope,
      }: {
        slot: Slot;
        scope: Record<string, unknown>;
      }) {
        const element = useRef<HTMLElement>(null);
        useLayoutEffect(() => {
          if (!element.current || disposed) return;
          const node = element.current;
          const id = active.get(node)?.id ?? nextId++;
          active.set(node, { element: node, slot, scope, id });
          targets.value = [...active.values()];
        }, [slot, scope]);
        // Scope changes update the existing Teleport; only removal of its host
        // disposes the slot tree and releases the stable target identity.
        useLayoutEffect(() => {
          const node = element.current;
          return () => {
            if (node) active.delete(node);
            if (!disposed) targets.value = [...active.values()];
          };
        }, []);
        return preactH('span', {
          ref: element,
          style: { display: 'contents' },
          'data-rv-vue-slot': '',
        });
      }
      function update() {
        if (!host.value || disposed) return;
        const props: Record<string, any> = {};
        for (const [key, value] of Object.entries(attrs)) {
          if (key === 'modelValue' || key === 'onUpdate:modelValue') continue;
          // Vue leaves undeclared template attributes kebab-cased.
          const normalized = /^(aria-|data-)/.test(key)
            ? key
            : key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          const boolean = [
            'disabled',
            'readOnly',
            'required',
            'busy',
            'open',
            'checked',
            'indeterminate',
            'pressed',
            'active',
            'pending',
            'draggable',
            'multiple',
          ].includes(normalized);
          props[normalized === 'class' ? 'className' : normalized] =
            boolean && value === '' ? true : value;
        }
        if (
          options.model &&
          ('modelValue' in attrs || 'onUpdate:modelValue' in attrs)
        ) {
          const { prop, callback } = options.model;
          if ('modelValue' in attrs) props[prop] = attrs.modelValue;
          const original = props[callback];
          props[callback] = (value: unknown, ...rest: unknown[]) => {
            original?.(value, ...rest);
            const handlers = attrs['onUpdate:modelValue'];
            for (const handler of Array.isArray(handlers)
              ? handlers
              : [handlers]) {
              if (typeof handler === 'function') handler(value);
            }
          };
        }
        const currentSlots = slotEntries();
        synchronizedSlots = new Map(currentSlots);
        for (const [slotName, slot] of currentSlots) {
          if (!slot) continue;
          const mapping = options.renderSlots?.[slotName];
          if (mapping) {
            props[mapping.prop] = (...args: unknown[]) => {
              if (mapping.skipFactory) args = args.slice(1);
              const scope = Object.fromEntries(
                mapping.args.map((key, index) => [key, args[index]]),
              );
              return preactH(SlotHost, { slot, scope });
            };
          } else {
            props[slotName === 'default' ? 'children' : slotName] = preactH(
              SlotHost,
              { slot, scope: {} },
            );
          }
        }
        render(preactH(component, props as P), host.value);
      }
      watchPostEffect(update);
      // Vue's slots object is not reactive. Parent slot-only updates still run
      // this lifecycle hook; bridge them without reacting to our own Teleport
      // target updates, which would otherwise cause a render loop.
      onUpdated(() => {
        const currentSlots = slotEntries();
        if (
          currentSlots.length !== synchronizedSlots.size ||
          currentSlots.some(
            ([name, slot]) => synchronizedSlots.get(name) !== slot,
          )
        )
          update();
      });
      onBeforeUnmount(() => {
        disposed = true;
        if (host.value) render(null, host.value);
        active.clear();
      });
      expose({ element: host });
      // The host is client-rendered; server output is an empty mount boundary.
      return () => [
        h('div', {
          ref: host,
          style: { display: 'contents' },
          'data-rv-vue-host': name,
        }),
        ...targets.value.map((target) =>
          h(
            Teleport,
            { key: target.id, to: target.element },
            target.slot(target.scope),
          ),
        ),
      ];
    },
  }) as unknown as DefineComponent<VueUiProps<P, O>>;
}
