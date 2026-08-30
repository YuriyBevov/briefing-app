<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { ProjectComment, ProjectNote, ProjectNoteColumn } from '~/composables/useProjectStore'

const {
  canUsePermission,
  createProjectComment,
  createProjectNote,
  currentProjectComments,
  currentUserNotes,
  currentUserNoteColumns,
  deleteProjectComment,
  deleteProjectNote,
  deleteProjectNoteColumn,
  getUserNameById,
  reorderProjectNotes,
  updateProjectComment,
  updateProjectNote,
  createProjectNoteColumn,
  updateProjectNoteColumn,
  currentProjectHistory,
  currentUser,
  currentProject
} = useProjectStore()

type FeedContextMenu =
  | { type: 'comment'; item: ProjectComment; x: number; y: number }
  | { type: 'note'; item: ProjectNote; x: number; y: number }
type SidebarPanelId = 'comments' | 'notes'
type SidebarActionId = 'comments' | 'notes' | 'history'
type SideRailIconName = 'history' | 'message' | 'note' | 'panel' | 'settings'

const activeSidebarPanel = useState<SidebarPanelId | ''>('active-side-rail-panel', () => '')
const commentText = ref('')
const noteText = ref('')
const selectedNoteColor = ref('')
const isNotePaletteOpen = ref(false)
const noteSearchQuery = ref('')
const feedContextMenu = ref<FeedContextMenu | null>(null)
const feedContextMenuKey = ref(0)
const feedContextMenuElement = ref<HTMLElement | null>(null)
const notesColumnsElement = ref<HTMLElement | null>(null)
const editingComment = ref<ProjectComment | null>(null)
const deletingComment = ref<ProjectComment | null>(null)
const editingNote = ref<ProjectNote | null>(null)
const deletingNote = ref<ProjectNote | null>(null)
const isCreatingNote = ref(false)
const isNotesWindowOpen = ref(false)
const isCreatingNoteColumn = ref(false)
const editingNoteColumn = ref<ProjectNoteColumn | null>(null)
const deletingNoteColumn = ref<ProjectNoteColumn | null>(null)
const commentFormText = ref('')
const noteFormText = ref('')
const noteColumnFormTitle = ref('')
const noteFormColor = ref('')
const noteColumnFormColor = ref('')
const chatReadState = ref<Record<string, string[]>>({})
const canViewComments = canUsePermission('view_comments')
const canCreateComments = canUsePermission('create_comments')
const canEditComments = canUsePermission('edit_comments')
const canDeleteComments = canUsePermission('delete_comments')
const canViewHistory = canUsePermission('view_history')
const canViewSettings = canUsePermission('view_settings')
const canViewUiComponents = canUsePermission('view_ui_components')
const currentTime = ref('')
const currentDate = ref('')
let timer: ReturnType<typeof window.setInterval> | undefined
let panelSwitchTimer: ReturnType<typeof window.setTimeout> | undefined
let chatObserver: IntersectionObserver | undefined
let notesColumnsResizeObserver: ResizeObserver | undefined
const sideRailTransitionDuration = 280

const noteColorOptions = [
  { value: 'linear-gradient(135deg, #fff7d1 0%, #ffe7a3 100%)', preview: '#ffe7a3', label: 'Желтый цвет заметки' },
  { value: 'linear-gradient(135deg, #e4f8ed 0%, #bdebd2 100%)', preview: '#bdebd2', label: 'Зеленый цвет заметки' },
  { value: 'linear-gradient(135deg, #e6f0ff 0%, #bdd6ff 100%)', preview: '#bdd6ff', label: 'Синий цвет заметки' },
  { value: 'linear-gradient(135deg, #f8e8ff 0%, #ebc4ff 100%)', preview: '#ebc4ff', label: 'Фиолетовый цвет заметки' },
  { value: 'linear-gradient(135deg, #ffe8ef 0%, #ffc4d2 100%)', preview: '#ffc4d2', label: 'Розовый цвет заметки' },
  { value: '', label: 'Цвет заметки по умолчанию' }
]

const noteColumnColorOptions = [
  { value: '#ffe7a3', label: 'Желтый цвет колонки' },
  { value: '#bdebd2', label: 'Зеленый цвет колонки' },
  { value: '#bdd6ff', label: 'Синий цвет колонки' },
  { value: '#ebc4ff', label: 'Фиолетовый цвет колонки' },
  { value: '#ffc4d2', label: 'Розовый цвет колонки' },
  { value: '', label: 'Цвет колонки по умолчанию' }
]

