<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  size?: 'default' | 'wide'
}>(), {
  size: 'default'
})

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="modal" role="dialog" aria-modal="true">
      <section class="modal__panel" :class="{ 'modal__panel--wide': size === 'wide' }">
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
  </Teleport>
</template>
