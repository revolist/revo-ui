<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import {
    createFrameworkMount,
    withFrameworkContent,
    type UiContentTarget,
    type UiFrameworkMount,
  } from '../framework-mount';
  import { withSvelteContent } from '../svelte-adapter';
  import { componentModels } from '../component-metadata';
  import type { ComponentType } from 'preact';
  import type { UiComponentName } from '../component-catalog';
  import type { SvelteUiProps } from '../svelte-props';

  type MountProps = Omit<SvelteUiProps, 'component' | 'slots'> & {
    component: UiComponentName;
    control: ComponentType<any>;
    direct?: boolean;
    slots?: Record<string, Snippet<[any]>>;
  };

  let {
    component,
    control,
    direct = false,
    props = {},
    children,
    slots = {},
    onValueChange,
    onUiEvent,
  }: MountProps = $props();
  type Content = Snippet<[any]>;
  let host: HTMLSpanElement | undefined;
  let targets = $state.raw<UiContentTarget<Content>[]>([]);
  let mount = $state.raw<UiFrameworkMount<Content>>();
  onMount(() => {
    if (!host) return;
    const current = createFrameworkMount<Content>(host, (next) => {
      targets = next;
    });
    mount = current;
    return () => {
      current.destroy();
      host = undefined;
    };
  });
  $effect(() => {
    const next = { ...props };
    const name = component;
    const contents = { ...slots, ...(children ? { default: children } : {}) };
    const change = onValueChange;
    const event = onUiEvent;
    const renderer = mount;
    const model = componentModels[name];
    const callbacks = new Set([
      ...Object.keys(next).filter((key) => /^on[A-Z]/.test(key)),
      'onClose',
      ...(model ? [model.callback] : []),
    ]);
    for (const key of callbacks) {
      const original = next[key];
      next[key] = (...args: unknown[]) => {
        const result = original?.(...args);
        if (key === model?.callback) change?.(args[0]);
        event?.({ name: key, args });
        return result;
      };
    }
    untrack(() =>
      renderer?.render(control, next, (props, content) =>
        direct
          ? withSvelteContent(name, props, contents, content)
          : withFrameworkContent(name, props, contents, content),
      ),
    );
  });
  export function getElement(): HTMLElement | null {
    return host ?? null;
  }

  function portal(node: HTMLElement, target: HTMLElement) {
    target.appendChild(node);
    return {
      update(next: HTMLElement) {
        next.appendChild(node);
      },
    };
  }
</script>

<span bind:this={host} style="display: contents" data-rv-svelte-host={component}
></span>
{#each targets as target (target.id)}
  <span
    use:portal={target.element}
    style="display: contents"
    data-rv-svelte-content
  >
    {@render target.content(target.scope)}
  </span>
{/each}
