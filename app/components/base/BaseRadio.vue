<script setup lang="ts">
type BaseChoiceTone = 'default' | 'success' | 'danger'

const props = withDefaults(defineProps<{
  modelValue?: string
  value: string
  label: string
  name?: string
  tone?: BaseChoiceTone
  disabled?: boolean
  required?: boolean
  hideLabel?: boolean
}>(), {
  modelValue: '',
  name: undefined,
  tone: 'default',
  disabled: false,
  required: false,
  hideLabel: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const isChecked = computed(() => props.modelValue === props.value)

const updateValue = () => {
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<template>
  <label class="radio" :class="tone !== 'default' ? `radio--${tone}` : undefined">
    <input
      class="radio__control"
      type="radio"
      :aria-label="hideLabel ? label : undefined"
      :checked="isChecked"
      :disabled="disabled"
      :name="name"
      :required="required"
      :value="value"
      @change="updateValue"
    />
    <span class="radio__box" aria-hidden="true" />
    <span v-if="!hideLabel" class="radio__label">{{ label }}</span>
  </label>
</template>
