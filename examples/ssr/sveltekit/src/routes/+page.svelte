<script lang="ts">
  import { SvgButton } from '@revolist/ui/svelte/svg-button/unstyled';
  let { data } = $props();
  let count = $state(0);
</script>

<main>
  <h1>{data.title}</h1>
  <p>This title comes from a server load function.</p>
  <SvgButton
    label={`Save ${count}`}
    visibleLabel={`Save ${count}`}
    onClick={() => { count += 1; }}
  />
</main>
