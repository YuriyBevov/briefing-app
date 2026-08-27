<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  icon: 'check' | 'copy' | 'edit' | 'chevron-down' | 'close' | 'drag-handle' | 'history' | 'lock' | 'logout' | 'maximize' | 'message' | 'moon' | 'note' | 'send' | 'sun' | 'unlock' | 'trash'
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
