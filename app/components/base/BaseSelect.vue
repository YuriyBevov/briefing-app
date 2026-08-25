<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport
} from 'reka-ui'

type BaseSelectOption = {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: BaseSelectOption[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: 'Выберите значение',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
const selectedLabel = computed(() =>
  props.options.find((option) => option.value === props.modelValue)?.label ?? ''
)
</script>

<template>
  <SelectRoot v-model="selectedValue" :disabled="disabled">
    <SelectTrigger class="base-select field__control" :disabled="disabled">
      <span
        class="base-select__value"
        :class="{ 'base-select__value--placeholder': !selectedLabel }"
      >
        {{ selectedLabel || placeholder }}
      </span>
      <SelectIcon class="base-select__icon">
        <BaseIcon name="chevron-down" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="base-select__content"
        position="popper"
        :body-lock="false"
        :side-offset="4"
        :collision-padding="16"
      >
        <SelectViewport class="base-select__viewport">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            class="base-select__item"
            :value="option.value"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="base-select__indicator">
              <BaseIcon class="base-select__check" name="check" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