const getLocalDateKey = (value: string) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const sidebarActions = computed<Array<{
  id: SidebarActionId
  label: string
  icon: SideRailIconName
  disabled?: boolean
}>>(() => [
  {
    id: 'comments',
    label: 'Чат проекта',
    icon: 'message',
    disabled: !canViewComments.value
  },
  {
    id: 'notes',
    label: 'Заметки',
    icon: 'note',
    disabled: false
  },
  {
    id: 'history',
    label: 'История изменений',
    icon: 'history',
    disabled: !canViewHistory.value || currentProjectHistory.value.length === 0
  }
])

const utilityActions = computed<Array<{
  label: string
  to: string
  icon: SideRailIconName
}>>(() => [
  {
    label: 'Настройки',
    to: '/settings',
    icon: 'settings'
  },
  {
    label: 'UI-компоненты',
    to: '/ui-components',
    icon: 'panel'
  }
].filter((action) => {
  if (action.to === '/settings') {
    return canViewSettings.value
  }

  if (action.to === '/ui-components') {
    return canViewUiComponents.value
  }

  return true
}))

const isChatOpen = computed(() => activeSidebarPanel.value === 'comments')
const isNotesOpen = computed(() => activeSidebarPanel.value === 'notes')
const isDrawerOpen = computed(() => Boolean(activeSidebarPanel.value))
const drawerTitle = computed(() => {
  if (isNotesOpen.value) {
    return 'Заметки'
  }

  return 'Чат проекта'
})

const chatReadStorageKey = 'brief-os-chat-read-state'
const chatReadKey = computed(() =>
  `${currentProject.value?.id ?? 'project'}:${currentUser.value?.id ?? 'user'}`
)

const readCommentIds = computed(() =>
  new Set(chatReadState.value[chatReadKey.value] ?? [])
)

const unreadCommentsCount = computed(() => {
  if (!canViewComments.value) {
    return 0
  }

  return currentProjectComments.value.filter((comment) =>
    comment.authorId !== currentUser.value?.id &&
    !readCommentIds.value.has(comment.id)
  ).length
})

const loadChatReadState = () => {
  if (!import.meta.client) {
    return
  }

  const savedState = window.localStorage.getItem(chatReadStorageKey)

  if (!savedState) {
    return
  }

  try {
    const parsedState = JSON.parse(savedState) as Record<string, string[] | string>

    chatReadState.value = Object.fromEntries(
      Object.entries(parsedState).map(([key, value]) => [
        key,
        Array.isArray(value) ? value : []
      ])
    )
  } catch {
    chatReadState.value = {}
  }
}

const saveChatReadState = () => {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(chatReadStorageKey, JSON.stringify(chatReadState.value))
}

const markCommentAsRead = (commentId: string) => {
  if (readCommentIds.value.has(commentId)) {
    return
  }

  const currentIds = chatReadState.value[chatReadKey.value] ?? []

  chatReadState.value = {
    ...chatReadState.value,
    [chatReadKey.value]: [...currentIds, commentId]
  }
  saveChatReadState()
}

const disconnectChatObserver = () => {
  chatObserver?.disconnect()
  chatObserver = undefined
}

const observeVisibleChatMessages = () => {
  disconnectChatObserver()

  if (!import.meta.client || !isChatOpen.value || !canViewComments.value) {
    return
  }

  const listElement = document.querySelector<HTMLElement>('.side-rail__chat .project-feed-block__list')
  const messageElements = listElement?.querySelectorAll<HTMLElement>('.side-rail__chat-message[data-comment-id]')

  if (!listElement || !messageElements?.length) {
    return
  }

  chatObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return
      }

      const element = entry.target as HTMLElement
      const commentId = element.dataset.commentId

      if (!commentId) {
        return
      }

      markCommentAsRead(commentId)
      chatObserver?.unobserve(element)
    })
  }, {
    root: listElement,
    threshold: 0.5
  })

  messageElements.forEach((element) => {
    const commentId = element.dataset.commentId
    const authorId = element.dataset.authorId

    if (!commentId || authorId === currentUser.value?.id || readCommentIds.value.has(commentId)) {
      return
    }

    chatObserver?.observe(element)
  })
}

const formatMessageDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value)).replace(' г.', 'г.')

const formatMessageTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(value))

const formatNoteDateTime = (value: string) =>
  `${formatShortDate(value)} ${formatMessageTime(value)}`

