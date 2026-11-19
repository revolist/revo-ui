<script lang="ts">
  import { SvgButton, SearchInput, Dropdown, Dialog, DatePicker, DateRangePicker } from '../../../../dist/svelte-source.js';
  let count = $state(0);
  let query = $state('');
  let selected = $state('a');
  let open = $state(false);
  let mounted = $state(true);
  const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];
</script>

<section aria-label="Svelte named components">
  <button onclick={() => mounted = !mounted}>Toggle controls</button>
  <output data-query>{query}</output>
  <output data-selected>{selected}</output>
  {#if mounted}
    <SvgButton label={`Save ${count}`} visibleLabel={`Save ${count}`} onClick={() => count += 1} />
    <SearchInput bind:value={query} aria-label="Svelte search" />
    <button onclick={() => query = ''}>Clear search</button>
    <Dropdown source={options} bind:value={selected} config={{ ariaLabel: 'Svelte status' }} slots={{ option }} />
    {#snippet option(scope: Record<string, any>)}<strong>{scope.option.label}</strong>{/snippet}
    <Dialog {open} title="Svelte editor" closeLabel="Close" onClose={() => open = false} slots={{ footer }}>
      <input aria-label="Svelte draft" />
      <button onclick={() => count += 1}>Update counter</button>
    </Dialog>
    {#snippet footer()}<button onclick={() => open = false}>Done</button>{/snippet}
    <button onclick={() => open = true}>Open editor</button>
  {/if}
</section>

<form aria-label="Svelte date defaults">
  <DatePicker label="Svelte date" openLabel="Choose Svelte date" name="date" defaultValue="2024-03-31" clearable />
  <DateRangePicker label="Svelte range" openLabel="Choose Svelte range" fromLabel="Svelte from" toLabel="Svelte to"
    fromName="from" toName="to" defaultValue={{ from: '2024-02-29', to: '2024-03-01' }} />
</form>
