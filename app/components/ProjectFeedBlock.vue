<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  hasItems?: boolean
  emptyText?: string
  framed?: boolean
  formPosition?: 'top' | 'bottom'
}>(), {
  title: '',
  hasItems: true,
  emptyText: '',
  framed: true,
  formPosition: 'top'
})
</script>

<template>
  <section class="project-feed-block" :class="{ 'project-feed-block--framed': framed }">
    <header v-if="title" class="project-feed-block__header">
      <h2 class="project-feed-block__title">{{ title }}</h2>
    </header>

    <div v-if="$slots.form && formPosition === 'top'" class="project-feed-block__form">
      <slot name="form" />
    </div>

    <div v-if="$slots.default && hasItems" class="project-feed-block__list">
      <slot />
    </div>

    <div v-else-if="emptyText" class="project-feed-block__empty">{{ emptyText }}</div>

    <div v-if="$slots.form && formPosition === 'bottom'" class="project-feed-block__form">
      <slot name="form" />
    </div>
  </section>
</template>
