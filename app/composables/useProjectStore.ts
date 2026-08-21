export const projectStages = ['Согласование', 'Дизайн', 'Разработка', 'Деплой', 'Поддержка'] as const

export const briefQuestionTypes = [
  'text',
  'textarea',
  'radio',
  'checkbox',
  'select',
  'multiselect',
  'number',
  'date',
  'file'
] as const

export type ProjectStage = (typeof projectStages)[number]
export type BriefQuestionType = (typeof briefQuestionTypes)[number]
export type ChecklistItemStatus = 'pending' | 'completed' | 'skipped'
export type BriefStatus = 'draft'

export interface ChecklistItem {
  id: string
  text: string
  required: boolean
  status: ChecklistItemStatus
  comment: string
  assignee: string
  completedAt: string
}

export interface Checklist {
  id: string
  title: string
  stage: ProjectStage
  items: ChecklistItem[]
  createdAt: string
}

export interface BriefQuestion {
  id: string
  text: string
  type: BriefQuestionType
  required: boolean
  description: string
  options: string[]
}

export interface Brief {
  id: string
  title: string
  stage: ProjectStage
  status: BriefStatus
  questions: BriefQuestion[]
  createdAt: string
}

interface ProjectData {
  checklists: Checklist[]
  briefs: Brief[]
}

interface ChecklistPayload {
  title: string
  stage: ProjectStage
  items: Array<{
    text: string
    required: boolean
  }>
}

interface BriefPayload {
  title: string
  stage: ProjectStage
  questions: Array<{
    text: string
    type: BriefQuestionType
    required: boolean
    description: string
    options: string[]
  }>
}

const storageKey = 'brief-os-project-data'

const createId = () => {
  if (import.meta.client && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const createInitialData = (): ProjectData => ({
  checklists: [],
  briefs: []
})

export const useProjectStore = () => {
  const data = useState<ProjectData>('project-data', createInitialData)
  const isLoaded = useState('project-data-loaded', () => false)
  const hasWatcher = useState('project-data-watcher', () => false)

  const load = () => {
    if (!import.meta.client || isLoaded.value) {
      return
    }

    const savedData = window.localStorage.getItem(storageKey)

    if (savedData) {
      data.value = JSON.parse(savedData) as ProjectData
    }

    isLoaded.value = true
  }

  const save = () => {
    if (!import.meta.client || !isLoaded.value) {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(data.value))
  }

  onMounted(() => {
    load()

    if (!hasWatcher.value) {
      watch(data, save, { deep: true })
      hasWatcher.value = true
    }
  })

  const createChecklist = (payload: ChecklistPayload) => {
    const checklist: Checklist = {
      id: createId(),
      title: payload.title,
      stage: payload.stage,
      createdAt: new Date().toISOString(),
      items: payload.items.map((item) => ({
        id: createId(),
        text: item.text,
        required: item.required,
        status: 'pending',
        comment: '',
        assignee: '',
        completedAt: ''
      }))
    }

    data.value.checklists = [checklist, ...data.value.checklists]
  }

  const createBrief = (payload: BriefPayload) => {
    const brief: Brief = {
      id: createId(),
      title: payload.title,
      stage: payload.stage,
      status: 'draft',
      createdAt: new Date().toISOString(),
      questions: payload.questions.map((question) => ({
        id: createId(),
        text: question.text,
        type: question.type,
        required: question.required,
        description: question.description,
        options: question.options
      }))
    }

    data.value.briefs = [brief, ...data.value.briefs]
  }

  const getChecklistsByStage = (stage: ProjectStage) =>
    computed(() => data.value.checklists.filter((checklist) => checklist.stage === stage))

  const getBriefsByStage = (stage: ProjectStage) =>
    computed(() => data.value.briefs.filter((brief) => brief.stage === stage))

  return {
    data,
    projectStages,
    briefQuestionTypes,
    createChecklist,
    createBrief,
    getChecklistsByStage,
    getBriefsByStage
  }
}