const groupedProjectComments = computed(() => {
  const groups: Array<{ dateKey: string; dateLabel: string; comments: ProjectComment[] }> = []

  currentProjectComments.value.forEach((comment) => {
    const dateKey = getLocalDateKey(comment.createdAt)
    const lastGroup = groups.at(-1)

    if (lastGroup?.dateKey === dateKey) {
      lastGroup.comments.push(comment)
      return
    }

    groups.push({
      dateKey,
      dateLabel: formatMessageDate(comment.createdAt),
      comments: [comment]
    })
  })

  return groups
})

const orderedNotes = computed({
  get: () => currentUserNotes.value,
  set: (notes: ProjectNote[]) => {
    reorderProjectNotes(notes.map((note) => note.id))
  }
})

const noteColumnById = computed(() =>
  new Map(currentUserNoteColumns.value.map((column) => [column.id, column]))
)

const normalizedNoteSearchQuery = computed(() =>
  noteSearchQuery.value.trim().toLowerCase()
)

const isNoteSearchMatch = (note: ProjectNote) => {
  if (!normalizedNoteSearchQuery.value) {
    return true
  }

  const searchableText = [
    note.text,
    getUserNameById(note.authorId),
    formatNoteDateTime(note.createdAt)
  ].join(' ').toLowerCase()

  return searchableText.includes(normalizedNoteSearchQuery.value)
}

const hasBoardNotes = computed(() =>
  currentUserNoteColumns.value.some((column) => getBoardColumnNotes(column.id).length > 0)
)
const hasMultipleNoteColumnRows = ref(false)

const notesColumnsClass = computed(() => ({
  'kanban__columns--single-row': !hasMultipleNoteColumnRows.value,
  'kanban__columns--multi-row': hasMultipleNoteColumnRows.value
}))

const getBoardColumnNotes = (columnId: string) =>
  orderedNotes.value.filter((note) => note.noteColumnId === columnId && isNoteSearchMatch(note))

const reorderBoardColumnNotes = (columnId: string, notes: ProjectNote[]) => {
  reorderProjectNotes(notes.map((note) => note.id), columnId)
}

const getNoteColumnTitle = (note: ProjectNote) =>
  noteColumnById.value.get(note.noteColumnId)?.title ?? ''

const getNoteColumnColor = (note: ProjectNote) =>
  noteColumnById.value.get(note.noteColumnId)?.color ?? ''

const updateNotesColumnRows = () => {
  const columnsElement = notesColumnsElement.value

  if (!columnsElement) {
    hasMultipleNoteColumnRows.value = false
    return
  }

  const styles = window.getComputedStyle(columnsElement)
  const columnGap = Number.parseFloat(styles.columnGap) || 0
  const minColumnWidth = 240
  const columnsPerRow = Math.max(
    1,
    Math.floor((columnsElement.clientWidth + columnGap) / (minColumnWidth + columnGap))
  )

  hasMultipleNoteColumnRows.value = currentUserNoteColumns.value.length > columnsPerRow
}

const observeNotesColumns = () => {
  notesColumnsResizeObserver?.disconnect()

  if (!notesColumnsElement.value) {
    updateNotesColumnRows()
    return
  }

  notesColumnsResizeObserver = new ResizeObserver(updateNotesColumnRows)
  notesColumnsResizeObserver.observe(notesColumnsElement.value)
  updateNotesColumnRows()
}

const openSidebarPanel = (panelId: SidebarPanelId) => {
  activeSidebarPanel.value = panelId

  if (panelId === 'comments') {
    nextTick(observeVisibleChatMessages)
    return
  }

  disconnectChatObserver()
}

const toggleSidebarAction = (actionId: SidebarActionId) => {
  if (actionId === 'history') {
    return
  }

  if (actionId === 'comments' && !canViewComments.value) {
    return
  }

  if (panelSwitchTimer) {
    window.clearTimeout(panelSwitchTimer)
    panelSwitchTimer = undefined
  }

  if (activeSidebarPanel.value === actionId) {
    activeSidebarPanel.value = ''
    disconnectChatObserver()
    return
  }

  if (!activeSidebarPanel.value) {
    openSidebarPanel(actionId)
    return
  }

  activeSidebarPanel.value = ''
  disconnectChatObserver()
  panelSwitchTimer = window.setTimeout(() => {
    openSidebarPanel(actionId)
    panelSwitchTimer = undefined
  }, sideRailTransitionDuration)
}

