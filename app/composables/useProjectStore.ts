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
export type BriefStatus = 'draft' | 'link_created' | 'completed'
export type BriefLinkStatus = 'pending' | 'completed' | 'revision_pending' | 'revision_completed' | 'in_work' | 'archived'
export type BriefAnswerValue = string | string[]

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
  links: BriefLink[]
  answers: Record<string, BriefAnswerValue>
  createdAt: string
  completedAt: string
}

export interface BriefLink {
  id: string
  historyId: string
  title: string
  token: string
  status: BriefLinkStatus
  answers: Record<string, BriefAnswerValue>
  createdAt: string
  completedAt: string
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
const forceDeletedBriefTokens = new Set([
  '1d3edbaf2a864c3abf58a05761001e0f'
])

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
  link_created: 'Ожидает заполнения',
  completed: 'Заполнен'
}

const briefLinkStatusLabels: Record<BriefLinkStatus, string> = {
  pending: 'Ожидает заполнения',
  completed: 'Согласован',
  revision_pending: 'Ожидает редакции',
  revision_completed: 'Отредактирован и согласован',
  in_work: 'В работе',
  archived: 'Архив'
}

const createToken = () => createId().replaceAll('-', '')

const normalizeData = (projectData: ProjectData): ProjectData => ({
  checklists: (projectData.checklists ?? []).map((checklist) => ({
    ...checklist,
    items: checklist.items.map((item) => ({
      ...item,
      comment: item.comment ?? ''
    }))
  })),
  briefs: (projectData.briefs ?? [])
    .filter((brief) => !brief.links?.some((link) => forceDeletedBriefTokens.has(link.token)))
    .map((brief) => {
      const legacyAnswers = brief.answers ?? {}
      const hasLegacyAnswers = Object.keys(legacyAnswers).length > 0
      const links = (brief.links ?? []).map((link, index) => {
        const shouldUseLegacyAnswers = hasLegacyAnswers && index === 0 && !link.answers
        const legacyStatus = link.status as BriefLinkStatus | 'approved' | undefined
        const status = legacyStatus === 'approved'
          ? 'in_work'
          : legacyStatus ?? (shouldUseLegacyAnswers || brief.status === 'completed' ? 'completed' : 'pending')
        const historyId = link.historyId ?? link.id

        return {
          ...link,
          historyId,
          title: link.title ?? '',
          status,
          answers: link.answers ?? (shouldUseLegacyAnswers ? legacyAnswers : {}),
          completedAt: link.completedAt ?? (shouldUseLegacyAnswers ? brief.completedAt ?? '' : '')
        }
      })
      const status = links.length ? 'link_created' : 'draft'

      return {
        ...brief,
        status,
        links,
        answers: legacyAnswers,
        completedAt: brief.completedAt ?? ''
      }
    })
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
      data.value = normalizeData(JSON.parse(savedData) as ProjectData)
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
    save()
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
    save()
  }

  const deleteChecklist = (id: string) => {
    data.value.checklists = data.value.checklists.filter((checklist) => checklist.id !== id)
    save()
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
    save()
  }

  const updateChecklistItemComment = (checklistId: string, itemId: string, comment: string) => {
    const checklist = data.value.checklists.find((item) => item.id === checklistId)
    const checklistItem = checklist?.items.find((item) => item.id === itemId)

    if (!checklistItem || checklistItem.status !== 'pending') {
      return
    }

    checklistItem.comment = comment
    save()
  }

  const createBrief = (payload: BriefPayload) => {
    const brief: Brief = {
      id: createId(),
      title: payload.title,
      stage: payload.stage,
      status: 'draft',
      createdAt: new Date().toISOString(),
      links: [],
      answers: {},
      completedAt: '',
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
    save()
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
    save()
  }

  const deleteBrief = (id: string) => {
    data.value.briefs = data.value.briefs.filter((brief) => brief.id !== id)
    save()
  }

  const updateBriefStatus = (id: string, status: BriefStatus) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    brief.status = status
    save()
  }

  const createBriefClientLink = (id: string) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return ''
    }

    const token = createToken()

    const linkId = createId()

    brief.links = [
      {
        id: linkId,
        historyId: linkId,
        title: '',
        token,
        status: 'pending',
        answers: {},
        createdAt: new Date().toISOString(),
        completedAt: ''
      },
      ...brief.links
    ]
    brief.status = 'link_created'
    save()

    return token
  }

  const getBriefByToken = (token: string) =>
    computed(() => data.value.briefs.find((brief) => brief.links.some((link) => link.token === token)))

  const getBriefLinkByToken = (token: string) =>
    computed(() => {
      const brief = data.value.briefs.find((item) => item.links.some((link) => link.token === token))
      const link = brief?.links.find((item) => item.token === token)

      if (!brief || !link) {
        return null
      }

      return {
        brief,
        link
      }
    })

  const completeBriefByToken = (token: string, answers: Record<string, BriefAnswerValue>) => {
    const brief = data.value.briefs.find((item) => item.links.some((link) => link.token === token))
    const link = brief?.links.find((item) => item.token === token)

    if (!brief || !link || link.status === 'in_work' || link.status === 'archived') {
      return false
    }

    link.answers = answers
    link.status = link.status === 'revision_pending' ? 'revision_completed' : 'completed'
    link.completedAt = new Date().toISOString()
    brief.status = 'link_created'
    save()

    return true
  }

  const createBriefRevisionLink = (briefId: string, linkId: string) => {
    const brief = data.value.briefs.find((item) => item.id === briefId)
    const link = brief?.links.find((item) => item.id === linkId)

    if (
      !brief ||
      !link ||
      link.status === 'pending' ||
      link.status === 'revision_pending' ||
      link.status === 'archived'
    ) {
      return ''
    }

    const token = createToken()
    const historyId = link.historyId ?? link.id
    const linkIndex = brief.links.findIndex((item) => item.id === linkId)
    link.status = 'archived'
    link.historyId = historyId
    brief.links.splice(linkIndex, 0, {
      id: createId(),
      historyId,
      title: link.title,
      token,
      status: 'revision_pending',
      answers: { ...link.answers },
      createdAt: new Date().toISOString(),
      completedAt: ''
    })
    brief.status = 'link_created'
    save()

    return token
  }

  const acceptBriefLinkToWork = (briefId: string, linkId: string) => {
    const brief = data.value.briefs.find((item) => item.id === briefId)
    const link = brief?.links.find((item) => item.id === linkId)

    if (!brief || !link || (link.status !== 'completed' && link.status !== 'revision_completed')) {
      return
    }

    link.status = 'in_work'
    save()
  }

  const updateBriefLinkTitle = (briefId: string, linkId: string, title: string) => {
    const brief = data.value.briefs.find((item) => item.id === briefId)
    const link = brief?.links.find((item) => item.id === linkId)

    if (!link || link.status === 'archived') {
      return
    }

    link.title = title.trim()
    save()
  }

  const deleteBriefLink = (briefId: string, linkId: string) => {
    const brief = data.value.briefs.find((item) => item.id === briefId)
    const link = brief?.links.find((item) => item.id === linkId)

    if (!brief || !link) {
      return
    }

    const historyId = link.historyId ?? link.id

    brief.links = brief.links.filter((item) => (item.historyId ?? item.id) !== historyId)
    brief.status = brief.links.length ? 'link_created' : 'draft'
    save()
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
    briefLinkStatusLabels,
    isLoaded,
    load,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    updateChecklistItemStatus,
    updateChecklistItemComment,
    createBrief,
    updateBrief,
    deleteBrief,
    updateBriefStatus,
    createBriefClientLink,
    getBriefByToken,
    getBriefLinkByToken,
    completeBriefByToken,
    createBriefRevisionLink,
    acceptBriefLinkToWork,
    updateBriefLinkTitle,
    deleteBriefLink,
    getChecklistsByStage,
    getBriefsByStage
  }
}
