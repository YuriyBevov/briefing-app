<script setup lang="ts">
import type { BriefAnswerValue, BriefQuestion } from '~/composables/useProjectStore'

definePageMeta({
  layout: false
})

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))
const { completeBriefByToken, getBriefByToken, isLoaded, load } = useProjectStore()
const brief = getBriefByToken(token.value)
const answers = reactive<Record<string, BriefAnswerValue>>({})
const isSubmitted = ref(false)

const optionTypes = ['radio', 'checkbox', 'select', 'multiselect']

const setAnswer = (questionId: string, value: BriefAnswerValue) => {
  answers[questionId] = value
}

const getTextAnswer = (questionId: string) => {
  const value = answers[questionId]

  return typeof value === 'string' ? value : ''
}

const getListAnswer = (questionId: string) => {
  const value = answers[questionId]

  return Array.isArray(value) ? value : []
}

const toggleListAnswer = (questionId: string, option: string) => {
  const currentAnswer = getListAnswer(questionId)

  if (currentAnswer.includes(option)) {
    setAnswer(
      questionId,
      currentAnswer.filter((item) => item !== option)
    )
    return
  }

  setAnswer(questionId, [...currentAnswer, option])
}

const isOptionChecked = (questionId: string, option: string) => getListAnswer(questionId).includes(option)

const isQuestionCompleted = (question: BriefQuestion) => {
  if (!question.required) {
    return true
  }

  const answer = answers[question.id]

  if (Array.isArray(answer)) {
    return answer.length > 0
  }

  return Boolean(answer)
}

const canSubmit = computed(() =>
  brief.value ? brief.value.questions.every((question) => isQuestionCompleted(question)) : false
)

const submitBrief = () => {
  if (!canSubmit.value) {
    return
  }

  isSubmitted.value = completeBriefByToken(token.value, { ...answers })
}

onMounted(() => {
  load()
})
</script>

<template>
  <main class="public-brief-page">
    <section v-if="!isLoaded" class="public-brief">
      <div class="section-header">
        <h1 class="page-title">Бриф загружается</h1>
      </div>
    </section>

    <section v-else-if="brief" class="public-brief">
      <div class="section-header">
        <h1 class="page-title">{{ brief.title }}</h1>
      </div>

      <form v-if="!isSubmitted" class="public-brief__form" @submit.prevent="submitBrief">
        <div
          v-for="question in brief.questions"
          :key="question.id"
          class="public-brief__question"
        >
          <span class="public-brief__question-title">{{ question.text }}</span>
          <span v-if="question.description" class="public-brief__description">
            {{ question.description }}
          </span>

          <label v-if="question.type === 'textarea'" class="field">
            <span class="field__label">Ответ</span>
            <textarea
              class="field__control"
              :required="question.required"
              :value="getTextAnswer(question.id)"
              @input="setAnswer(question.id, ($event.target as HTMLTextAreaElement).value)"
            />
          </label>

          <label v-else-if="question.type === 'select'" class="field">
            <span class="field__label">Ответ</span>
            <select
              class="field__control"
              :required="question.required"
              :value="getTextAnswer(question.id)"
              @change="setAnswer(question.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Выберите ответ</option>
              <option v-for="option in question.options" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>

          <label v-else-if="question.type === 'multiselect'" class="field">
            <span class="field__label">Ответ</span>
            <select
              class="field__control"
              multiple
              :required="question.required"
              @change="
                setAnswer(
                  question.id,
                  Array.from(($event.target as HTMLSelectElement).selectedOptions).map((option) => option.value)
                )
              "
            >
              <option v-for="option in question.options" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>

          <div v-else-if="question.type === 'radio'" class="choice-list">
            <label v-for="option in question.options" :key="option" class="switch-field">
              <input
                class="switch-field__control"
                type="radio"
                :name="question.id"
                :required="question.required"
                :checked="getTextAnswer(question.id) === option"
                @change="setAnswer(question.id, option)"
              />
              <span class="switch-field__label">{{ option }}</span>
            </label>
          </div>

          <div v-else-if="question.type === 'checkbox'" class="choice-list">
            <label v-for="option in question.options" :key="option" class="switch-field">
              <input
                class="switch-field__control"
                type="checkbox"
                :checked="isOptionChecked(question.id, option)"
                @change="toggleListAnswer(question.id, option)"
              />
              <span class="switch-field__label">{{ option }}</span>
            </label>
          </div>

          <label v-else class="field">
            <span class="field__label">Ответ</span>
            <input
              class="field__control"
              :type="question.type === 'file' ? 'text' : question.type"
              :required="question.required"
              :value="getTextAnswer(question.id)"
              @input="setAnswer(question.id, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <button class="button button--primary" type="submit" :disabled="!canSubmit">Согласовать</button>
      </form>

      <p v-else class="card-description">Бриф заполнен</p>
    </section>

    <section v-else class="public-brief">
      <div class="section-header">
        <h1 class="page-title">Бриф не найден</h1>
      </div>
    </section>
  </main>
</template>
