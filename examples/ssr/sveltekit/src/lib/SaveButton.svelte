<script lang="ts">
  import { UiComponent } from '@revolist/ui/svelte/unstyled';
  let count = $state(0);
</script>

<UiComponent
  component="SvgButton"
  props={{
    label: `Save ${count}`,
    visibleLabel: `Save ${count}`,
    onClick: () => { count += 1; },
  }}
/>