const closeSidebarPanel = () => {
  if (panelSwitchTimer) {
    window.clearTimeout(panelSwitchTimer)
    panelSwitchTimer = undefined
  }

  activeSidebarPanel.value = ''
  disconnectChatObserver()
}

const openNotesWindow = () => {
  isNotesWindowOpen.value = true
}

const closeNotesWindow = () => {
  isNotesWindowOpen.value = false
}

const openCreateNoteModal = () => {
  noteFormText.value = ''
  noteFormColor.value = selectedNoteColor.value
  isCreatingNote.value = true
}

const closeCreateNoteModal = () => {
  isCreatingNote.value = false
  noteFormText.value = ''
  noteFormColor.value = ''
}

const openCreateNoteColumnModal = () => {
  noteColumnFormTitle.value = ''
  noteColumnFormColor.value = ''
  isCreatingNoteColumn.value = true
}

const closeCreateNoteColumnModal = () => {
  isCreatingNoteColumn.value = false
  noteColumnFormTitle.value = ''
  noteColumnFormColor.value = ''
}

const submitCreateNoteColumn = () => {
  if (createProjectNoteColumn(noteColumnFormTitle.value, noteColumnFormColor.value)) {
    closeCreateNoteColumnModal()
  }
}

const openEditNoteColumnModal = (column: ProjectNoteColumn) => {
  editingNoteColumn.value = column
  noteColumnFormTitle.value = column.title
  noteColumnFormColor.value = column.color
}

const closeEditNoteColumnModal = () => {
  editingNoteColumn.value = null
  noteColumnFormTitle.value = ''
  noteColumnFormColor.value = ''
}

const submitEditNoteColumn = () => {
  if (!editingNoteColumn.value) {
    return
  }

  if (updateProjectNoteColumn(editingNoteColumn.value.id, noteColumnFormTitle.value, noteColumnFormColor.value)) {
    closeEditNoteColumnModal()
  }
}

const canShowFeedContextMenu = computed(() => {
  if (!feedContextMenu.value) {
    return false
  }

  if (feedContextMenu.value.type === 'comment') {
    return canEditComment(feedContextMenu.value.item) || canDeleteComment(feedContextMenu.value.item)
  }

  return true
})

const isOwnComment = (comment: ProjectComment) =>
  comment.authorId === currentUser.value?.id

const canEditComment = (comment: ProjectComment) =>
  isOwnComment(comment) && canEditComments.value

const canDeleteComment = (comment: ProjectComment) =>
  isOwnComment(comment) && canDeleteComments.value

const updateTime = () => {
  const now = new Date()

  currentTime.value = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)

  currentDate.value = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  }).format(now)
}

const submitComment = () => {
  if (createProjectComment(commentText.value)) {
    commentText.value = ''
  }
}

const submitNote = () => {
  if (createProjectNote(noteText.value, selectedNoteColor.value)) {
    noteText.value = ''
  }
}

const submitCreateNote = () => {
  if (createProjectNote(noteFormText.value, noteFormColor.value)) {
    closeCreateNoteModal()
  }
}

const closeFeedContextMenu = () => {
  feedContextMenu.value = null
}

const closeNotePalette = () => {
  isNotePaletteOpen.value = false
}

const toggleNotePalette = () => {
  isNotePaletteOpen.value = !isNotePaletteOpen.value
}

const closeFloatingMenus = () => {
  closeFeedContextMenu()
}

const updateFeedContextMenuPosition = () => {
  if (!feedContextMenu.value || !feedContextMenuElement.value) {
    return
  }

  const menu = feedContextMenuElement.value
  const viewportGap = 8
  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const anchorX = feedContextMenu.value.x
  const anchorY = feedContextMenu.value.y

  const preferredX = anchorX + menuWidth + viewportGap > window.innerWidth
    ? anchorX - menuWidth
    : anchorX
  const preferredY = anchorY + menuHeight + viewportGap > window.innerHeight
    ? anchorY - menuHeight
    : anchorY

  feedContextMenu.value = {
    ...feedContextMenu.value,
    x: Math.max(viewportGap, Math.min(preferredX, window.innerWidth - menuWidth - viewportGap)),
    y: Math.max(viewportGap, Math.min(preferredY, window.innerHeight - menuHeight - viewportGap))
  }
}

const openFeedContextMenu = (menu: FeedContextMenu) => {
  feedContextMenuKey.value += 1
  feedContextMenu.value = menu
  nextTick(updateFeedContextMenuPosition)
}

