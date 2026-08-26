<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { ProjectComment, ProjectNote } from '~/composables/useProjectStore'

const {
  canUsePermission,
  createProjectComment,
  createProjectNote,
  data,
  currentProjectComments,
  currentProjectHistory,
  currentUserNotes,
  deleteProjectComment,
  deleteProjectNote,
  getUserNameById,
  updateProjectComment,
  updateProjectNote,
  reorderProjectNotes,
  reorderProjectFeedBlocks
} = useProjectStore()

type ProjectFeedBlockId = 'comments' | 'notes' | 'history'
type FeedWindowBlockId = 'comments' | 'notes'
type FeedContextMenu =
  | { type: 'comment'; item: ProjectComment; x: number; y: number }
  | { type: 'note'; item: ProjectNote; x: number; y: number }

const projectFeedBlocks: Array<{
  id: ProjectFeedBlockId
  title: string
}> = [
  { id: 'comments', title: 'Комментарии' },
  { id: 'notes', title: 'Заметки' },
  { id: 'history', title: 'История' }
]
const notePaletteColors = [
  { label: 'по умолчанию', value: '' },
  { label: 'теплый свет', value: 'linear-gradient(135deg, #fff8d6 0%, #ffe8a3 100%)' },
  { label: 'персиковый', value: 'linear-gradient(135deg, #fff1df 0%, #ffd3ab 100%)' },
  { label: 'розовый', value: 'linear-gradient(135deg, #ffe8ef 0%, #ffc4d6 100%)' },
  { label: 'сиреневый', value: 'linear-gradient(135deg, #f3e8ff 0%, #d8c8ff 100%)' },
  { label: 'голубой', value: 'linear-gradient(135deg, #e4f4ff 0%, #b9dcff 100%)' },
  { label: 'мятный', value: 'linear-gradient(135deg, #e6fff7 0%, #b9f4e0 100%)' },
  { label: 'зеленый', value: 'linear-gradient(135deg, #efffe6 0%, #c9f4b7 100%)' }
]

const commentText = ref('')
const noteText = ref('')
const selectedNoteColor = ref('')
const feedWindowBlockId = ref<FeedWindowBlockId | ''>('')
const feedWindowText = ref('')
const feedContextMenu = ref<FeedContextMenu | null>(null)
const feedContextMenuKey = ref(0)
const feedContextMenuElement = ref<HTMLElement | null>(null)
const editingComment = ref<ProjectComment | null>(null)
const editingNote = ref<ProjectNote | null>(null)
const deletingComment = ref<ProjectComment | null>(null)
const deletingNote = ref<ProjectNote | null>(null)
const commentFormText = ref('')
const noteFormText = ref('')
const canViewComments = canUsePermission('view_comments')
const canCreateComments = canUsePermission('create_comments')
const canEditComments = canUsePermission('edit_comments')
const canDeleteComments = canUsePermission('delete_comments')
const canViewHistory = canUsePermission('view_history')
const collapsedFeedBlocks = ref<ProjectFeedBlockId[]>([])

const orderedFeedBlocks = computed({
  get: () => data.value.projectFeedBlockOrder
    .map((blockId) => projectFeedBlocks.find((block) => block.id === blockId))
    .filter((block): block is (typeof projectFeedBlocks)[number] => Boolean(block))
    .filter((block) => {
      if (block.id === 'comments') {
        return canViewComments.value
      }

      if (block.id === 'history') {
        return canViewHistory.value
      }

      return true
    }),
  set: (blocks) => {
    reorderProjectFeedBlocks(blocks.map((block) => block.id))
  }
})

const orderedUserNotes = computed({
  get: () => currentUserNotes.value,
  set: (notes) => {
    reorderProjectNotes(notes.map((note) => note.id))
  }
})

const isFeedBlockCollapsed = (blockId: ProjectFeedBlockId) =>
  collapsedFeedBlocks.value.includes(blockId)

const hasFeedBlockContent = (blockId: ProjectFeedBlockId) => {
  if (blockId === 'comments') {
    return canCreateComments.value || currentProjectComments.value.length > 0
  }

  if (blockId === 'notes') {
    return true
  }

  return currentProjectHistory.value.length > 0
}

