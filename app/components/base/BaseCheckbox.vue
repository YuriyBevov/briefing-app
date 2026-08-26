<script setup lang="ts">
type BaseChoiceTone = 'default' | 'success' | 'danger'

const props = withDefaults(defineProps<{
  modelValue?: boolean | string[]
  checked?: boolean
  value?: string
  label: string
  tone?: BaseChoiceTone
  disabled?: boolean
  required?: boolean
  hideLabel?: boolean
}>(), {
  modelValue: undefined,
  checked: undefined,
  value: undefined,
  tone: 'default',
  disabled: false,
  required: false,
  hideLabel: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
  change: [checked: boolean]
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return Boolean(props.value && props.modelValue.includes(props.value))
  }

  if (typeof props.modelValue === 'boolean') {
    return props.modelValue
  }

  return Boolean(props.checked)
})

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue)) {
    const nextValues = new Set(props.modelValue)

    if (target.checked && props.value) {
      nextValues.add(props.value)
    } else if (props.value) {
      nextValues.delete(props.value)
    }

    emit('update:modelValue', [...nextValues])
    emit('change', target.checked)
    return
  }

  emit('update:modelValue', target.checked)
  emit('change', target.checked)
}
</script>

<template>
  <label class="checkbox" :class="tone !== 'default' ? `checkbox--${tone}` : undefined">
    <input
      class="checkbox__control"
      type="checkbox"
      :aria-label="hideLabel ? label : undefined"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :value="value"
      @change="updateValue"
    />
    <span class="checkbox__box" aria-hidden="true" />
    <span v-if="!hideLabel" class="checkbox__label">{{ label }}</span>
  </label>
</template>
