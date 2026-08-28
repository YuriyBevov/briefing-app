<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger
} from 'reka-ui'
import type { EntityScope } from '~/composables/useProjectStore'

type BasePlacementOption = {
  value: string
  label: string
}

export type BasePlacementValue = {
  sectionId: string
  scope: EntityScope
}

const props = withDefaults(defineProps<{
  modelValue: BasePlacementValue[]
  options: BasePlacementOption[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: 'Выберите разделы',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: BasePlacementValue[]]
}>()

const open = ref(false)
const selectedSectionIds = computed(() => new Set(props.modelValue.map((item) => item.sectionId)))
const commonSectionIds = computed(() =>
  new Set(props.modelValue.filter((item) => item.scope === 'common').map((item) => item.sectionId))
)
const selectedLabels = computed(() =>
  props.options
    .filter((option) => selectedSectionIds.value.has(option.value))
    .map((option) => option.label)
)
const primarySelectedLabel = computed(() => selectedLabels.value[0] ?? props.placeholder)
const hiddenSelectedCount = computed(() => Math.max(selectedLabels.value.length - 1, 0))
const hasOptions = computed(() => props.options.length > 0)
const allSectionsSelected = computed(() =>
  hasOptions.value && props.options.every((option) => selectedSectionIds.value.has(option.value))
)
const allSelectedSectionsCommon = computed(() =>
  props.modelValue.length > 0 && props.modelValue.every((item) => item.scope === 'common')
)

const normalizePlacements = (placements: BasePlacementValue[]) => {
  const optionIds = new Set(props.options.map((option) => option.value))
  const uniquePlacements = new Map<string, BasePlacementValue>()

  placements.forEach((placement) => {
    if (!optionIds.has(placement.sectionId)) {
      return
    }

    uniquePlacements.set(placement.sectionId, placement)
  })

  return props.options
    .filter((option) => uniquePlacements.has(option.value))
    .map((option) => uniquePlacements.get(option.value) as BasePlacementValue)
}

const updatePlacements = (placements: BasePlacementValue[]) => {
  emit('update:modelValue', normalizePlacements(placements))
}

const toggleSection = (sectionId: string, checked: boolean) => {
  if (props.disabled) {
    return
  }

  if (!checked) {
    updatePlacements(props.modelValue.filter((item) => item.sectionId !== sectionId))
    return
  }

  updatePlacements([
    ...props.modelValue,
    {
      sectionId,
      scope: 'project'
    }
  ])
}

const toggleAllSections = (checked: boolean) => {
  if (props.disabled) {
    return
  }

  if (!checked) {
    updatePlacements([])
    return
  }

  updatePlacements(props.options.map((option) => ({
    sectionId: option.value,
    scope: commonSectionIds.value.has(option.value) ? 'common' : 'project'
  })))
}

const toggleCommon = (sectionId: string, checked: boolean) => {
  if (props.disabled || !selectedSectionIds.value.has(sectionId)) {
    return
  }

  updatePlacements(props.modelValue.map((placement) =>
    placement.sectionId === sectionId
      ? { ...placement, scope: checked ? 'common' : 'project' }
      : placement
  ))
}

const toggleAllCommon = (checked: boolean) => {
  if (props.disabled) {
    return
  }

  updatePlacements(props.modelValue.map((placement) => ({
    ...placement,
    scope: checked ? 'common' : 'project'
  })))
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="base-placement-select field__control"
        type="button"
        :disabled="disabled"
      >
        <span class="base-placement-select__selection">
          <span
            class="base-placement-select__value"
            :class="{ 'base-placement-select__value--placeholder': !selectedLabels.length }"
          >
            {{ primarySelectedLabel }}
          </span>
          <span v-if="hiddenSelectedCount" class="base-placement-select__badge">
            +{{ hiddenSelectedCount }}
          </span>
        </span>
        <span class="base-placement-select__icon">
          <BaseIcon name="chevron-down" />
        </span>
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="base-placement-select__content"
        position="popper"
        :side-offset="4"
        :collision-padding="16"
      >
        <div class="base-placement-select__table" role="table" aria-label="Размещение по разделам">
          <div class="base-placement-select__row base-placement-select__row--header" role="row">
            <div class="base-placement-select__cell" role="columnheader">
              <BaseCheckbox
                :checked="allSectionsSelected"
                label="Отметить все разделы"
                hide-label
                @change="toggleAllSections"
              />
            </div>
            <div class="base-placement-select__cell" role="columnheader">Раздел</div>
            <div class="base-placement-select__cell" role="columnheader">
              <BaseCheckbox
                :checked="allSelectedSectionsCommon"
                label="Отметить все общими"
                hide-label
                :disabled="!modelValue.length"
                @change="toggleAllCommon"
              />
            </div>
            <div class="base-placement-select__cell" role="columnheader">Тип</div>
          </div>

          <div
            v-for="option in options"
            :key="option.value"
            class="base-placement-select__row"
            role="row"
          >
            <div class="base-placement-select__cell" role="cell">
              <BaseCheckbox
                :checked="selectedSectionIds.has(option.value)"
                :label="`Выбрать раздел ${option.label}`"
                hide-label
                @change="(checked) => toggleSection(option.value, checked)"
              />
            </div>
            <div class="base-placement-select__cell base-placement-select__cell--section" role="cell">
              {{ option.label }}
            </div>
            <div class="base-placement-select__cell" role="cell">
              <BaseTooltip text="Сделать общим для всех проектов">
                <BaseCheckbox
                  :checked="commonSectionIds.has(option.value)"
                  :label="`Сделать раздел ${option.label} общим для всех проектов`"
                  hide-label
                  :disabled="!selectedSectionIds.has(option.value)"
                  @change="(checked) => toggleCommon(option.value, checked)"
                />
              </BaseTooltip>
            </div>
            <div class="base-placement-select__cell base-placement-select__cell--type" role="cell">
              {{ commonSectionIds.has(option.value) ? 'Общий' : 'Проектный' }}
            </div>
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
