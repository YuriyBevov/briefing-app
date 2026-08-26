<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="modal" role="dialog" aria-modal="true">
    <section class="modal__panel">
      <header class="section-header modal__header">
        <h2 class="section-title">{{ title }}</h2>
        <BaseModalCloseButton @click="$emit('close')" />
      </header>

      <div class="modal__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="modal__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>
