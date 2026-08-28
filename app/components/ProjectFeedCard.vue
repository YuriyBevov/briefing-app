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
  direction?: 'incoming' | 'outgoing' | ''
}>(), {
  readonly: false,
  variant: 'default',
  actionsMode: 'inline',
  draggable: false,
  hideAuthor: false,
  color: '',
  direction: ''
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

const avatarText = computed(() =>
  props.author
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)
</script>

<template>
  <article
    class="project-feed-card"
    :class="{
      'project-feed-card--history': variant === 'history',
      'project-feed-card--context': actionsMode === 'context',
      'project-feed-card--colored': Boolean(color),
      'project-feed-card--note': hideAuthor,
      'project-feed-card--incoming': direction === 'incoming',
      'project-feed-card--outgoing': direction === 'outgoing'
    }"
    :style="color ? { '--project-feed-card-background': color } : undefined"
    @contextmenu="handleContextMenu"
  >
    <span
      v-if="direction === 'incoming' && variant !== 'history' && !hideAuthor"
      class="project-feed-card__avatar"
      aria-hidden="true"
    >
      {{ avatarText }}
    </span>

    <div class="project-feed-card__bubble">
      <header v-if="variant === 'history'" class="project-feed-card__header">
        <span class="project-feed-card__author">{{ author }}</span>
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
          <span v-if="!hideAuthor" class="project-feed-card__author">{{ author }}</span>
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
    </div>
  </article>
</template>