const openCommentContextMenu = (comment: ProjectComment, event: MouseEvent) => {
  if (!canEditComment(comment) && !canDeleteComment(comment)) {
    return
  }

  openFeedContextMenu({
    type: 'comment',
    item: comment,
    x: event.clientX,
    y: event.clientY
  })
}

const openNoteContextMenu = (note: ProjectNote, event: MouseEvent) => {
  openFeedContextMenu({
    type: 'note',
    item: note,
    x: event.clientX,
    y: event.clientY
  })
}

const editContextMenuItem = () => {
  if (!feedContextMenu.value) {
    return
  }

  if (feedContextMenu.value.type === 'comment') {
    openEditCommentModal(feedContextMenu.value.item)
  } else {
    openEditNoteModal(feedContextMenu.value.item)
  }

  closeFeedContextMenu()
}

const removeContextMenuItem = () => {
  if (!feedContextMenu.value) {
    return
  }

  if (feedContextMenu.value.type === 'comment') {
    deletingComment.value = feedContextMenu.value.item
  } else {
    deletingNote.value = feedContextMenu.value.item
  }

  closeFeedContextMenu()
}

const openEditCommentModal = (comment: ProjectComment) => {
  editingComment.value = comment
  commentFormText.value = comment.text
}

const closeEditCommentModal = () => {
  editingComment.value = null
  commentFormText.value = ''
}

const submitEditComment = () => {
  if (!editingComment.value) {
    return
  }

  if (updateProjectComment(editingComment.value.id, commentFormText.value)) {
    closeEditCommentModal()
  }
}

const openEditNoteModal = (note: ProjectNote) => {
  editingNote.value = note
  noteFormText.value = note.text
  noteFormColor.value = note.color
}

const closeEditNoteModal = () => {
  editingNote.value = null
  noteFormText.value = ''
  noteFormColor.value = ''
}

const submitEditNote = () => {
  if (!editingNote.value) {
    return
  }

  if (updateProjectNote(editingNote.value.id, noteFormText.value, noteFormColor.value)) {
    closeEditNoteModal()
  }
}

const confirmDeleteComment = () => {
  if (!deletingComment.value) {
    return
  }

  if (deleteProjectComment(deletingComment.value.id)) {
    deletingComment.value = null
  }
}

const confirmDeleteNote = () => {
  if (!deletingNote.value) {
    return
  }

  if (deleteProjectNote(deletingNote.value.id)) {
    deletingNote.value = null
  }
}

const confirmDeleteNoteColumn = () => {
  if (!deletingNoteColumn.value) {
    return
  }

  if (deleteProjectNoteColumn(deletingNoteColumn.value.id)) {
    deletingNoteColumn.value = null
  }
}

const closeFeedContextMenuByKeyboard = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeFeedContextMenu()
  }
}

onMounted(() => {
  loadChatReadState()
  updateTime()
  timer = window.setInterval(updateTime, 30000)
  window.addEventListener('click', closeFloatingMenus)
  window.addEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.addEventListener('scroll', closeFloatingMenus, true)
  nextTick(observeVisibleChatMessages)
})

watch(
  [isChatOpen, () => currentProjectComments.value.length, chatReadKey],
  () => {
    nextTick(observeVisibleChatMessages)
  }
)

watch(
  [isNotesWindowOpen, () => currentUserNoteColumns.value.length],
  () => {
    nextTick(observeNotesColumns)
  }
)

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }

  if (panelSwitchTimer) {
    window.clearTimeout(panelSwitchTimer)
  }

  window.removeEventListener('click', closeFloatingMenus)
  window.removeEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.removeEventListener('scroll', closeFloatingMenus, true)
  disconnectChatObserver()
  notesColumnsResizeObserver?.disconnect()
})
</script>

