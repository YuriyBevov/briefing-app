<script setup lang="ts">
defineProps<{
  title: string
  createLabel?: string
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
    class="workspace-panel settings-section"
    :class="{
      'settings-section--collapsed': collapsed || toggleDisabled,
      'settings-section--toggle-disabled': toggleDisabled
    }"
  >
    <div class="settings-section__header">
      <button
        class="settings-section__drag"
        type="button"
        aria-label="Перетащить блок"
        title="Перетащить блок"
      >
        <BaseIcon class="settings-section__drag-icon" name="drag-handle" />
      </button>
      <h2 class="section-title">{{ title }}</h2>
      <div class="button-row settings-section__actions">
        <button v-if="createLabel" class="button button--secondary" type="button" @click="$emit('create')">
          {{ createLabel }}
        </button>
        <slot name="actions" />
        <BaseDisclosureToggle
          class="settings-section__toggle"
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
