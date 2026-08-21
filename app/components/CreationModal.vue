<script setup lang="ts">
import type { BriefQuestionType, ProjectStage } from '~/composables/useProjectStore'

const { activeType, closeCreationModal } = useCreationModal()
const { briefQuestionTypes, createBrief, createChecklist, projectStages } = useProjectStore()

const optionTypes: BriefQuestionType[] = ['radio', 'checkbox', 'select', 'multiselect']

const createChecklistForm = () => ({
  title: '',
  stage: 'Согласование' as ProjectStage,
  items: [
    {
      text: '',
      required: true
    }
  ]
})

const createBriefForm = () => ({
  title: '',
  stage: 'Согласование' as ProjectStage,
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

const resetChecklistForm = () => {
  Object.assign(checklistForm, createChecklistForm())
}

const resetBriefForm = () => {
  Object.assign(briefForm, createBriefForm())
}

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

  createChecklist({
    title: checklistForm.title.trim(),
    stage: checklistForm.stage,
    items
  })

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

  createBrief({
    title: briefForm.title.trim(),
    stage: briefForm.stage,
    questions
  })

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
        <div class="section-header">
          <h2 class="section-title">Создать чеклист</h2>
          <button class="button button--secondary" type="button" @click="closeModal">Закрыть</button>
        </div>

        <label class="field">
          <span class="field__label">Название</span>
          <input v-model="checklistForm.title" class="field__control" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">Этап</span>
          <select v-model="checklistForm.stage" class="field__control">
            <option v-for="stage in projectStages" :key="stage" :value="stage">{{ stage }}</option>
          </select>
        </label>

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
              class="button button--secondary"
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

        <button class="button button--primary" type="submit">Создать чеклист</button>
      </form>

      <form v-else class="creation-form" @submit.prevent="submitBrief">
        <div class="section-header">
          <h2 class="section-title">Создать бриф</h2>
          <button class="button button--secondary" type="button" @click="closeModal">Закрыть</button>
        </div>

        <label class="field">
          <span class="field__label">Название</span>
          <input v-model="briefForm.title" class="field__control" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">Этап</span>
          <select v-model="briefForm.stage" class="field__control">
            <option v-for="stage in projectStages" :key="stage" :value="stage">{{ stage }}</option>
          </select>
        </label>

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

            <label class="field">
              <span class="field__label">Тип поля</span>
              <select v-model="question.type" class="field__control">
                <option v-for="type in briefQuestionTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">Пояснение</span>
              <input v-model="question.description" class="field__control" type="text" />
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
              class="button button--secondary"
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

        <button class="button button--primary" type="submit">Создать бриф</button>
      </form>
    </div>
  </div>
</template>
