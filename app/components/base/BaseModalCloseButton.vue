<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="button button--secondary modal-close-button"
    type="button"
    aria-label="Закрыть"
    @click="$emit('click')"
  >
    <BaseIcon class="modal-close-button__icon" name="close" />
  </button>
</template>
