<script setup lang="ts">
import type { ProjectComment } from '~/composables/useProjectStore'

const {
  canUsePermission,
  createProjectComment,
  currentProjectComments,
  deleteProjectComment,
  getUserNameById,
  updateProjectComment,
  currentProjectHistory,
  currentUser,
  currentProject
} = useProjectStore()

type FeedContextMenu =
  { type: 'comment'; item: ProjectComment; x: number; y: number }
type SidebarPanelId = 'comments'
type SidebarActionId = 'comments' | 'notes' | 'history'
type SideRailIconName = 'history' | 'message' | 'note' | 'panel' | 'settings'

const activeSidebarPanel = useState<SidebarPanelId | ''>('active-side-rail-panel', () => '')
const commentText = ref('')
const feedContextMenu = ref<FeedContextMenu | null>(null)
const feedContextMenuKey = ref(0)
const feedContextMenuElement = ref<HTMLElement | null>(null)
const editingComment = ref<ProjectComment | null>(null)
const deletingComment = ref<ProjectComment | null>(null)
const commentFormText = ref('')
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
let chatObserver: IntersectionObserver | undefined

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

const toggleSidebarAction = (actionId: SidebarActionId) => {
  if (actionId !== 'comments' || !canViewComments.value) {
    return
  }

  activeSidebarPanel.value = isChatOpen.value ? '' : 'comments'

  if (activeSidebarPanel.value === 'comments') {
    nextTick(observeVisibleChatMessages)
    return
  }

  disconnectChatObserver()
}

const closeSidebarPanel = () => {
  activeSidebarPanel.value = ''
}

const canShowFeedContextMenu = computed(() => {
  if (!feedContextMenu.value) {
    return false
  }

  return canEditComments.value || canDeleteComments.value
})

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

const closeFeedContextMenu = () => {
  feedContextMenu.value = null
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
  if (!canEditComments.value && !canDeleteComments.value) {
    return
  }

  openFeedContextMenu({
    type: 'comment',
    item: comment,
    x: event.clientX,
    y: event.clientY
  })
}

const editContextMenuItem = () => {
  if (!feedContextMenu.value) {
    return
  }

  openEditCommentModal(feedContextMenu.value.item)
  closeFeedContextMenu()
}

const removeContextMenuItem = () => {
  if (!feedContextMenu.value) {
    return
  }

  deletingComment.value = feedContextMenu.value.item
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

const confirmDeleteComment = () => {
  if (!deletingComment.value) {
    return
  }

  if (deleteProjectComment(deletingComment.value.id)) {
    deletingComment.value = null
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
  window.addEventListener('click', closeFeedContextMenu)
  window.addEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.addEventListener('scroll', closeFeedContextMenu, true)
  nextTick(observeVisibleChatMessages)
})

watch(
  [isChatOpen, () => currentProjectComments.value.length, chatReadKey],
  () => {
    nextTick(observeVisibleChatMessages)
  }
)

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }

  window.removeEventListener('click', closeFeedContextMenu)
  window.removeEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.removeEventListener('scroll', closeFeedContextMenu, true)
  disconnectChatObserver()
})
</script>

<template>
  <aside class="side-rail" :class="{ 'side-rail--open': isChatOpen }">
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
              'button--active': action.id === 'comments' && isChatOpen,
              'button--attention': action.id === 'comments' && unreadCommentsCount
            }"
            type="button"
            :disabled="action.disabled || action.id !== 'comments'"
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
      <section v-if="isChatOpen" class="side-rail__drawer" aria-label="Чат проекта">
        <header class="side-rail__drawer-header">
          <h2 class="section-title">Чат проекта</h2>
          <BaseIconButton
            label="Скрыть чат проекта"
            icon="close"
            @click="closeSidebarPanel"
          />
        </header>

        <ProjectFeedBlock
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
              :direction="comment.authorId === currentUser?.id ? 'outgoing' : 'incoming'"
              actions-mode="context"
              readonly
              @context="openCommentContextMenu(comment, $event)"
            />
          </template>
        </ProjectFeedBlock>
      </section>
    </Transition>

    <div
      v-if="canShowFeedContextMenu && feedContextMenu"
      :key="feedContextMenuKey"
      ref="feedContextMenuElement"
      class="side-rail__context-menu"
      :style="{ left: `${feedContextMenu.x}px`, top: `${feedContextMenu.y}px` }"
      @click.stop
    >
      <button
        v-if="canEditComments"
        class="side-rail__context-action"
        type="button"
        @click="editContextMenuItem"
      >
        <BaseIcon class="side-rail__context-icon" name="edit" />
        <span>Изменить</span>
      </button>
      <button
        v-if="canDeleteComments"
        class="side-rail__context-action side-rail__context-action--danger"
        type="button"
        @click="removeContextMenuItem"
      >
        <BaseIcon class="side-rail__context-icon" name="trash" />
        <span>Удалить</span>
      </button>
    </div>

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
  </aside>
</template>
