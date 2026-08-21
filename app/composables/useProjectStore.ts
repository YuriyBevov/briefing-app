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
export type BriefStatus = 'draft' | 'sent_to_manager'

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

const briefStatusLabels: Record<BriefStatus, string> = {
  draft: 'Черновик',
  sent_to_manager: 'Отправлен менеджеру'
}

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

  const updateChecklist = (id: string, payload: ChecklistPayload) => {
    const checklist = data.value.checklists.find((item) => item.id === id)

    if (!checklist) {
      return
    }

    checklist.title = payload.title
    checklist.stage = payload.stage
    checklist.items = payload.items.map((item, index) => {
      const currentItem = checklist.items[index]

      return {
        id: currentItem?.id ?? createId(),
        text: item.text,
        required: item.required,
        status: currentItem?.status ?? 'pending',
        comment: currentItem?.comment ?? '',
        assignee: currentItem?.assignee ?? '',
        completedAt: currentItem?.completedAt ?? ''
      }
    })
  }

  const deleteChecklist = (id: string) => {
    data.value.checklists = data.value.checklists.filter((checklist) => checklist.id !== id)
  }

  const updateChecklistItemStatus = (
    checklistId: string,
    itemId: string,
    status: ChecklistItemStatus
  ) => {
    const checklist = data.value.checklists.find((item) => item.id === checklistId)
    const checklistItem = checklist?.items.find((item) => item.id === itemId)

    if (!checklistItem) {
      return
    }

    checklistItem.status = status
    checklistItem.completedAt = status === 'completed' ? new Date().toISOString() : ''
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

  const updateBrief = (id: string, payload: BriefPayload) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    brief.title = payload.title
    brief.stage = payload.stage
    brief.questions = payload.questions.map((question, index) => ({
      id: brief.questions[index]?.id ?? createId(),
      text: question.text,
      type: question.type,
      required: question.required,
      description: question.description,
      options: question.options
    }))
  }

  const deleteBrief = (id: string) => {
    data.value.briefs = data.value.briefs.filter((brief) => brief.id !== id)
  }

  const updateBriefStatus = (id: string, status: BriefStatus) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    brief.status = status
  }

  const getChecklistsByStage = (stage: ProjectStage) =>
    computed(() => data.value.checklists.filter((checklist) => checklist.stage === stage))

  const getBriefsByStage = (stage: ProjectStage) =>
    computed(() => data.value.briefs.filter((brief) => brief.stage === stage))

  return {
    data,
    projectStages,
    briefQuestionTypes,
    briefStatusLabels,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    updateChecklistItemStatus,
    createBrief,
    updateBrief,
    deleteBrief,
    updateBriefStatus,
    getChecklistsByStage,
    getBriefsByStage
  }
}
