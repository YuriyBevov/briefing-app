<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger
} from 'reka-ui'

type BaseMultiSelectOption = {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string[]
  options: BaseMultiSelectOption[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: 'Выберите значения',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const open = ref(false)
const selectedValueSet = computed(() => new Set(props.modelValue))
const selectedLabels = computed(() =>
  props.options
    .filter((option) => selectedValueSet.value.has(option.value))
    .map((option) => option.label)
)
const primarySelectedLabel = computed(() => selectedLabels.value[0] ?? props.placeholder)
const hiddenSelectedCount = computed(() => Math.max(selectedLabels.value.length - 1, 0))

const toggleValue = (value: string) => {
  if (props.disabled) {
    return
  }

  const nextValues = new Set(props.modelValue)

  if (nextValues.has(value)) {
    nextValues.delete(value)
  } else {
    nextValues.add(value)
  }

  emit('update:modelValue', [...nextValues])
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="base-multi-select field__control"
        type="button"
        :disabled="disabled"
      >
        <span class="base-multi-select__selection">
          <span
            class="base-multi-select__value"
            :class="{ 'base-multi-select__value--placeholder': !selectedLabels.length }"
          >
            {{ primarySelectedLabel }}
          </span>
          <span v-if="hiddenSelectedCount" class="base-multi-select__badge">
            +{{ hiddenSelectedCount }}
          </span>
        </span>
        <span class="base-multi-select__icon">
          <BaseIcon name="chevron-down" />
        </span>
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="base-multi-select__content"
        position="popper"
        :side-offset="4"
        :collision-padding="16"
      >
        <div class="base-multi-select__viewport">
          <div
            v-for="option in options"
            :key="option.value"
            class="base-multi-select__item"
          >
            <BaseCheckbox
              class="base-multi-select__checkbox"
              :checked="selectedValueSet.has(option.value)"
              :label="option.label"
              @change="() => toggleValue(option.value)"
            />
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
