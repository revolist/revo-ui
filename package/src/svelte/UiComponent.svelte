<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import {
    uiComponents,
    componentModels,
    createFrameworkMount,
    withFrameworkContent,
    type UiContentTarget,
    type UiFrameworkMount,
  } from '../framework';
  import type { SvelteUiProps } from '../svelte-props';

  let {
    component,
    props = {},
    children,
    slots = {},
    onValueChange,
    onUiEvent,
  }: SvelteUiProps = $props();
  type Content = Snippet<[Record<string, unknown>]>;
  let host: HTMLSpanElement;
  let targets = $state.raw<UiContentTarget<Content>[]>([]);
  let mount = $state.raw<UiFrameworkMount<Content>>();
  onMount(() => {
    const current = createFrameworkMount<Content>(host, (next) => {
      targets = next;
    });
    mount = current;
    return () => {
      current.destroy();
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
      renderer?.render(uiComponents[name], next, (props, content) =>
        withFrameworkContent(name, props, contents, content),
      ),
    );
  });
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
