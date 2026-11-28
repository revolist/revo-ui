<script lang="ts">
  import {
    CalendarNavigator,
    CalendarPicker,
    UiComponent,
  } from '@revolist/ui/svelte';
  let value = $state('a');
  let workflow = $state([
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
  ]);
  let search = $state('');
  let open = $state(false);
  let mounted = $state(true);
  let showPicker = $state(false);
</script>

<section aria-label="Svelte adapters">
  <button onclick={() => (mounted = !mounted)}>Toggle Svelte</button>
  <output data-svelte-value>{value}</output>
  <button onclick={() => (showPicker = !showPicker)}>Show Svelte picker</button>
  {#if showPicker}
    {#snippet pickerDay(scope: { date: string })}<span
        data-svelte-picker-day={scope.date}
      >
        {scope.date.slice(-2)}
      </span>{/snippet}
    <CalendarPicker
      mode="single"
      selected="2026-10-15"
      slots={{ day: pickerDay }}
    />
  {/if}
  {#snippet calendarDay(scope: Record<string, any>)}<span
      data-svelte-navigator-day={scope.date}
    >
      {scope.date}
    </span>{/snippet}
  {#snippet calendarFooter()}<span data-svelte-navigator-footer>
      Svelte footer
    </span>{/snippet}
  <CalendarNavigator
    value="2026-10-10"
    today="2026-10-10"
    labels={{ calendar: 'Open Svelte navigator' }}
    slots={{ calendarDay, calendarFooter }}
  />
  <button onclick={() => (workflow = [...workflow].reverse())}>
    Reorder Svelte steps
  </button>
  {#snippet stepIcon(scope: Record<string, any>)}<b
      data-svelte-step-icon={scope.step.id}
    >
      {scope.step.label}
    </b>{/snippet}
  {#snippet stepContent(scope: Record<string, any>)}<input
      aria-label={`Svelte ${scope.step.id} step draft`}
    />{/snippet}
  <UiComponent
    component="Stepper"
    props={{ label: 'Svelte workflow', steps: workflow, value: 'a' }}
    slots={{ stepIcon, stepContent }}
  />
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
    {#snippet option(scope: Record<string, any>)}<strong data-svelte-option>
        {scope.option.label}
      </strong>{/snippet}
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
    {#snippet footer()}<button onclick={() => (open = false)}>
        Done Svelte
      </button>{/snippet}
  {/if}
  <button onclick={() => (open = true)}>Open Svelte editor</button>
</section>
