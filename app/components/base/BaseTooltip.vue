<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="tooltip-wrapper">
    <slot />
    <div class="tooltip-wrapper__content" role="tooltip">{{ text }}</div>
  </div>
</template>
