<script setup lang="ts">
import type { BaseIconName } from './BaseIcon.vue'

defineProps<{
  title: string
  createLabel?: string
  createIcon?: BaseIconName
  collapsed: boolean
  toggleDisabled?: boolean
}>()

defineEmits<{
  create: []
  toggle: []
}>()
</script>

<template>
  <section
    class="workspace-block"
    :class="{
      'workspace-block--collapsed': collapsed || toggleDisabled,
      'workspace-block--toggle-disabled': toggleDisabled
    }"
  >
    <div class="workspace-block__header">
      <button
        class="workspace-block__drag"
        type="button"
        aria-label="Перетащить блок"
        title="Перетащить блок"
      >
        <BaseIcon class="workspace-block__drag-icon" name="drag-handle" />
      </button>
      <h2 class="section-title">{{ title }}</h2>
      <div class="button-row workspace-block__actions">
        <BaseIconButton
          v-if="createLabel && createIcon"
          :label="createLabel"
          :icon="createIcon"
          @click="$emit('create')"
        />
        <button v-else-if="createLabel" class="button button--secondary" type="button" @click="$emit('create')">
          {{ createLabel }}
        </button>
        <slot name="actions" />
        <BaseDisclosureToggle
          class="workspace-block__toggle"
          :disabled="toggleDisabled"
          :expanded="!collapsed && !toggleDisabled"
          :label="collapsed || toggleDisabled ? 'Развернуть блок' : 'Свернуть блок'"
          @click="!toggleDisabled && $emit('toggle')"
        />
      </div>
    </div>

    <slot />
  </section>
</template>