const toggleFeedBlock = (blockId: ProjectFeedBlockId) => {
  if (!hasFeedBlockContent(blockId)) {
    return
  }

  collapsedFeedBlocks.value = isFeedBlockCollapsed(blockId)
    ? collapsedFeedBlocks.value.filter((item) => item !== blockId)
    : [...collapsedFeedBlocks.value, blockId]
}

const canOpenFeedWindow = (blockId: ProjectFeedBlockId) =>
  blockId === 'notes' || blockId === 'comments'

const openFeedWindow = (blockId: ProjectFeedBlockId) => {
  if (!canOpenFeedWindow(blockId)) {
    return
  }

  feedWindowBlockId.value = blockId
  feedWindowText.value = ''
}

const closeFeedWindow = () => {
  feedWindowBlockId.value = ''
  feedWindowText.value = ''
}

const feedWindowTitle = computed(() => {
  if (feedWindowBlockId.value === 'comments') {
    return 'Комментарии'
  }

  if (feedWindowBlockId.value === 'notes') {
    return 'Заметки'
  }

  return ''
})

const canSubmitFeedWindow = computed(() =>
  feedWindowBlockId.value === 'notes' ||
  (feedWindowBlockId.value === 'comments' && canCreateComments.value)
)

const feedWindowItemsCount = computed(() => {
  if (feedWindowBlockId.value === 'comments') {
    return currentProjectComments.value.length
  }

  if (feedWindowBlockId.value === 'notes') {
    return currentUserNotes.value.length
  }

  return 0
})

const feedWindowEmptyText = computed(() =>
  feedWindowBlockId.value === 'comments' ? 'Комментариев пока нет' : 'Заметок пока нет'
)

const canShowFeedContextMenu = computed(() => {
  if (!feedContextMenu.value) {
    return false
  }

  if (feedContextMenu.value.type === 'note') {
    return true
  }

  return canEditComments.value || canDeleteComments.value
})

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))

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

