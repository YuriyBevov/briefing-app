<script setup lang="ts">
const props = withDefaults(defineProps<{
  author: string
  date: string
  text: string
  readonly?: boolean
  variant?: 'default' | 'history'
  actionsMode?: 'inline' | 'context'
  draggable?: boolean
  hideAuthor?: boolean
  color?: string
}>(), {
  readonly: false,
  variant: 'default',
  actionsMode: 'inline',
  draggable: false,
  hideAuthor: false,
  color: ''
})

const emit = defineEmits<{
  edit: []
  remove: []
  context: [event: MouseEvent]
}>()

const handleContextMenu = (event: MouseEvent) => {
  if (props.actionsMode !== 'context') {
    return
  }

  event.preventDefault()
  emit('context', event)
}
</script>

<template>
  <article
    class="project-feed-card"
    :class="{
      'project-feed-card--history': variant === 'history',
      'project-feed-card--context': actionsMode === 'context',
      'project-feed-card--colored': Boolean(color),
      'project-feed-card--note': hideAuthor
    }"
    :style="color ? { '--project-feed-card-background': color } : undefined"
    @contextmenu="handleContextMenu"
  >
    <header v-if="variant === 'history'" class="project-feed-card__header">
      <strong class="project-feed-card__author">{{ author }}</strong>
    </header>

    <header v-else class="project-feed-card__header">
      <div v-if="draggable || !hideAuthor" class="project-feed-card__identity">
        <button
          v-if="draggable"
          class="project-feed-card__drag"
          type="button"
          aria-label="Перетащить"
        >
          <BaseIcon class="project-feed-card__drag-icon" name="drag-handle" />
        </button>
        <strong v-if="!hideAuthor" class="project-feed-card__author">{{ author }}</strong>
      </div>
      <div class="project-feed-card__meta">
        <time class="project-feed-card__date">{{ date }}</time>
      </div>
    </header>

    <div v-if="variant === 'history'" class="project-feed-card__event">
      <div class="project-feed-card__text">{{ text }}</div>
      <time class="project-feed-card__date">{{ date }}</time>
    </div>

    <template v-else>
      <div class="project-feed-card__text">{{ text }}</div>

      <footer v-if="actionsMode === 'inline' && ($slots.actions || !readonly)" class="project-feed-card__actions">
        <slot name="actions">
          <BaseIconButton
            label="Изменить"
            icon="edit"
            @click="$emit('edit')"
          />
          <BaseIconButton
            label="Удалить"
            icon="trash"
            @click="$emit('remove')"
          />
        </slot>
      </footer>
    </template>
  </article>
</template>
