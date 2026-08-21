<script setup lang="ts">
defineProps<{
  checked: boolean
  label: string
  tone: 'success' | 'danger'
}>()

defineEmits<{
  (event: 'change'): void
}>()
</script>

<template>
  <label class="checklist-status" :class="`checklist-status--${tone}`">
    <input
      class="checklist-status__control"
      type="checkbox"
      :aria-label="label"
      :checked="checked"
      @change="$emit('change')"
    />
    <span class="checklist-status__box" aria-hidden="true" />
  </label>
</template>
