<script lang="ts">
  import { UiComponent } from '@revolist/ui/svelte';
  import { pdfProps } from './pdf-common';
  let mounted = $state(true),
    configured = $state(false),
    page = $state(0);
</script>

<section aria-label="Svelte PDF">
  <button onclick={() => (mounted = !mounted)}>Toggle Svelte PDF</button>
  <button onclick={() => (configured = !configured)}
    >Configure Svelte PDF</button
  >
  <output>{page}</output>
  {#if mounted}
    <UiComponent
      component="PdfViewer"
      props={{
        ...pdfProps(configured),
        onPageChange: (next: number) => (page = next),
      }}
      slots={{ toolbar }}
    />
    {#snippet toolbar(scope: Record<string, any>)}
      <UiComponent component="PdfViewerToolbar" props={scope.toolbarProps} />
    {/snippet}
  {/if}
</section>
