<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <span class="tooltip">
    <slot />
    <span class="tooltip__content" role="tooltip">{{ text }}</span>
  </span>
</template>
