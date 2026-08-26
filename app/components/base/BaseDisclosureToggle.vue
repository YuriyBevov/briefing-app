<script setup lang="ts">
withDefaults(defineProps<{
  expanded?: boolean
  disabled?: boolean
  label?: string
}>(), {
  expanded: false,
  disabled: false,
  label: 'Развернуть блок'
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="button button--secondary button--small disclosure-toggle"
    :class="{ 'disclosure-toggle--expanded': expanded }"
    type="button"
    :disabled="disabled"
    :aria-expanded="expanded"
    :aria-label="label"
    :title="label"
    @click="$emit('click', $event)"
  >
    <BaseIcon class="disclosure-toggle__icon" name="chevron-down" />
  </button>
</template>
