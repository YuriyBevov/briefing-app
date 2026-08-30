<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  size?: 'default' | 'wide' | 'screen'
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
      <section
        class="modal__panel"
        :class="{
          'modal__panel--wide': size === 'wide',
          'modal__panel--screen': size === 'screen'
        }"
      >
        <header class="section-header modal__header">
          <h2 class="section-title">{{ title }}</h2>
          <div class="modal__header-actions">
            <slot name="header-actions" />
            <BaseModalCloseButton @click="$emit('close')" />
          </div>
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
