<script setup lang="ts">
import type { BaseIconName } from './BaseIcon.vue'

const props = withDefaults(defineProps<{
  label: string
  icon: BaseIconName
  tone?: 'secondary' | 'danger'
}>(), {
  tone: undefined
})

defineEmits<{
  click: []
}>()

const buttonClasses = computed(() => ({
  'button--danger': props.tone === 'danger' || props.icon === 'trash' || props.icon === 'lock',
  'button--secondary': props.tone !== 'danger' && props.icon !== 'trash' && props.icon !== 'lock'
}))
</script>

<template>
  <button
    class="button button--small base-icon-button"
    :class="buttonClasses"
    type="button"
    :aria-label="label"
    :title="label"
    @click="$emit('click')"
  >
    <BaseIcon class="base-icon-button__icon" :name="icon" />
  </button>
</template>
