<script setup lang="ts">
export type BaseColorPickerOption = {
  value: string
  label: string
  preview?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: BaseColorPickerOption[]
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const pickerClasses = computed(() => ({
  'color-picker--vertical': props.orientation === 'vertical'
}))
</script>

<template>
  <div class="color-picker" :class="pickerClasses">
    <button
      v-for="option in options"
      :key="option.value || 'default'"
      class="color-picker__item"
      :class="{ 'color-picker__item--active': modelValue === option.value }"
      type="button"
      :style="option.preview || option.value ? { background: option.preview || option.value } : undefined"
      :aria-label="option.label"
      :title="option.label"
      @click="emit('update:modelValue', option.value)"
    />
  </div>
</template>
