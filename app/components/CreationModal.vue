<script setup lang="ts">
import type { BriefQuestionType, EntitySectionPlacement } from '~/composables/useProjectStore'

const { activeType, closeCreationModal, editingId } = useCreationModal()
const {
  briefQuestionTypeLabels,
  briefQuestionTypes,
  createBrief,
  createChecklist,
  data,
  updateBrief,
  updateChecklist
} = useProjectStore()

const optionTypes: BriefQuestionType[] = ['radio', 'checkbox', 'select', 'multiselect']
const activeSections = computed(() => data.value.sections.filter((section) => section.isActive))
const getDefaultSectionId = () => activeSections.value[0]?.id ?? data.value.sections[0]?.id ?? ''
const getDefaultSectionIds = () => {
  const sectionId = getDefaultSectionId()

  return sectionId ? [sectionId] : []
}
const getDefaultSectionPlacements = (): EntitySectionPlacement[] =>
  getDefaultSectionIds().map((sectionId) => ({
    sectionId,
    scope: 'common'
  }))
const sectionOptions = computed(() =>
  activeSections.value.map((section) => ({
    value: section.id,
    label: section.title
  }))
)
const questionTypeOptions = computed(() =>
  briefQuestionTypes.map((type) => ({
    value: type,
    label: briefQuestionTypeLabels[type]
  }))
)

const createChecklistForm = () => ({
  title: '',
  sectionPlacements: getDefaultSectionPlacements(),
  items: [
    {
      text: '',
      required: true
    }
  ]
})

const createBriefForm = () => ({
  title: '',
  sectionPlacements: getDefaultSectionPlacements(),
  questions: [
    {
      text: '',
      type: 'text' as BriefQuestionType,
      required: true,
      description: '',
      optionsText: ''
    }
  ]
})

const checklistForm = reactive(createChecklistForm())
const briefForm = reactive(createBriefForm())
const isEditing = computed(() => Boolean(editingId.value))

const modalTitle = computed(() => {
  if (activeType.value === 'checklist') {
    return isEditing.value ? 'Редактировать чеклист' : 'Создать чеклист'
  }

  return isEditing.value ? 'Редактировать бриф' : 'Создать бриф'
})

const resetChecklistForm = () => {
  Object.assign(checklistForm, createChecklistForm())
}

const resetBriefForm = () => {
  Object.assign(briefForm, createBriefForm())
}

const getEntitySectionIds = (entity: { sectionId?: string; sectionIds?: string[] }) => {
  if (entity.sectionIds?.length) {
    return [...entity.sectionIds]
  }

  return entity.sectionId ? [entity.sectionId] : getDefaultSectionIds()
}

const getEntitySectionPlacements = (entity: {
  sectionId?: string
  sectionIds?: string[]
  sectionPlacements?: EntitySectionPlacement[]
  scope?: EntitySectionPlacement['scope']
}) => {
  if (entity.sectionPlacements?.length) {
    return entity.sectionPlacements.map((placement) => ({ ...placement }))
  }

  return getEntitySectionIds(entity).map((sectionId) => ({
    sectionId,
    scope: entity.scope ?? 'common'
  }))
}

const normalizeFormSectionPlacements = (placements: EntitySectionPlacement[]) => {
  const activeSectionIds = new Set(activeSections.value.map((section) => section.id))
  const normalizedPlacements = [...new Map(
    placements
      .filter((placement) => activeSectionIds.has(placement.sectionId))
      .map((placement) => [placement.sectionId, placement])
  ).values()]

  return normalizedPlacements.length ? normalizedPlacements : getDefaultSectionPlacements()
}

const syncChecklistPlacements = () => {
  checklistForm.sectionPlacements = normalizeFormSectionPlacements(checklistForm.sectionPlacements)
}

const syncBriefPlacements = () => {
  briefForm.sectionPlacements = normalizeFormSectionPlacements(briefForm.sectionPlacements)
}

watch(
  activeSections,
  () => {
    syncChecklistPlacements()
    syncBriefPlacements()
  }
)

const getPlacementPayload = (placements: EntitySectionPlacement[]) =>
  normalizeFormSectionPlacements(placements).map((placement) => ({
    sectionId: placement.sectionId,
    scope: placement.scope
  }))

const fillChecklistForm = (id: string) => {
  const checklist = data.value.checklists.find((item) => item.id === id)

  if (!checklist) {
    resetChecklistForm()
    return
  }

  checklistForm.title = checklist.title
  checklistForm.sectionPlacements = getEntitySectionPlacements(checklist)
  checklistForm.items = checklist.items.map((item) => ({
    text: item.text,
    required: item.required
  }))
}

const fillBriefForm = (id: string) => {
  const brief = data.value.briefs.find((item) => item.id === id)

  if (!brief) {
    resetBriefForm()
    return
  }

  briefForm.title = brief.title
  briefForm.sectionPlacements = getEntitySectionPlacements(brief)
  briefForm.questions = brief.questions.map((question) => ({
    text: question.text,
    type: question.type,
    required: question.required,
    description: question.description,
    optionsText: question.options.join('\n')
  }))
}

watch(
  [activeType, editingId],
  ([type, id]) => {
    if (type === 'checklist' && id) {
      fillChecklistForm(id)
      return
    }

    if (type === 'brief' && id) {
      fillBriefForm(id)
      return
    }

    if (type === 'checklist') {
      resetChecklistForm()
    }

    if (type === 'brief') {
      resetBriefForm()
    }
  },
  { immediate: true }
)

