<script setup lang="ts">
import { ref } from 'vue';
import { SvgButton } from '@revolist/ui/vue/unstyled';

const count = ref(0);
</script>

<template>
  <main>
    <h1>Nuxt report</h1>
    <p>This page content is rendered on the server.</p>
    <SvgButton
      :label="`Save ${count}`"
      :visible-label="`Save ${count}`"
      @click="count++"
    />
  </main>
</template>
