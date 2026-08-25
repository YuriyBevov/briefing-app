<script setup lang="ts">
import type { BriefQuestionType, EntityScope } from '~/composables/useProjectStore'

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
const sectionOptions = computed(() =>
  activeSections.value.map((section) => ({
    value: section.id,
    label: section.title
  }))
)
const scopeOptions = [
  { value: 'common', label: 'Общий' },
  { value: 'project', label: 'Проектный' }
]
const questionTypeOptions = computed(() =>
  briefQuestionTypes.map((type) => ({
    value: type,
    label: briefQuestionTypeLabels[type]
  }))
)

const createChecklistForm = () => ({
  title: '',
  sectionIds: getDefaultSectionIds(),
  scope: 'common' as EntityScope,
  items: [
    {
      text: '',
      required: true
    }
  ]
})

const createBriefForm = () => ({
  title: '',
  sectionIds: getDefaultSectionIds(),
  scope: 'common' as EntityScope,
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

const normalizeFormSectionIds = (sectionIds: string[]) => {
  const activeSectionIds = new Set(activeSections.value.map((section) => section.id))
  const normalizedSectionIds = [...new Set(sectionIds)].filter((sectionId) =>
    activeSectionIds.has(sectionId)
  )

  return normalizedSectionIds.length ? normalizedSectionIds : getDefaultSectionIds()
}

const fillChecklistForm = (id: string) => {
  const checklist = data.value.checklists.find((item) => item.id === id)

  if (!checklist) {
    resetChecklistForm()
    return
  }

  checklistForm.title = checklist.title
  checklistForm.sectionIds = getEntitySectionIds(checklist)
  checklistForm.scope = checklist.scope
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
  briefForm.sectionIds = getEntitySectionIds(brief)
  briefForm.scope = brief.scope
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
    sectionIds: normalizeFormSectionIds(checklistForm.sectionIds),
    scope: checklistForm.scope,
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
    sectionIds: normalizeFormSectionIds(briefForm.sectionIds),
    scope: briefForm.scope,
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
  <div v-if="activeType" class="creation-modal" role="dialog" aria-modal="true">
    <div class="creation-modal__panel">
      <form
        v-if="activeType === 'checklist'"
        class="creation-form"
        @submit.prevent="submitChecklist"
      >
        <div class="section-header creation-form__header">
          <h2 class="section-title">{{ modalTitle }}</h2>
          <BaseModalCloseButton @click="closeModal" />
        </div>

        <div class="creation-form__body">
          <label class="field">
            <span class="field__label">Название</span>
            <input v-model="checklistForm.title" class="field__control" type="text" required />
          </label>

          <div class="creation-form__field-row">
            <div class="field">
              <span class="field__label">Раздел</span>
              <BaseMultiSelect
                v-model="checklistForm.sectionIds"
                :options="sectionOptions"
                placeholder="Выберите разделы"
              />
            </div>

            <div class="field">
              <span class="field__label">Тип</span>
              <BaseSelect v-model="checklistForm.scope" :options="scopeOptions" />
            </div>
          </div>

          <div class="creation-form__group">
            <span class="creation-form__group-title">Пункты</span>

            <div
              v-for="(item, index) in checklistForm.items"
              :key="index"
              class="creation-form__row"
            >
              <label class="field">
                <span class="field__label">Текст</span>
                <input v-model="item.text" class="field__control" type="text" required />
              </label>

              <label class="switch-field">
                <input v-model="item.required" class="switch-field__control" type="checkbox" />
                <span class="switch-field__label">Обязательный пункт</span>
              </label>

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
        </div>

        <div class="creation-form__footer">
          <button class="button button--primary" type="submit">
            {{ isEditing ? 'Сохранить чеклист' : 'Создать чеклист' }}
          </button>
        </div>
      </form>

      <form v-else class="creation-form" @submit.prevent="submitBrief">
        <div class="section-header creation-form__header">
          <h2 class="section-title">{{ modalTitle }}</h2>
          <BaseModalCloseButton @click="closeModal" />
        </div>

        <div class="creation-form__body">
          <label class="field">
            <span class="field__label">Название</span>
            <input v-model="briefForm.title" class="field__control" type="text" required />
          </label>

          <div class="creation-form__field-row">
            <div class="field">
              <span class="field__label">Раздел</span>
              <BaseMultiSelect
                v-model="briefForm.sectionIds"
                :options="sectionOptions"
                placeholder="Выберите разделы"
              />
            </div>

            <div class="field">
              <span class="field__label">Тип</span>
              <BaseSelect v-model="briefForm.scope" :options="scopeOptions" />
            </div>
          </div>

          <div class="creation-form__group">
            <span class="creation-form__group-title">Вопросы</span>

            <div
              v-for="(question, index) in briefForm.questions"
              :key="index"
              class="creation-form__row"
            >
              <label class="field">
                <span class="field__label">Текст вопроса</span>
                <input v-model="question.text" class="field__control" type="text" required />
              </label>

              <div class="field">
                <span class="field__label">Тип поля</span>
                <BaseSelect v-model="question.type" :options="questionTypeOptions" />
              </div>

              <label class="field">
                <span class="field__label">Описание</span>
                <textarea v-model="question.description" class="field__control" rows="3" />
              </label>

              <label v-if="optionTypes.includes(question.type)" class="field">
                <span class="field__label">Варианты ответа</span>
                <textarea v-model="question.optionsText" class="field__control" rows="4" />
              </label>

              <label class="switch-field">
                <input v-model="question.required" class="switch-field__control" type="checkbox" />
                <span class="switch-field__label">Обязательный вопрос</span>
              </label>

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
        </div>

        <div class="creation-form__footer">
          <button class="button button--primary" type="submit">
            {{ isEditing ? 'Сохранить бриф' : 'Создать бриф' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