const submitFeedWindow = () => {
  if (feedWindowBlockId.value === 'comments' && createProjectComment(feedWindowText.value)) {
    feedWindowText.value = ''
    return
  }

  if (feedWindowBlockId.value === 'notes' && createProjectNote(feedWindowText.value, selectedNoteColor.value)) {
    feedWindowText.value = ''
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
}

const closeEditNoteModal = () => {
  editingNote.value = null
  noteFormText.value = ''
}

const submitEditNote = () => {
  if (!editingNote.value) {
    return
  }

  if (updateProjectNote(editingNote.value.id, noteFormText.value)) {
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

const closeFeedContextMenuByKeyboard = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeFeedContextMenu()
  }
}

onMounted(() => {
  window.addEventListener('click', closeFeedContextMenu)
  window.addEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.addEventListener('scroll', closeFeedContextMenu, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeFeedContextMenu)
  window.removeEventListener('keydown', closeFeedContextMenuByKeyboard)
  window.removeEventListener('scroll', closeFeedContextMenu, true)
})
</script>

<template>
  <aside class="comments-panel">
    <VueDraggable
      v-model="orderedFeedBlocks"
      class="comments-panel__blocks"
      handle=".settings-section__drag"
      :animation="180"
    >
      <BaseWorkspaceBlock
        v-for="block in orderedFeedBlocks"
        :key="block.id"
        class="comments-panel__section"
        :title="block.title"
        :collapsed="isFeedBlockCollapsed(block.id)"
        :toggle-disabled="!hasFeedBlockContent(block.id)"
        @toggle="toggleFeedBlock(block.id)"
      >
        <template v-if="canOpenFeedWindow(block.id)" #actions>
          <BaseIconButton
            label="Вывести в окне"
            icon="maximize"
            @click="openFeedWindow(block.id)"
          />
        </template>

        <ProjectFeedBlock
          v-if="block.id === 'comments' && !isFeedBlockCollapsed(block.id) && hasFeedBlockContent(block.id)"
          :framed="false"
          form-position="bottom"
          :has-items="currentProjectComments.length > 0"
          empty-text="Комментариев пока нет"
        >
          <template v-if="canCreateComments" #form>
            <form class="comments-panel__form" @submit.prevent="submitComment">
              <label class="comments-panel__composer">
                <textarea
                  v-model="commentText"
                  class="field__control comments-panel__input"
                  rows="1"
                  aria-label="Комментарий"
                  placeholder="Напишите комментарий"
                />
                <button class="button button--small comments-panel__send" type="submit" aria-label="Отправить" title="Отправить">
                  <BaseIcon class="comments-panel__send-icon" name="send" />
                </button>
              </label>
            </form>
          </template>

          <ProjectFeedCard
            v-for="comment in currentProjectComments"
            :key="comment.id"
            :author="getUserNameById(comment.authorId)"
            :date="formatDateTime(comment.createdAt)"
            :text="comment.text"
            actions-mode="context"
            readonly
            @context="openCommentContextMenu(comment, $event)"
          >
            <template #actions>
              <BaseIconButton
                v-if="canEditComments"
                label="Изменить комментарий"
                icon="edit"
                @click="openEditCommentModal(comment)"
              />
              <BaseIconButton
                v-if="canDeleteComments"
                label="Удалить комментарий"
                icon="close"
                tone="danger"
                @click="deletingComment = comment"
              />
            </template>
          </ProjectFeedCard>
        </ProjectFeedBlock>

        <ProjectFeedBlock
          v-else-if="block.id === 'notes' && !isFeedBlockCollapsed(block.id)"
          :framed="false"
          form-position="bottom"
          :has-items="currentUserNotes.length > 0"
          empty-text="Заметок пока нет"
        >
          <template #form>
            <form class="comments-panel__form" @submit.prevent="submitNote">
              <label class="comments-panel__composer">
                <textarea
                  v-model="noteText"
                  class="field__control comments-panel__input"
                  rows="1"
                  aria-label="Заметка"
                  placeholder="Напишите заметку для себя"
                />
                <button class="button button--small comments-panel__send" type="submit" aria-label="Отправить" title="Отправить">
                  <BaseIcon class="comments-panel__send-icon" name="send" />
                </button>
              </label>
              <div class="comments-panel__note-palette" aria-label="Цвет заметки">
                <button
                  v-for="color in notePaletteColors"
                  :key="color.label"
                  class="comments-panel__note-color"
                  :class="{ 'comments-panel__note-color--active': selectedNoteColor === color.value }"
                  type="button"
                  :style="{ background: color.value || 'var(--color-surface-muted)' }"
                  :aria-label="`Выбрать цвет ${color.label}`"
                  @click="selectedNoteColor = color.value"
                />
              </div>
            </form>
          </template>

          <VueDraggable
            v-model="orderedUserNotes"
            class="comments-panel__notes-list"
            handle=".project-feed-card__drag"
            :animation="180"
          >
            <ProjectFeedCard
              v-for="note in orderedUserNotes"
              :key="note.id"
              author=""
              :date="formatDateTime(note.updatedAt)"
              :text="note.text"
              :color="note.color"
              actions-mode="context"
              draggable
              hide-author
              readonly
              @context="openNoteContextMenu(note, $event)"
            />
          </VueDraggable>
        </ProjectFeedBlock>

        <ProjectFeedBlock
          v-else-if="block.id === 'history' && !isFeedBlockCollapsed(block.id) && hasFeedBlockContent(block.id)"
          :framed="false"
          :has-items="currentProjectHistory.length > 0"
          empty-text="История пока пуста"
        >
          <ProjectFeedCard
            v-for="entry in currentProjectHistory"
            :key="entry.id"
            :author="getUserNameById(entry.authorId)"
            :date="formatDateTime(entry.createdAt)"
            :text="entry.action"
            variant="history"
            readonly
          />
        </ProjectFeedBlock>
      </BaseWorkspaceBlock>
    </VueDraggable>

    <BaseModal
      v-if="feedWindowBlockId"
      :title="feedWindowTitle"
      size="wide"
      @close="closeFeedWindow"
    >
      <div class="comments-panel__window">
        <form class="comments-panel__window-form" @submit.prevent="submitFeedWindow">
          <label class="comments-panel__window-composer">
            <textarea
              v-model="feedWindowText"
              class="field__control comments-panel__window-input"
              rows="12"
              :disabled="!canSubmitFeedWindow"
              :aria-label="feedWindowTitle"
              :placeholder="feedWindowBlockId === 'comments' ? 'Напишите комментарий' : 'Напишите заметку для себя'"
            />
            <button
              class="button button--small comments-panel__send comments-panel__window-send"
              type="submit"
              :disabled="!canSubmitFeedWindow"
              aria-label="Отправить"
              title="Отправить"
            >
              <BaseIcon class="comments-panel__send-icon" name="send" />
            </button>
          </label>
          <div
            v-if="feedWindowBlockId === 'notes'"
            class="comments-panel__note-palette"
            aria-label="Цвет заметки"
          >
            <button
              v-for="color in notePaletteColors"
              :key="color.label"
              class="comments-panel__note-color"
              :class="{ 'comments-panel__note-color--active': selectedNoteColor === color.value }"
              type="button"
              :style="{ background: color.value || 'var(--color-surface-muted)' }"
              :aria-label="`Выбрать цвет ${color.label}`"
              @click="selectedNoteColor = color.value"
            />
          </div>
        </form>

        <div class="comments-panel__window-list">
          <div v-if="feedWindowItemsCount === 0" class="project-feed-block__empty">
            {{ feedWindowEmptyText }}
          </div>

          <ProjectFeedCard
            v-for="comment in feedWindowBlockId === 'comments' ? currentProjectComments : []"
            :key="comment.id"
            :author="getUserNameById(comment.authorId)"
            :date="formatDateTime(comment.createdAt)"
            :text="comment.text"
            readonly
          >
            <template #actions>
              <BaseIconButton
                v-if="canEditComments"
                label="Изменить комментарий"
                icon="edit"
                @click="openEditCommentModal(comment)"
              />
              <BaseIconButton
                v-if="canDeleteComments"
                label="Удалить комментарий"
                icon="close"
                tone="danger"
                @click="deletingComment = comment"
              />
            </template>
          </ProjectFeedCard>

          <ProjectFeedCard
            v-for="note in feedWindowBlockId === 'notes' ? currentUserNotes : []"
            :key="note.id"
            author=""
            :date="formatDateTime(note.updatedAt)"
            :text="note.text"
            :color="note.color"
            hide-author
            @edit="openEditNoteModal(note)"
            @remove="deletingNote = note"
          />
        </div>
      </div>
    </BaseModal>

    <div
      v-if="canShowFeedContextMenu && feedContextMenu"
      :key="feedContextMenuKey"
      ref="feedContextMenuElement"
      class="comments-panel__context-menu"
      :style="{ left: `${feedContextMenu.x}px`, top: `${feedContextMenu.y}px` }"
      @click.stop
    >
      <button
        v-if="feedContextMenu.type === 'note' || canEditComments"
        class="comments-panel__context-action"
        type="button"
        @click="editContextMenuItem"
      >
        <BaseIcon class="comments-panel__context-icon" name="edit" />
        <span>Изменить</span>
      </button>
      <button
        v-if="feedContextMenu.type === 'note' || canDeleteComments"
        class="comments-panel__context-action comments-panel__context-action--danger"
        type="button"
        @click="removeContextMenuItem"
      >
        <BaseIcon class="comments-panel__context-icon" name="trash" />
        <span>Удалить</span>
      </button>
    </div>

    <BaseModal v-if="editingComment" title="Изменить комментарий" @close="closeEditCommentModal">
      <form id="comment-edit-form" class="modal-form" @submit.prevent="submitEditComment">
        <label class="field">
          <span class="field__label">Комментарий</span>
          <textarea v-model="commentFormText" class="field__control" rows="5" required />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="comment-edit-form">Сохранить</button>
        <button class="button button--secondary" type="button" @click="closeEditCommentModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="editingNote" title="Изменить заметку" @close="closeEditNoteModal">
      <form id="note-edit-form" class="modal-form" @submit.prevent="submitEditNote">
        <label class="field">
          <span class="field__label">Заметка</span>
          <textarea v-model="noteFormText" class="field__control" rows="5" required />
        </label>
      </form>

      <template #footer>
        <button class="button button--primary" type="submit" form="note-edit-form">Сохранить</button>
        <button class="button button--secondary" type="button" @click="closeEditNoteModal">Отменить</button>
      </template>
    </BaseModal>

    <BaseModal v-if="deletingComment" title="Удалить комментарий?" @close="deletingComment = null">
      <div class="modal-confirm">
        <p class="modal-confirm__text">Комментарий будет удалён. Это действие нельзя отменить.</p>
      </div>

      <template #footer>
        <button class="button button--danger" type="button" @click="confirmDeleteComment">Удалить</button>
        <button class="button button--secondary" type="button" @click="deletingComment = null">Отменить</button>
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
