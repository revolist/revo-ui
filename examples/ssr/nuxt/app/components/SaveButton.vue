<script setup lang="ts">
import { ref } from "vue";
import { SvgButton } from "@revolist/ui/vue/unstyled";

const count = ref(0);
</script>

<template>
  <SvgButton
    :label="`Save ${count}`"
    :visible-label="`Save ${count}`"
    @click="count++"
  />
</template>