<template>
  <aside class="side-rail" :class="{ 'side-rail--open': isDrawerOpen }">
    <div class="side-rail__rail">
      <header class="side-rail__header">
        <time class="side-rail__date">{{ currentDate }}</time>
        <time class="side-rail__time">{{ currentTime }}</time>
      </header>

      <nav class="side-rail__actions" aria-label="Быстрые панели проекта">
        <div class="side-rail__action-group">
          <button
            v-for="action in sidebarActions"
            :key="action.id"
            class="button button--secondary button--icon"
            :class="{
              'button--active': action.id === activeSidebarPanel,
              'button--attention': action.id === 'comments' && unreadCommentsCount
            }"
            type="button"
            :disabled="action.disabled"
            :aria-label="action.label"
            :title="action.label"
            @click="toggleSidebarAction(action.id)"
          >
            <BaseIcon :name="action.icon" />
            <span
              v-if="action.id === 'comments' && unreadCommentsCount"
              class="side-rail__indicator"
              aria-label="Непрочитанные сообщения"
            />
          </button>
        </div>

        <div class="side-rail__action-group side-rail__action-group--utility">
          <NuxtLink
            v-for="action in utilityActions"
            :key="action.to"
            class="button button--secondary button--icon"
            :to="action.to"
            :aria-label="action.label"
            :title="action.label"
          >
            <BaseIcon :name="action.icon" />
          </NuxtLink>
        </div>
      </nav>

      <footer class="side-rail__footer">
        <button class="button button--secondary side-rail__system-action" type="button" aria-label="Выйти" title="Выйти">
          <BaseIcon class="side-rail__system-icon" name="logout" />
        </button>
      </footer>
    </div>

    <Transition name="side-rail-drawer">
      <section v-if="isDrawerOpen" class="side-rail__drawer" :aria-label="drawerTitle">
        <header class="side-rail__drawer-header">
          <h2 class="section-title">{{ drawerTitle }}</h2>
          <div class="side-rail__drawer-actions">
            <BaseIconButton
              v-if="isNotesOpen"
              label="Развернуть заметки"
              icon="maximize"
              @click="openNotesWindow"
            />
            <BaseIconButton
              :label="`Скрыть ${drawerTitle.toLowerCase()}`"
              icon="close"
              @click="closeSidebarPanel"
            />
          </div>
        </header>

        <ProjectFeedBlock
          v-if="isChatOpen"
          class="side-rail__chat"
          :framed="false"
          form-position="bottom"
          :has-items="currentProjectComments.length > 0"
          empty-text="Сообщений пока нет"
        >
          <template v-if="canCreateComments" #form>
            <form class="side-rail__form" @submit.prevent="submitComment">
              <label class="side-rail__composer">
                <textarea
                  v-model="commentText"
                  class="field__control side-rail__input"
                  rows="1"
                  aria-label="Сообщение"
                  placeholder="Напишите сообщение"
                />
                <button class="button button--small side-rail__send" type="submit" aria-label="Отправить" title="Отправить">
                  <BaseIcon class="side-rail__send-icon" name="send" />
                </button>
              </label>
            </form>
          </template>

          <template v-for="group in groupedProjectComments" :key="group.dateKey">
            <div class="side-rail__date-divider">{{ group.dateLabel }}</div>

            <ProjectFeedCard
              v-for="comment in group.comments"
              :key="comment.id"
              class="side-rail__chat-message"
              :data-comment-id="comment.id"
              :data-author-id="comment.authorId"
              :author="getUserNameById(comment.authorId)"
              :date="formatMessageTime(comment.createdAt)"
              :text="comment.text"
              :edited="Boolean(comment.editedAt)"
              :direction="comment.authorId === currentUser?.id ? 'outgoing' : 'incoming'"
              actions-mode="context"
              readonly
              @context="openCommentContextMenu(comment, $event)"
            />
          </template>
        </ProjectFeedBlock>

        <ProjectFeedBlock
          v-else-if="isNotesOpen"
          class="side-rail__notes"
          :framed="false"
          form-position="bottom"
          :has-items="orderedNotes.length > 0"
          empty-text="Заметок пока нет"
        >
          <template #form>
            <form class="side-rail__form" @submit.prevent="submitNote">
              <label
                class="side-rail__composer side-rail__composer--note"
                :style="selectedNoteColor ? { '--side-rail-note-color': selectedNoteColor } : undefined"
              >
                <div class="side-rail__note-picker" @click.stop>
                  <button
                    class="button button--small side-rail__note-picker-button"
                    type="button"
                    aria-label="Выбрать цвет заметки"
                    title="Выбрать цвет заметки"
                    @click="toggleNotePalette"
                  >
                    <BaseIcon class="side-rail__note-picker-icon" name="menu" />
                  </button>

                  <BaseColorPicker
                    v-if="isNotePaletteOpen"
                    v-model="selectedNoteColor"
                    class="side-rail__note-palette"
                    :options="noteColorOptions"
                    orientation="vertical"
                  />
                </div>

                <textarea
                  v-model="noteText"
                  class="field__control side-rail__input"
                  rows="1"
                  aria-label="Заметка"
                  placeholder="Напишите заметку"
                  @click="closeNotePalette"
                />
                <button class="button button--small side-rail__send" type="submit" aria-label="Добавить заметку" title="Добавить заметку">
                  <BaseIcon class="side-rail__send-icon" name="send" />
                </button>
              </label>
            </form>
          </template>

          <VueDraggable
            v-model="orderedNotes"
            class="side-rail__notes-list"
            handle=".project-feed-card__drag"
            :animation="180"
          >
            <ProjectFeedCard
              v-for="note in orderedNotes"
              :key="note.id"
              :author="getUserNameById(note.authorId)"
              :date="formatNoteDateTime(note.createdAt)"
              :text="note.text"
              :color="note.color"
              :meta-label="getNoteColumnTitle(note)"
              :meta-color="getNoteColumnColor(note)"
              draggable
              hide-author
              actions-mode="context"
              readonly
              @context="openNoteContextMenu(note, $event)"
            />
          </VueDraggable>
        </ProjectFeedBlock>
      </section>
    </Transition>

    <Teleport to="body">
      <div
        v-if="canShowFeedContextMenu && feedContextMenu"
        :key="feedContextMenuKey"
        ref="feedContextMenuElement"
        class="side-rail__context-menu"
        :style="{ left: `${feedContextMenu.x}px`, top: `${feedContextMenu.y}px` }"
        @click.stop
      >
        <button
          v-if="feedContextMenu.type === 'note' || canEditComment(feedContextMenu.item)"
          class="side-rail__context-action"
          type="button"
          @click="editContextMenuItem"
        >
          <BaseIcon class="side-rail__context-icon" name="edit" />
          <span>Изменить</span>
        </button>
        <button
          v-if="feedContextMenu.type === 'note' || canDeleteComment(feedContextMenu.item)"
          class="side-rail__context-action side-rail__context-action--danger"
          type="button"
          @click="removeContextMenuItem"
        >
          <BaseIcon class="side-rail__context-icon" name="trash" />
          <span>Удалить</span>
        </button>
      </div>
    </Teleport>

    <BaseModal
      v-if="isNotesWindowOpen"
      title="Заметки"
      size="screen"
      @close="closeNotesWindow"
    >
      <div class="kanban">
        <div class="kanban__toolbar">
          <label class="kanban__search">
            <BaseIcon class="kanban__search-icon" name="search" />
            <input
              v-model="noteSearchQuery"
              class="field__control kanban__search-input"
              type="search"
              aria-label="Поиск по заметкам"
              placeholder="Поиск по заметкам"
            />
          </label>

          <BaseActionMenu label="Действия доски">
            <button class="action-menu__item" type="button" @click="openCreateNoteModal">
              <BaseIcon class="action-menu__icon" name="note" />
              <span>Создать заметку</span>
            </button>
            <button class="action-menu__item" type="button" @click="openCreateNoteColumnModal">
              <BaseIcon class="action-menu__icon" name="plus" />
              <span>Создать колонку</span>
            </button>
          </BaseActionMenu>
        </div>

        <div v-if="normalizedNoteSearchQuery && !hasBoardNotes" class="kanban__empty">
          Ничего не найдено
        </div>
        <div
          v-else
          ref="notesColumnsElement"
          class="kanban__columns"
          :class="notesColumnsClass"
        >
          <section
            v-for="column in currentUserNoteColumns"
            :key="column.id"
            class="kanban__column"
          >
            <header
              class="kanban__column-header"
              :style="column.color ? { '--kanban-column-color': column.color } : undefined"
            >
              <h3 class="kanban__column-title">{{ column.title }}</h3>
              <div class="kanban__column-actions">
                <BaseIconButton
                  label="Редактировать колонку"
                  icon="edit"
                  @click="openEditNoteColumnModal(column)"
                />
                <BaseIconButton
                  label="Удалить колонку"
                  icon="trash"
                  @click="deletingNoteColumn = column"
                />
              </div>
            </header>

            <VueDraggable
              :model-value="getBoardColumnNotes(column.id)"
              class="kanban__column-list"
              group="notes-board"
              handle=".project-feed-card__drag"
              :animation="180"
              @update:model-value="reorderBoardColumnNotes(column.id, $event)"
            >
              <ProjectFeedCard
                v-for="note in getBoardColumnNotes(column.id)"
                :key="note.id"
                :author="getUserNameById(note.authorId)"
                :date="formatNoteDateTime(note.createdAt)"
                :text="note.text"
                :color="note.color"
                draggable
                hide-author
                actions-mode="context"
                readonly
                @context="openNoteContextMenu(note, $event)"
              />
            </VueDraggable>
          </section>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-if="isCreatingNoteColumn" title="Новая колонка" @close="closeCreateNoteColumnModal">
      <form id="note-column-create-form" class="modal-form" @submit.prevent="submitCreateNoteColumn">
        <label class="field">
          <span class="field__label">Название</span>
          <input v-model="noteColumnFormTitle" class="field__control" type="text" required />
        </label>
        <label class="field">
          <span class="field__label">Цвет</span>
          <BaseColorPicker v-model="noteColumnFormColor" :options="noteColumnColorOptions" />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="note-column-create-form">Создать</button>
        <button class="button button--secondary" type="button" @click="closeCreateNoteColumnModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="editingNoteColumn" title="Редактировать колонку" @close="closeEditNoteColumnModal">
      <form id="note-column-edit-form" class="modal-form" @submit.prevent="submitEditNoteColumn">
        <label class="field">
          <span class="field__label">Название</span>
          <input v-model="noteColumnFormTitle" class="field__control" type="text" required />
        </label>
        <label class="field">
          <span class="field__label">Цвет</span>
          <BaseColorPicker v-model="noteColumnFormColor" :options="noteColumnColorOptions" />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="note-column-edit-form">Сохранить</button>
        <button class="button button--secondary" type="button" @click="closeEditNoteColumnModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="deletingNoteColumn" title="Удалить колонку?" @close="deletingNoteColumn = null">
      <div class="modal-confirm">
        <p class="modal-confirm__text">Заметки из колонки будут перенесены в первую доступную колонку.</p>
      </div>

      <template #footer>
        <button class="button button--danger" type="button" @click="confirmDeleteNoteColumn">Удалить</button>
        <button class="button button--secondary" type="button" @click="deletingNoteColumn = null">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="editingComment" title="Изменить сообщение" @close="closeEditCommentModal">
      <form id="comment-edit-form" class="modal-form" @submit.prevent="submitEditComment">
        <label class="field">
          <span class="field__label">Сообщение</span>
          <textarea v-model="commentFormText" class="field__control" rows="5" required />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="comment-edit-form">Сохранить</button>
        <button class="button button--secondary" type="button" @click="closeEditCommentModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="deletingComment" title="Удалить сообщение?" @close="deletingComment = null">
      <div class="modal-confirm">
        <p class="modal-confirm__text">Сообщение будет удалено. Это действие нельзя отменить.</p>
      </div>

      <template #footer>
        <button class="button button--danger" type="button" @click="confirmDeleteComment">Удалить</button>
        <button class="button button--secondary" type="button" @click="deletingComment = null">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="editingNote" title="Изменить заметку" @close="closeEditNoteModal">
      <form id="note-edit-form" class="modal-form" @submit.prevent="submitEditNote">
        <label class="field">
          <span class="field__label">Заметка</span>
          <textarea v-model="noteFormText" class="field__control" rows="5" required />
        </label>
        <label class="field">
          <span class="field__label">Цвет</span>
          <BaseColorPicker v-model="noteFormColor" :options="noteColorOptions" />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="note-edit-form">Сохранить</button>
        <button class="button button--secondary" type="button" @click="closeEditNoteModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="isCreatingNote" title="Новая заметка" @close="closeCreateNoteModal">
      <form id="note-create-form" class="modal-form" @submit.prevent="submitCreateNote">
        <label class="field">
          <span class="field__label">Заметка</span>
          <textarea v-model="noteFormText" class="field__control" rows="5" required />
        </label>
        <label class="field">
          <span class="field__label">Цвет</span>
          <BaseColorPicker v-model="noteFormColor" :options="noteColorOptions" />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="note-create-form">Создать</button>
        <button class="button button--secondary" type="button" @click="closeCreateNoteModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="deletingNote" title="Удалить заметку?" @close="deletingNote = null">
      <div class="modal-confirm">
        <p class="modal-confirm__text">Заметка будет удалена. Это действие нельзя отменить.</p>
      </div>

      <template #footer>
        <button class="button button--danger" type="button" @click="confirmDeleteNote">Удалить</button>
        <button class="button button--secondary" type="button" @click="deletingNote = null">Отменить</button>
      </template>
    </BaseModal>
  </aside>
</template>
