<script lang="ts">
  import SaveButton from '../lib/SaveButton.svelte';
  let { data } = $props();
</script>

<main>
  <h1>{data.title}</h1>
  <p>This title comes from a server load function.</p>
  <SaveButton />
</main>
