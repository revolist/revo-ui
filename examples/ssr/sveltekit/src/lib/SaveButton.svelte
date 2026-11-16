<script lang="ts">
  import { SvgButton } from '@revolist/ui/svelte/svg-button/unstyled';
  let count = $state(0);
</script>

<SvgButton
  label={`Save ${count}`}
  visibleLabel={`Save ${count}`}
  onClick={() => { count += 1; }}
/>
