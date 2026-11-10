<script lang="ts">
  import { UiComponent } from '@revolist/ui/svelte';
  let value = $state('a');
  let search = $state('');
  let open = $state(false);
  let mounted = $state(true);
</script>

<section aria-label="Svelte adapters">
  <button onclick={() => (mounted = !mounted)}>Toggle Svelte</button>
  <output data-svelte-value>{value}</output>
  <UiComponent
    component="SearchInput"
    props={{ value: search, 'aria-label': 'Svelte search query' }}
    onValueChange={(next) => (search = next as string)}
  />
  <output data-svelte-search>{search}</output>
  <button onclick={() => (search = '')}>Clear Svelte search</button>
  {#snippet tooltipContent()}<strong>Svelte tooltip details</strong>{/snippet}
  <UiComponent component="Tooltip" slots={{ content: tooltipContent }}>
    <button>Svelte help</button>
  </UiComponent>
  {#if mounted}
    <UiComponent
      component="Dropdown"
      props={{
        source: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
        value,
        config: { ariaLabel: 'Svelte status' },
      }}
      onValueChange={(next) => (value = next as string)}
      slots={{ option }}
    />
    {#snippet option(scope: Record<string, any>)}<strong data-svelte-option
        >{scope.option.label}</strong
      >{/snippet}
    <UiComponent
      component="Dropdown"
      props={{
        value,
        config: { ariaLabel: 'Svelte secondary status' },
        source: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      }}
      onValueChange={(next) => (value = next as string)}
    />
    <UiComponent
      component="Dialog"
      props={{
        open,
        title: 'Svelte editor',
        closeLabel: 'Close',
        onClose: () => (open = false),
      }}
      slots={{ footer }}
    >
      <input aria-label="Svelte dialog name" />
    </UiComponent>
    {#snippet footer()}<button onclick={() => (open = false)}
        >Done Svelte</button
      >{/snippet}
  {/if}
  <button onclick={() => (open = true)}>Open Svelte editor</button>
</section>
