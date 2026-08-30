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
  metaLabel?: string
  metaColor?: string
  direction?: 'incoming' | 'outgoing' | ''
  edited?: boolean
  expanded?: boolean
}>(), {
  readonly: false,
  variant: 'default',
  actionsMode: 'inline',
  draggable: false,
  hideAuthor: false,
  color: '',
  metaLabel: '',
  metaColor: '',
  direction: '',
  edited: false,
  expanded: false
})

const emit = defineEmits<{
  edit: []
  remove: []
  context: [event: MouseEvent]
}>()

const textElement = ref<HTMLElement | null>(null)
const isNoteExpanded = ref(false)
const hasCollapsedNoteText = ref(false)
let textResizeObserver: ResizeObserver | undefined

const isNote = computed(() => props.hideAuthor && props.variant !== 'history')
const isNoteExpandedView = computed(() => props.expanded || isNoteExpanded.value)

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

const updateNoteOverflow = () => {
  if (!isNote.value || isNoteExpandedView.value || !textElement.value) {
    hasCollapsedNoteText.value = false
    return
  }

  hasCollapsedNoteText.value = textElement.value.scrollHeight > textElement.value.clientHeight
}

const toggleFullNote = () => {
  isNoteExpanded.value = !isNoteExpanded.value

  if (!isNoteExpanded.value) {
    nextTick(updateNoteOverflow)
  }
}

onMounted(() => {
  nextTick(updateNoteOverflow)

  if (!import.meta.client || !textElement.value) {
    return
  }

  textResizeObserver = new ResizeObserver(updateNoteOverflow)
  textResizeObserver.observe(textElement.value)
})

watch(
  () => props.text,
  () => {
    isNoteExpanded.value = false
    nextTick(updateNoteOverflow)
  }
)

onBeforeUnmount(() => {
  textResizeObserver?.disconnect()
})
</script>

<template>
  <article
    class="project-feed-card"
    :class="{
      'project-feed-card--history': variant === 'history',
      'project-feed-card--context': actionsMode === 'context',
      'project-feed-card--colored': Boolean(color),
      'project-feed-card--note': hideAuthor,
      'project-feed-card--note-expanded': isNoteExpandedView,
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
          <div
            v-if="metaLabel"
            class="project-feed-card__meta-label"
            :style="metaColor ? { '--project-feed-card-meta-background': metaColor } : undefined"
          >
            {{ metaLabel }}
          </div>
          <BaseIcon v-if="edited" class="project-feed-card__edited-icon" name="edit" />
          <time class="project-feed-card__date">{{ date }}</time>
        </div>
      </header>

      <div v-if="variant === 'history'" class="project-feed-card__event">
        <div class="project-feed-card__text">{{ text }}</div>
        <time class="project-feed-card__date">{{ date }}</time>
      </div>

      <template v-else>
        <div ref="textElement" class="project-feed-card__text">{{ text }}</div>

        <button
          v-if="isNote && !expanded && (hasCollapsedNoteText || isNoteExpanded)"
          class="project-feed-card__more"
          type="button"
          @click="toggleFullNote"
        >
          {{ isNoteExpanded ? 'Свернуть' : 'Развернуть' }}
        </button>

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