const addChecklistItem = () => {
  checklistForm.items.push({
    text: '',
    required: true
  })
}

const removeChecklistItem = (index: number) => {
  if (checklistForm.items.length === 1) {
    return
  }

  checklistForm.items.splice(index, 1)
}

const addBriefQuestion = () => {
  briefForm.questions.push({
    text: '',
    type: 'text',
    required: true,
    description: '',
    optionsText: ''
  })
}

const removeBriefQuestion = (index: number) => {
  if (briefForm.questions.length === 1) {
    return
  }

  briefForm.questions.splice(index, 1)
}

const closeModal = () => {
  closeCreationModal()
}

const submitChecklist = () => {
  const items = checklistForm.items
    .map((item) => ({
      text: item.text.trim(),
      required: item.required
    }))
    .filter((item) => item.text)

  if (!checklistForm.title.trim() || items.length === 0) {
    return
  }

  const payload = {
    title: checklistForm.title.trim(),
    sectionPlacements: getPlacementPayload(checklistForm.sectionPlacements),
    items
  }

  if (editingId.value) {
    updateChecklist(editingId.value, payload)
  } else {
    createChecklist(payload)
  }

  resetChecklistForm()
  closeCreationModal()
}

const submitBrief = () => {
  const questions = briefForm.questions
    .map((question) => ({
      text: question.text.trim(),
      type: question.type,
      required: question.required,
      description: question.description.trim(),
      options: question.optionsText
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean)
    }))
    .filter((question) => question.text)

  if (!briefForm.title.trim() || questions.length === 0) {
    return
  }

  const payload = {
    title: briefForm.title.trim(),
    sectionPlacements: getPlacementPayload(briefForm.sectionPlacements),
    questions
  }

  if (editingId.value) {
    updateBrief(editingId.value, payload)
  } else {
    createBrief(payload)
  }

  resetBriefForm()
  closeCreationModal()
}
</script>

<template>
  <BaseModal v-if="activeType" :title="modalTitle" @close="closeModal">
    <form
      v-if="activeType === 'checklist'"
      id="checklist-creation-form"
      class="modal-form"
      @submit.prevent="submitChecklist"
    >
      <label class="field">
        <span class="field__label">Название</span>
        <input v-model="checklistForm.title" class="field__control" type="text" required />
      </label>

      <div class="field">
        <span class="field__label">Раздел</span>
        <BasePlacementSelect
          v-model="checklistForm.sectionPlacements"
          :options="sectionOptions"
          placeholder="Выберите разделы"
        />
      </div>

      <div class="modal-form__group">
        <span class="modal-form__group-title">Пункты</span>

        <div
          v-for="(item, index) in checklistForm.items"
          :key="index"
          class="modal-form__row"
        >
          <label class="field">
            <span class="field__label">Текст</span>
            <input v-model="item.text" class="field__control" type="text" required />
          </label>

          <BaseCheckbox v-model="item.required" label="Обязательный пункт" />

          <button
            class="button button--danger"
            type="button"
            :disabled="checklistForm.items.length === 1"
            @click="removeChecklistItem(index)"
          >
            Удалить
          </button>
        </div>

        <button class="button button--secondary" type="button" @click="addChecklistItem">
          Добавить пункт
        </button>
      </div>
    </form>

    <form v-else id="brief-creation-form" class="modal-form" @submit.prevent="submitBrief">
      <label class="field">
        <span class="field__label">Название</span>
        <input v-model="briefForm.title" class="field__control" type="text" required />
      </label>

      <div class="field">
        <span class="field__label">Раздел</span>
        <BasePlacementSelect
          v-model="briefForm.sectionPlacements"
          :options="sectionOptions"
          placeholder="Выберите разделы"
        />
      </div>

      <div class="modal-form__group">
        <span class="modal-form__group-title">Вопросы</span>

        <div
          v-for="(question, index) in briefForm.questions"
          :key="index"
          class="modal-form__row"
        >
          <div class="modal-form__field-row modal-form__field-row--question">
            <label class="field">
              <span class="field__label">Текст вопроса</span>
              <input v-model="question.text" class="field__control" type="text" required />
            </label>

            <div class="field">
              <span class="field__label">Тип поля</span>
              <BaseSelect v-model="question.type" :options="questionTypeOptions" />
            </div>
          </div>

          <label class="field">
            <span class="field__label">Описание</span>
            <textarea v-model="question.description" class="field__control" rows="3" />
          </label>

          <label v-if="optionTypes.includes(question.type)" class="field">
            <span class="field__label">Варианты ответа</span>
            <textarea v-model="question.optionsText" class="field__control" rows="4" />
          </label>

          <BaseCheckbox v-model="question.required" label="Обязательный вопрос" />

          <button
            class="button button--danger"
            type="button"
            :disabled="briefForm.questions.length === 1"
            @click="removeBriefQuestion(index)"
          >
            Удалить
          </button>
        </div>

        <button class="button button--secondary" type="button" @click="addBriefQuestion">
          Добавить вопрос
        </button>
      </div>
    </form>

    <template #footer>
      <button
        v-if="activeType === 'checklist'"
        class="button button--primary"
        type="submit"
        form="checklist-creation-form"
      >
        {{ isEditing ? 'Сохранить чеклист' : 'Создать чеклист' }}
      </button>

      <button
        v-else
        class="button button--primary"
        type="submit"
        form="brief-creation-form"
      >
        {{ isEditing ? 'Сохранить бриф' : 'Создать бриф' }}
      </button>
    </template>
  </BaseModal>
</template>
