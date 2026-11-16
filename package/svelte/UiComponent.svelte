<script lang="ts">
  import { uiComponents } from '../component-catalog';
  import Mount from './Mount.svelte';
  import type { SvelteUiProps } from '../svelte-props';

  let { component, ...props }: SvelteUiProps = $props();
  let mount: Mount;

  export function getElement(): HTMLElement | null {
    return mount?.getElement() ?? null;
  }
</script>

<Mount bind:this={mount} {component} control={uiComponents[component]} {...props} />
