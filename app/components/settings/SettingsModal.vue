<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="settings-modal" role="dialog" aria-modal="true">
    <div class="settings-modal__panel">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <BaseModalCloseButton @click="$emit('close')" />
      </div>

      <slot />
    </div>
  </div>
</template>
