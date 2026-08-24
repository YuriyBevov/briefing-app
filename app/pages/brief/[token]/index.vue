<script setup lang="ts">
import type { BriefAnswerValue, BriefQuestion } from '~/composables/useProjectStore'

definePageMeta({
  layout: false
})

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))
const { completeBriefByToken, getBriefLinkByToken, isLoaded, load } = useProjectStore()
const briefAccess = getBriefLinkByToken(token.value)
const brief = computed(() => briefAccess.value?.brief ?? null)
const briefLink = computed(() => briefAccess.value?.link ?? null)
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

const isReadonly = computed(() =>
  briefLink.value?.status === 'completed' || briefLink.value?.status === 'in_work' || isSubmitted.value
)

const submitBrief = () => {
  if (!canSubmit.value || briefLink.value?.status === 'in_work') {
    return
  }

  isSubmitted.value = completeBriefByToken(token.value, { ...answers })
}

const getReadonlyAnswer = (questionId: string) => {
  const answer = briefLink.value?.answers[questionId]

  if (Array.isArray(answer)) {
    return answer.length ? answer.join(', ') : 'Нет ответа'
  }

  return answer || 'Нет ответа'
}

onMounted(() => {
  load()
})

watch(
  briefLink,
  (link) => {
    if (!link) {
      return
    }

    Object.keys(answers).forEach((key) => {
      delete answers[key]
    })
    Object.assign(answers, link.answers)
    isSubmitted.value = false
  },
  { immediate: true }
)
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

      <div v-if="isReadonly" class="public-brief__form">
        <div
          v-for="question in brief.questions"
          :key="question.id"
          class="public-brief__question"
        >
          <span class="public-brief__question-title">{{ question.text }}</span>
          <span class="public-brief__answer">{{ getReadonlyAnswer(question.id) }}</span>
        </div>
      </div>

      <form v-else class="public-brief__form" @submit.prevent="submitBrief">
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
              <option
                v-for="option in question.options"
                :key="option"
                :value="option"
                :selected="isOptionChecked(question.id, option)"
              >
                {{ option }}
              </option>
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

    </section>

    <section v-else class="public-brief">
      <div class="section-header">
        <h1 class="page-title">Бриф не найден</h1>
      </div>
    </section>
  </main>
</template>
