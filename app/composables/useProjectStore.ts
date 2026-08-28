export const defaultProjectSections = [
  { id: 'section-approval', title: 'Согласование', slug: 'approval', description: 'Сбор и согласование стартовых материалов.' },
  { id: 'section-design', title: 'Дизайн', slug: 'design', description: 'Работа над визуальной частью проекта.' },
  { id: 'section-development', title: 'Разработка', slug: 'development', description: 'Реализация и сборка проекта.' },
  { id: 'section-deploy', title: 'Деплой', slug: 'deploy', description: 'Подготовка и публикация проекта.' },
  { id: 'section-support', title: 'Поддержка', slug: 'support', description: 'Сопровождение после запуска.' }
] as const
export const entityScopes = ['project', 'common'] as const
export const systemPermissionIds = [
  'create_briefs',
  'edit_briefs',
  'delete_briefs',
  'create_brief_links',
  'reopen_brief_links',
  'create_checklists',
  'edit_checklists',
  'delete_checklists',
  'view_ui_components',
  'view_settings',
  'create_projects',
  'edit_projects',
  'delete_projects',
  'create_sections',
  'edit_sections',
  'delete_sections',
  'create_comments',
  'view_comments',
  'edit_comments',
  'delete_comments',
  'view_history'
] as const

export const briefQuestionTypes = [
  'text',
  'textarea',
  'radio',
  'checkbox',
  'select',
  'multiselect',
  'date'
] as const

export const briefQuestionTypeLabels: Record<(typeof briefQuestionTypes)[number], string> = {
  text: 'текст',
  textarea: 'поле для комментария',
  radio: 'радиокнопки',
  checkbox: 'чекбокс',
  select: 'выпадающий список',
  multiselect: 'выпадающий список(множ.)',
  date: 'выбор даты'
}

export type EntityScope = (typeof entityScopes)[number]
export type BriefQuestionType = (typeof briefQuestionTypes)[number]
export type ChecklistItemStatus = 'pending' | 'completed' | 'skipped'
export type BriefStatus = 'draft' | 'link_created' | 'completed'
export type BriefLinkStatus = 'pending' | 'completed' | 'revision_pending' | 'revision_completed' | 'in_work' | 'archived'
export type BriefAnswerValue = string | string[]
export type SystemPermissionId = string

export interface EntitySectionPlacement {
  sectionId: string
  scope: EntityScope
}

export interface Project {
  id: string
  title: string
  sortOrder: number
  createdAt: string
}

export interface ProjectSection {
  id: string
  title: string
  slug: string
  description: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface Permission {
  id: SystemPermissionId
  title: string
  description: string
}

export interface Role {
  id: string
  title: string
  system: boolean
  permissionIds: SystemPermissionId[]
  sortOrder: number
  createdAt: string
}

export interface User {
  id: string
  name: string
  login: string
  email: string
  password: string
  roleIds: string[]
  projectIds: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
}

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
  sectionId?: string
  sectionIds: string[]
  sectionPlacements: EntitySectionPlacement[]
  stage?: string
  scope: EntityScope
  projectId: string
  sortOrder: number
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
  sectionId?: string
  sectionIds: string[]
  sectionPlacements: EntitySectionPlacement[]
  stage?: string
  scope: EntityScope
  projectId: string
  sortOrder: number
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

export interface ProjectComment {
  id: string
  projectId: string
  authorId: string
  text: string
  createdAt: string
  editedAt: string
}

export interface ProjectHistoryEntry {
  id: string
  projectId: string
  authorId: string
  action: string
  createdAt: string
}

export interface ProjectNote {
  id: string
  projectId: string
  authorId: string
  text: string
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface ProjectData {
  projects: Project[]
  currentProjectId: string
  workspaceBlockOrder: string[]
  projectFeedBlockOrder: string[]
  sections: ProjectSection[]
  permissions: Permission[]
  roles: Role[]
  users: User[]
  currentUserId: string
  checklists: Checklist[]
  briefs: Brief[]
  comments: ProjectComment[]
  history: ProjectHistoryEntry[]
  notes: ProjectNote[]
}

interface ChecklistPayload {
  title: string
  sectionPlacements: EntitySectionPlacement[]
  items: Array<{
    text: string
    required: boolean
  }>
}

interface BriefPayload {
  title: string
  sectionPlacements: EntitySectionPlacement[]
  questions: Array<{
    text: string
    type: BriefQuestionType
    required: boolean
    description: string
    options: string[]
  }>
}

interface UserPayload {
  name: string
  login: string
  email: string
  password: string
  roleIds: string[]
  projectIds: string[]
  isActive: boolean
}

interface RolePayload {
  title: string
  permissionIds: SystemPermissionId[]
}

interface ProjectPayload {
  title: string
  userIds: string[]
}

interface SectionPayload {
  title: string
  description: string
}

const storageKey = 'brief-os-project-data'
const defaultProjectId = 'project-brief-os'
const adminRoleId = 'role-admin'
const defaultAdminUserId = 'user-admin'
const defaultDesignerUserId = 'user-designer'
const forceDeletedBriefTokens = new Set([
  '1d3edbaf2a864c3abf58a05761001e0f'
])

const createId = () => {
  if (import.meta.client && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const createDefaultProject = (): Project => ({
  id: defaultProjectId,
  title: 'Brief OS',
  sortOrder: 0,
  createdAt: '2026-08-25T00:00:00.000Z'
})

const createDefaultSections = (): ProjectSection[] =>
  defaultProjectSections.map((section, index) => ({
    ...section,
    isActive: true,
    sortOrder: index,
    createdAt: '2026-08-25T00:00:00.000Z'
  }))

const getSectionPermissionId = (sectionId: string) => `view_section_${sectionId}`

const createSectionPermission = (section: ProjectSection): Permission => ({
  id: getSectionPermissionId(section.id),
  title: `Доступ к разделу ${section.title}`,
  description: `Разрешает видеть раздел ${section.title} в меню и работать с его содержимым.`
})

const createStaticPermissions = (): Permission[] => [
  {
    id: 'create_briefs',
    title: 'Создание брифов',
    description: 'Разрешает создавать брифы.'
  },
  {
    id: 'edit_briefs',
    title: 'Редактирование брифов',
    description: 'Разрешает редактировать брифы.'
  },
  {
    id: 'delete_briefs',
    title: 'Удаление брифов',
    description: 'Разрешает удалять брифы.'
  },
  {
    id: 'create_brief_links',
    title: 'Создание ссылок на бриф',
    description: 'Разрешает создавать клиентские ссылки на бриф.'
  },
  {
    id: 'reopen_brief_links',
    title: 'Повторное открытие ссылки на бриф',
    description: 'Разрешает повторно открывать клиентскую ссылку на бриф для редакции.'
  },
  {
    id: 'create_checklists',
    title: 'Создание чеклистов',
    description: 'Разрешает создавать чеклисты.'
  },
  {
    id: 'edit_checklists',
    title: 'Редактирование чеклистов',
    description: 'Разрешает редактировать чеклисты.'
  },
  {
    id: 'delete_checklists',
    title: 'Удаление чеклистов',
    description: 'Разрешает удалять чеклисты.'
  },
  {
    id: 'view_ui_components',
    title: 'Видит блок UI-компонентов',
    description: 'Разрешает видеть пункт UI-компонентов в меню и открывать страницу дизайн-системы.'
  },
  {
    id: 'view_settings',
    title: 'Видит блок с настройками',
    description: 'Разрешает видеть пункт настроек в меню и открывать страницу настроек.'
  },
  {
    id: 'create_projects',
    title: 'Создание проектов',
    description: 'Разрешает создавать проекты.'
  },
  {
    id: 'edit_projects',
    title: 'Редактирование проектов',
    description: 'Разрешает редактировать проекты.'
  },
  {
    id: 'delete_projects',
    title: 'Удаление проектов',
    description: 'Разрешает удалять проекты.'
  },
  {
    id: 'create_sections',
    title: 'Создание разделов',
    description: 'Разрешает создавать разделы.'
  },
  {
    id: 'edit_sections',
    title: 'Редактирование разделов',
    description: 'Разрешает редактировать разделы.'
  },
  {
    id: 'delete_sections',
    title: 'Удаление разделов',
    description: 'Разрешает удалять разделы.'
  },
  {
    id: 'create_comments',
    title: 'Создание комментариев',
    description: 'Разрешает добавлять комментарии в проект.'
  },
  {
    id: 'view_comments',
    title: 'Просмотр комментариев',
    description: 'Разрешает видеть общий блок комментариев проекта.'
  },
  {
    id: 'edit_comments',
    title: 'Редактирование своих комментариев',
    description: 'Разрешает редактировать свои комментарии проекта.'
  },
  {
    id: 'delete_comments',
    title: 'Удаление своих комментариев',
    description: 'Разрешает удалять свои комментарии проекта.'
  },
  {
    id: 'view_history',
    title: 'Просмотр истории',
    description: 'Разрешает видеть журнал изменений проекта.'
  }
]

const createDefaultPermissions = (sections: ProjectSection[] = createDefaultSections()): Permission[] => [
  ...createStaticPermissions(),
  ...sections.map(createSectionPermission)
]

const createAdminRole = (sections: ProjectSection[] = createDefaultSections()): Role => ({
  id: adminRoleId,
  title: 'Администратор',
  system: true,
  permissionIds: createDefaultPermissions(sections).map((permission) => permission.id),
  sortOrder: 0,
  createdAt: '2026-08-25T00:00:00.000Z'
})

const createDefaultAdminUser = (): User => ({
  id: defaultAdminUserId,
  name: 'Администратор',
  login: 'admin',
  email: 'admin@brief-os.local',
  password: 'admin',
  roleIds: [adminRoleId],
  projectIds: [defaultProjectId],
  isActive: true,
  sortOrder: 0,
  createdAt: '2026-08-25T00:00:00.000Z'
})

const createDefaultDesignerUser = (): User => ({
  id: defaultDesignerUserId,
  name: 'Александр Островский',
  login: 'alexander',
  email: 'alexander@brief-os.local',
  password: 'alexander',
  roleIds: [],
  projectIds: [defaultProjectId],
  isActive: true,
  sortOrder: 1,
  createdAt: '2026-08-25T00:00:00.000Z'
})

const createDefaultComments = (): ProjectComment[] => [
  {
    id: 'comment-default-incoming',
    projectId: defaultProjectId,
    authorId: defaultDesignerUserId,
    text: 'Посмотрел материалы, нужен доступ к макету.',
    createdAt: '2026-08-26T11:33:00.000Z',
    editedAt: ''
  }
]

const createInitialData = (): ProjectData => ({
  projects: [createDefaultProject()],
  currentProjectId: defaultProjectId,
  workspaceBlockOrder: ['checklists', 'briefs'],
  projectFeedBlockOrder: ['comments', 'notes', 'history'],
  sections: createDefaultSections(),
  permissions: createDefaultPermissions(),
  roles: [createAdminRole()],
  users: [createDefaultAdminUser(), createDefaultDesignerUser()],
  currentUserId: defaultAdminUserId,
  checklists: [],
  briefs: [],
  comments: createDefaultComments(),
  history: [],
  notes: []
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

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || createId()

const normalizeSections = (sections: ProjectSection[] = []) => {
  const fallbackSections = createDefaultSections()
  const sourceSections = sections.length ? sections : fallbackSections

  return sourceSections
    .map((section, index) => ({
      ...section,
      id: section.id || createId(),
      title: section.title || fallbackSections[index]?.title || 'Новый раздел',
      slug: section.slug || createSlug(section.title || fallbackSections[index]?.title || 'Новый раздел'),
      description: section.description ?? fallbackSections[index]?.description ?? '',
      isActive: section.isActive ?? true,
      sortOrder: section.sortOrder ?? index,
      createdAt: section.createdAt ?? new Date().toISOString()
    }))
    .toSorted((firstSection, secondSection) =>
      firstSection.sortOrder - secondSection.sortOrder ||
      new Date(firstSection.createdAt).getTime() - new Date(secondSection.createdAt).getTime()
    )
    .map((section, index) => ({
      ...section,
      sortOrder: index
    }))
}

const normalizePermissions = (permissions: Permission[] = [], sections: ProjectSection[]) => {
  const savedPermissions = new Map(permissions.map((permission) => [permission.id, permission]))

  return createDefaultPermissions(sections).map((permission) => savedPermissions.get(permission.id) ?? permission)
}

const normalizeRoles = (roles: Role[] = [], permissions: Permission[]) => {
  const savedRoles = new Map(roles.map((role) => [role.id, role]))
  const permissionIds = permissions.map((permission) => permission.id)
  const savedAdminRole = savedRoles.get(adminRoleId)
  const adminRole = {
    ...createAdminRole(),
    ...(savedAdminRole ?? {}),
    id: adminRoleId,
    title: 'Администратор',
    system: true,
    permissionIds,
    sortOrder: savedAdminRole?.sortOrder ?? 0
  }
  const customRoles = roles
    .filter((role) => role.id !== adminRoleId)
    .map((role, index) => ({
      ...role,
      system: false,
      sortOrder: role.sortOrder ?? index + 1,
      permissionIds: (role.permissionIds ?? []).filter((permissionId) =>
        permissionIds.includes(permissionId)
      )
    }))

  return [adminRole, ...customRoles]
    .toSorted((firstRole, secondRole) =>
      firstRole.sortOrder - secondRole.sortOrder ||
      new Date(firstRole.createdAt).getTime() - new Date(secondRole.createdAt).getTime()
    )
    .map((role, index) => ({
      ...role,
      sortOrder: index
    }))
}

const normalizeUsers = (users: User[] = [], projects: Project[]) => {
  const defaultAdmin = createDefaultAdminUser()
  const defaultDesigner = createDefaultDesignerUser()
  const savedUsers = users.length ? users : [defaultAdmin]
  const usersWithDefaults = savedUsers.some((user) => user.id === defaultDesignerUserId)
    ? savedUsers
    : [...savedUsers, defaultDesigner]

  const normalizedUsers = usersWithDefaults.map((user, index) => ({
    ...defaultAdmin,
    ...user,
    roleIds: user.roleIds?.length ? user.roleIds : [],
    projectIds: user.projectIds?.length ? user.projectIds : projects.map((project) => project.id),
    isActive: user.isActive ?? true,
    sortOrder: user.sortOrder ?? index,
    createdAt: user.createdAt ?? new Date().toISOString()
  }))
  const hasAdmin = normalizedUsers.some((user) => user.roleIds.includes(adminRoleId))

  if (!hasAdmin) {
    const activeUser = normalizedUsers.find((user) => user.isActive) ?? normalizedUsers[0]
    activeUser.roleIds = [...new Set([...activeUser.roleIds, adminRoleId])]
    activeUser.projectIds = projects.map((project) => project.id)
  }

  return normalizedUsers
    .toSorted((firstUser, secondUser) =>
      firstUser.sortOrder - secondUser.sortOrder ||
      new Date(firstUser.createdAt).getTime() - new Date(secondUser.createdAt).getTime()
    )
    .map((user, index) => ({
      ...user,
      sortOrder: index
    }))
}

const normalizeProjects = (projects: Project[] = []) =>
  (projects.length ? projects : [createDefaultProject()])
    .map((project, index) => ({
      ...project,
      id: project.id || createId(),
      title: project.title || 'Новый проект',
      sortOrder: project.sortOrder ?? index,
      createdAt: project.createdAt ?? new Date().toISOString()
    }))
    .toSorted((firstProject, secondProject) =>
      firstProject.sortOrder - secondProject.sortOrder ||
      new Date(firstProject.createdAt).getTime() - new Date(secondProject.createdAt).getTime()
    )
    .map((project, index) => ({
      ...project,
      sortOrder: index
    }))

const normalizeData = (projectData: Partial<ProjectData>): ProjectData => {
  const projects = normalizeProjects(projectData.projects)
  const sections = normalizeSections(projectData.sections)
  const permissions = normalizePermissions(projectData.permissions, sections)
  const supportedWorkspaceBlockIds = ['checklists', 'briefs']
  const supportedProjectFeedBlockIds = ['comments', 'notes', 'history']
  const orderedWorkspaceBlockIds = (projectData.workspaceBlockOrder ?? supportedWorkspaceBlockIds)
    .filter((blockId) => supportedWorkspaceBlockIds.includes(blockId))
  const workspaceBlockOrder = [
    ...orderedWorkspaceBlockIds,
    ...supportedWorkspaceBlockIds.filter((blockId) => !orderedWorkspaceBlockIds.includes(blockId))
  ]
  const orderedProjectFeedBlockIds = (projectData.projectFeedBlockOrder ?? supportedProjectFeedBlockIds)
    .filter((blockId) => supportedProjectFeedBlockIds.includes(blockId))
  const projectFeedBlockOrder = [
    ...orderedProjectFeedBlockIds,
    ...supportedProjectFeedBlockIds.filter((blockId) => !orderedProjectFeedBlockIds.includes(blockId))
  ]
  const projectIds = new Set(projects.map((project) => project.id))
  const sectionIds = new Set(sections.map((section) => section.id))
  const sectionByTitle = new Map(sections.map((section) => [section.title, section]))
  const getNormalizedSectionIds = (item: { sectionId?: string; sectionIds?: string[]; stage?: string }) => {
    const normalizedSectionIds = [...new Set(item.sectionIds ?? [])].filter((sectionId) =>
      sectionIds.has(sectionId)
    )

    if (normalizedSectionIds.length) {
      return normalizedSectionIds
    }

    if (item.sectionId && sectionIds.has(item.sectionId)) {
      return [item.sectionId]
    }

    if (item.stage && sectionByTitle.has(item.stage)) {
      return [sectionByTitle.get(item.stage)?.id ?? sections[0].id]
    }

    return [sections[0].id]
  }
  const getNormalizedSectionPlacements = (item: {
    sectionId?: string
    sectionIds?: string[]
    sectionPlacements?: EntitySectionPlacement[]
    stage?: string
    scope?: EntityScope
  }) => {
    const normalizedSectionIds = getNormalizedSectionIds(item)
    const placementBySectionId = new Map(
      (item.sectionPlacements ?? [])
        .filter((placement) => sectionIds.has(placement.sectionId))
        .map((placement) => [placement.sectionId, placement])
    )

    return normalizedSectionIds.map((sectionId) => ({
      sectionId,
      scope: placementBySectionId.get(sectionId)?.scope ?? item.scope ?? 'common'
    }))
  }
  const currentProjectId = projectIds.has(projectData.currentProjectId ?? '')
    ? projectData.currentProjectId as string
    : projects[0].id
  const roles = normalizeRoles(projectData.roles, permissions)
  const users = normalizeUsers(projectData.users, projects)
  const currentUserId = users.some((user) => user.id === projectData.currentUserId)
    ? projectData.currentUserId as string
    : users[0].id
  const savedComments = projectData.comments ?? []
  const commentsWithDefaults = [
    ...savedComments,
    ...createDefaultComments().filter((comment) =>
      !savedComments.some((savedComment) => savedComment.id === comment.id)
    )
  ]

  return {
    projects,
    currentProjectId,
    workspaceBlockOrder,
    projectFeedBlockOrder,
    sections,
    permissions,
    roles,
    users,
    currentUserId,
    checklists: (projectData.checklists ?? [])
      .toSorted((firstChecklist, secondChecklist) =>
        (firstChecklist.sortOrder ?? Number.POSITIVE_INFINITY) -
          (secondChecklist.sortOrder ?? Number.POSITIVE_INFINITY) ||
        new Date(secondChecklist.createdAt).getTime() - new Date(firstChecklist.createdAt).getTime()
      )
      .map((checklist, index) => ({
        ...checklist,
        sectionIds: getNormalizedSectionIds(checklist),
        sectionPlacements: getNormalizedSectionPlacements(checklist),
        scope: checklist.scope ?? 'common',
        projectId: checklist.projectId ?? currentProjectId,
        sortOrder: index,
        items: checklist.items.map((item) => ({
          ...item,
          comment: item.comment ?? ''
        }))
      })),
    briefs: (projectData.briefs ?? [])
      .filter((brief) => !brief.links?.some((link) => forceDeletedBriefTokens.has(link.token)))
      .toSorted((firstBrief, secondBrief) =>
        (firstBrief.sortOrder ?? Number.POSITIVE_INFINITY) -
          (secondBrief.sortOrder ?? Number.POSITIVE_INFINITY) ||
        new Date(secondBrief.createdAt).getTime() - new Date(firstBrief.createdAt).getTime()
      )
      .map((brief, index) => {
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
          sectionIds: getNormalizedSectionIds(brief),
          sectionPlacements: getNormalizedSectionPlacements(brief),
          scope: brief.scope ?? 'common',
          projectId: brief.projectId ?? currentProjectId,
          sortOrder: index,
          status,
          links,
          answers: legacyAnswers,
          completedAt: brief.completedAt ?? ''
        }
      }),
    comments: commentsWithDefaults
      .filter((comment) => projectIds.has(comment.projectId ?? currentProjectId))
      .map((comment) => ({
        ...comment,
        projectId: comment.projectId ?? currentProjectId,
        authorId: comment.authorId ?? currentUserId,
        text: comment.text ?? '',
        createdAt: comment.createdAt ?? new Date().toISOString(),
        editedAt: comment.editedAt ?? ''
      }))
      .toSorted((firstComment, secondComment) =>
        new Date(secondComment.createdAt).getTime() - new Date(firstComment.createdAt).getTime()
      ),
    history: (projectData.history ?? [])
      .filter((entry) => projectIds.has(entry.projectId ?? currentProjectId))
      .map((entry) => ({
        ...entry,
        projectId: entry.projectId ?? currentProjectId,
        authorId: entry.authorId ?? currentUserId,
        action: entry.action ?? '',
        createdAt: entry.createdAt ?? new Date().toISOString()
      }))
      .toSorted((firstEntry, secondEntry) =>
        new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime()
      ),
    notes: (projectData.notes ?? [])
      .filter((note) => projectIds.has(note.projectId ?? currentProjectId))
      .map((note, index) => ({
        ...note,
        projectId: note.projectId ?? currentProjectId,
        authorId: note.authorId ?? currentUserId,
        text: note.text ?? '',
        color: note.color ?? '',
        sortOrder: note.sortOrder ?? index,
        createdAt: note.createdAt ?? new Date().toISOString(),
        updatedAt: note.updatedAt ?? note.createdAt ?? new Date().toISOString()
      }))
      .toSorted((firstNote, secondNote) =>
        firstNote.sortOrder - secondNote.sortOrder ||
        new Date(secondNote.createdAt).getTime() - new Date(firstNote.createdAt).getTime()
      )
  }
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

  const currentProject = computed(() =>
    data.value.projects.find((project) => project.id === data.value.currentProjectId) ?? data.value.projects[0]
  )

  const currentUser = computed(() =>
    data.value.users.find((user) => user.id === data.value.currentUserId) ?? data.value.users[0]
  )

  const currentUserRoles = computed(() =>
    data.value.roles.filter((role) => currentUser.value?.roleIds.includes(role.id))
  )

  const isCurrentUserAdmin = computed(() =>
    currentUserRoles.value.some((role) => role.id === adminRoleId)
  )

  const visibleProjects = computed(() => {
    if (isCurrentUserAdmin.value) {
      return data.value.projects
    }

    const projectIds = new Set(currentUser.value?.projectIds ?? [])

    return data.value.projects.filter((project) => projectIds.has(project.id))
  })

  const canUsePermission = (permissionId: SystemPermissionId) =>
    computed(() => {
      if (isCurrentUserAdmin.value) {
        return true
      }

      return currentUserRoles.value.some((role) => role.permissionIds.includes(permissionId))
    })

  const getUserById = (userId: string) =>
    data.value.users.find((user) => user.id === userId)

  const getUserNameById = (userId: string) =>
    getUserById(userId)?.name ?? 'Пользователь'

  const addProjectHistory = (action: string, projectId = data.value.currentProjectId) => {
    const normalizedAction = action.trim()

    if (!normalizedAction) {
      return
    }

    data.value.history = [
      {
        id: createId(),
        projectId,
        authorId: currentUser.value?.id ?? defaultAdminUserId,
        action: normalizedAction,
        createdAt: new Date().toISOString()
      },
      ...data.value.history
    ]
  }

  const getProjectUserIds = (projectId: string) =>
    data.value.users
      .filter((user) => user.projectIds.includes(projectId))
      .map((user) => user.id)

  const logProjectParticipantsChange = (projectId: string, beforeUserIds: string[]) => {
    const before = new Set(beforeUserIds)
    const after = new Set(getProjectUserIds(projectId))
    const addedUsers = [...after].filter((userId) => !before.has(userId))
    const removedUsers = [...before].filter((userId) => !after.has(userId))

    addedUsers.forEach((userId) => {
      addProjectHistory(`В проект добавлен участник ${getUserNameById(userId)}`, projectId)
    })
    removedUsers.forEach((userId) => {
      addProjectHistory(`Из проекта исключён участник ${getUserNameById(userId)}`, projectId)
    })
  }

  const setCurrentProject = (projectId: string) => {
    const allowedProject = visibleProjects.value.find((project) => project.id === projectId)

    if (!allowedProject) {
      return
    }

    data.value.currentProjectId = projectId
    save()
  }

  const syncProjectUsers = (projectId: string, userIds: string[]) => {
    const selectedUserIds = new Set(userIds)

    data.value.users.forEach((user) => {
      if (user.roleIds.includes(adminRoleId)) {
        user.projectIds = data.value.projects.map((project) => project.id)
        return
      }

      if (!user.isActive) {
        return
      }

      user.projectIds = selectedUserIds.has(user.id)
        ? [...new Set([...user.projectIds, projectId])]
        : user.projectIds.filter((item) => item !== projectId)
    })
  }

  const createProject = (payload: ProjectPayload) => {
    const title = payload.title.trim()

    if (!title) {
      return false
    }

    const project: Project = {
      id: createId(),
      title,
      sortOrder: 0,
      createdAt: new Date().toISOString()
    }

    data.value.projects = [
      project,
      ...data.value.projects
    ].map((item, index) => ({
      ...item,
      sortOrder: index
    }))
    syncProjectUsers(project.id, payload.userIds)
    addProjectHistory(`Создан проект ${project.title}`, project.id)
    logProjectParticipantsChange(project.id, [])
    save()

    return true
  }

  const updateProject = (projectId: string, payload: ProjectPayload) => {
    const project = data.value.projects.find((item) => item.id === projectId)
    const title = payload.title.trim()

    if (!project || !title) {
      return false
    }

    const previousTitle = project.title
    const previousUserIds = getProjectUserIds(projectId)
    project.title = title
    syncProjectUsers(projectId, payload.userIds)
    if (previousTitle !== title) {
      addProjectHistory(`Проект переименован: ${previousTitle} -> ${title}`, projectId)
    }
    logProjectParticipantsChange(projectId, previousUserIds)
    save()

    return true
  }

  const deleteProject = (projectId: string) => {
    if (data.value.projects.length <= 1) {
      return false
    }

    const project = data.value.projects.find((item) => item.id === projectId)

    if (!project) {
      return false
    }

    data.value.projects = data.value.projects
      .filter((item) => item.id !== projectId)
      .map((item, index) => ({
        ...item,
        sortOrder: index
      }))
    data.value.users.forEach((user) => {
      user.projectIds = user.projectIds.filter((item) => item !== projectId)

      if (user.roleIds.includes(adminRoleId)) {
        user.projectIds = data.value.projects.map((item) => item.id)
      }
    })
    data.value.checklists = data.value.checklists.filter((checklist) =>
      checklist.scope === 'common' || checklist.projectId !== projectId
    )
    data.value.briefs = data.value.briefs.filter((brief) =>
      brief.scope === 'common' || brief.projectId !== projectId
    )

    if (data.value.currentProjectId === projectId) {
      data.value.currentProjectId = data.value.projects[0].id
    }

    save()

    return true
  }

  const reorderProjects = (projectIds: string[]) => {
    const projectById = new Map(data.value.projects.map((project) => [project.id, project]))
    const orderedProjects = projectIds
      .map((projectId) => projectById.get(projectId))
      .filter((project): project is Project => Boolean(project))
    const missingProjects = data.value.projects.filter((project) => !projectIds.includes(project.id))

    data.value.projects = [...orderedProjects, ...missingProjects].map((project, index) => ({
      ...project,
      sortOrder: index
    }))
    save()
  }

  const isVisibleInCurrentProject = (entity: { scope: EntityScope, projectId: string }) =>
    entity.scope === 'common' || entity.projectId === data.value.currentProjectId

  const isVisibleInCurrentProjectSection = (
    entity: { sectionPlacements?: EntitySectionPlacement[]; scope: EntityScope; projectId: string },
    sectionId: string
  ) => {
    const placement = entity.sectionPlacements?.find((item) => item.sectionId === sectionId)

    return placement
      ? placement.scope === 'common' || entity.projectId === data.value.currentProjectId
      : isVisibleInCurrentProject(entity)
  }

  const isUserAdmin = (user: User) => user.roleIds.includes(adminRoleId)

  const activeAdminUsers = computed(() =>
    data.value.users.filter((user) => user.isActive && isUserAdmin(user))
  )

  const isOnlyActiveAdmin = (userId: string) =>
    activeAdminUsers.value.length === 1 && activeAdminUsers.value[0].id === userId

  const normalizeUserPayload = (payload: UserPayload) => {
    const roleIds = [...new Set(payload.roleIds)]
    const projectIds = roleIds.includes(adminRoleId)
      ? data.value.projects.map((project) => project.id)
      : [...new Set(payload.projectIds)].filter((projectId) =>
        data.value.projects.some((project) => project.id === projectId)
      )

    return {
      ...payload,
      name: payload.name.trim(),
      login: payload.login.trim(),
      email: payload.email.trim(),
      password: payload.password.trim(),
      roleIds,
      projectIds,
      isActive: payload.isActive
    }
  }

  const createUser = (payload: UserPayload) => {
    const normalizedPayload = normalizeUserPayload(payload)

    if (!normalizedPayload.name || !normalizedPayload.login || !normalizedPayload.password) {
      return false
    }

    const loginExists = data.value.users.some((user) => user.login === normalizedPayload.login)

    if (loginExists) {
      return false
    }

    data.value.users = [
      {
        id: createId(),
        createdAt: new Date().toISOString(),
        sortOrder: 0,
        ...normalizedPayload
      },
      ...data.value.users
    ].map((user, index) => ({
      ...user,
      sortOrder: index
    }))
    save()

    return true
  }

  const updateUser = (userId: string, payload: UserPayload) => {
    const user = data.value.users.find((item) => item.id === userId)

    if (!user) {
      return false
    }

    const normalizedPayload = normalizeUserPayload(payload)
    const loginExists = data.value.users.some((item) =>
      item.id !== userId && item.login === normalizedPayload.login
    )

    if (!normalizedPayload.name || !normalizedPayload.login || !normalizedPayload.password || loginExists) {
      return false
    }

    const removesAdminRole = isUserAdmin(user) && !normalizedPayload.roleIds.includes(adminRoleId)
    const deactivatesAdmin = user.isActive && !normalizedPayload.isActive

    if ((removesAdminRole || deactivatesAdmin) && isOnlyActiveAdmin(userId)) {
      return false
    }

    Object.assign(user, normalizedPayload)
    save()

    return true
  }

  const setFallbackCurrentUser = () => {
    const fallbackUser = data.value.users.find((user) => user.isActive)

    if (fallbackUser) {
      data.value.currentUserId = fallbackUser.id
    }
  }

  const deleteUser = (userId: string) => {
    const user = data.value.users.find((item) => item.id === userId)

    if (!user || (user.isActive && isOnlyActiveAdmin(userId))) {
      return false
    }

    data.value.users = data.value.users
      .filter((item) => item.id !== userId)
      .map((item, index) => ({
        ...item,
        sortOrder: index
      }))

    if (data.value.currentUserId === userId) {
      setFallbackCurrentUser()
    }

    save()

    return true
  }

  const deactivateUser = (userId: string) => {
    const user = data.value.users.find((item) => item.id === userId)

    if (!user || !user.isActive || isOnlyActiveAdmin(userId)) {
      return false
    }

    user.isActive = false

    if (data.value.currentUserId === userId) {
      setFallbackCurrentUser()
    }

    save()

    return true
  }

  const activateUser = (userId: string) => {
    const user = data.value.users.find((item) => item.id === userId)

    if (!user || user.isActive) {
      return false
    }

    user.isActive = true
    save()

    return true
  }

  const reorderUsers = (userIds: string[]) => {
    const userById = new Map(data.value.users.map((user) => [user.id, user]))
    const orderedUsers = userIds
      .map((userId) => userById.get(userId))
      .filter((user): user is User => Boolean(user))
    const missingUsers = data.value.users.filter((user) => !userIds.includes(user.id))

    data.value.users = [...orderedUsers, ...missingUsers].map((user, index) => ({
      ...user,
      sortOrder: index
    }))
    save()
  }

  const createRole = (payload: RolePayload) => {
    const title = payload.title.trim()

    if (!title) {
      return false
    }

    data.value.roles = [
      {
        id: createId(),
        title,
        system: false,
        permissionIds: [...new Set(payload.permissionIds)],
        sortOrder: 0,
        createdAt: new Date().toISOString()
      },
      ...data.value.roles
    ].map((role, index) => ({
      ...role,
      sortOrder: index
    }))
    save()

    return true
  }

  const updateRole = (roleId: string, payload: RolePayload) => {
    const role = data.value.roles.find((item) => item.id === roleId)

    if (!role || role.system) {
      return false
    }

    const title = payload.title.trim()

    if (!title) {
      return false
    }

    role.title = title
    role.permissionIds = [...new Set(payload.permissionIds)]
    save()

    return true
  }

  const deleteRole = (roleId: string) => {
    const role = data.value.roles.find((item) => item.id === roleId)

    if (!role || role.system) {
      return false
    }

    data.value.roles = data.value.roles
      .filter((item) => item.id !== roleId)
      .map((item, index) => ({
        ...item,
        sortOrder: index
      }))
    data.value.users.forEach((user) => {
      user.roleIds = user.roleIds.filter((item) => item !== roleId)
    })
    save()

    return true
  }

  const reorderRoles = (roleIds: string[]) => {
    const roleById = new Map(data.value.roles.map((role) => [role.id, role]))
    const orderedRoles = roleIds
      .map((roleId) => roleById.get(roleId))
      .filter((role): role is Role => Boolean(role))
    const missingRoles = data.value.roles.filter((role) => !roleIds.includes(role.id))

    data.value.roles = [...orderedRoles, ...missingRoles].map((role, index) => ({
      ...role,
      sortOrder: index
    }))
    save()
  }

  const refreshPermissionsForSections = () => {
    data.value.permissions = normalizePermissions(data.value.permissions, data.value.sections)
    const existingPermissionIds = data.value.permissions.map((permission) => permission.id)
    data.value.roles = normalizeRoles(data.value.roles, data.value.permissions)
    data.value.roles.forEach((role) => {
      role.permissionIds = role.permissionIds.filter((permissionId) =>
        existingPermissionIds.includes(permissionId)
      )
    })
  }

  const createSection = (payload: SectionPayload) => {
    const title = payload.title.trim()
    const description = payload.description.trim()

    if (!title) {
      return false
    }

    const section: ProjectSection = {
      id: createId(),
      title,
      slug: createSlug(title),
      description,
      isActive: true,
      sortOrder: data.value.sections.length,
      createdAt: new Date().toISOString()
    }

    data.value.sections = [...data.value.sections, section]
    refreshPermissionsForSections()
    save()

    return true
  }

  const reorderSections = (sectionIds: string[]) => {
    const sectionById = new Map(data.value.sections.map((section) => [section.id, section]))
    const orderedSections = sectionIds
      .map((sectionId) => sectionById.get(sectionId))
      .filter((section): section is ProjectSection => Boolean(section))
    const missingSections = data.value.sections.filter((section) => !sectionIds.includes(section.id))

    data.value.sections = [...orderedSections, ...missingSections].map((section, index) => ({
      ...section,
      sortOrder: index
    }))
    save()
  }

  const updateSection = (sectionId: string, payload: SectionPayload) => {
    const title = payload.title.trim()
    const description = payload.description.trim()
    const section = data.value.sections.find((item) => item.id === sectionId)

    if (!section || !title) {
      return false
    }

    section.title = title
    section.slug = createSlug(title)
    section.description = description
    data.value.permissions = data.value.permissions.map((permission) =>
      permission.id === getSectionPermissionId(section.id) ? createSectionPermission(section) : permission
    )
    save()

    return true
  }

  const deactivateSection = (sectionId: string) => {
    const section = data.value.sections.find((item) => item.id === sectionId)

    if (!section || !section.isActive) {
      return false
    }

    section.isActive = false
    save()

    return true
  }

  const activateSection = (sectionId: string) => {
    const section = data.value.sections.find((item) => item.id === sectionId)

    if (!section || section.isActive) {
      return false
    }

    section.isActive = true
    save()

    return true
  }

  const getSectionDocumentCount = (sectionId: string) =>
    data.value.checklists.filter((checklist) => checklist.sectionIds.includes(sectionId)).length +
    data.value.briefs.filter((brief) => brief.sectionIds.includes(sectionId)).length

  const deleteSection = (sectionId: string) => {
    if (data.value.sections.length <= 1) {
      return false
    }

    const section = data.value.sections.find((item) => item.id === sectionId)

    if (!section || getSectionDocumentCount(sectionId) > 0) {
      return false
    }

    data.value.sections = data.value.sections.filter((item) => item.id !== sectionId)
      .map((item, index) => ({
        ...item,
        sortOrder: index
      }))
    data.value.permissions = data.value.permissions.filter(
      (permission) => permission.id !== getSectionPermissionId(sectionId)
    )
    data.value.roles.forEach((role) => {
      role.permissionIds = role.permissionIds.filter(
        (permissionId) => permissionId !== getSectionPermissionId(sectionId)
      )
    })
    save()

    return true
  }

  const createChecklist = (payload: ChecklistPayload) => {
    const sectionIds = payload.sectionPlacements.map((placement) => placement.sectionId)
    const scope = payload.sectionPlacements.every((placement) => placement.scope === 'common')
      ? 'common'
      : 'project'

    data.value.checklists.forEach((checklist) => {
      checklist.sortOrder += 1
    })

    const checklist: Checklist = {
      id: createId(),
      title: payload.title,
      sectionIds,
      sectionPlacements: payload.sectionPlacements,
      scope,
      projectId: data.value.currentProjectId,
      sortOrder: 0,
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
    addProjectHistory(`Создан чеклист ${checklist.title}`)
    save()
  }

  const updateChecklist = (id: string, payload: ChecklistPayload) => {
    const checklist = data.value.checklists.find((item) => item.id === id)

    if (!checklist) {
      return
    }

    const previousTitle = checklist.title
    const sectionIds = payload.sectionPlacements.map((placement) => placement.sectionId)
    const scope = payload.sectionPlacements.every((placement) => placement.scope === 'common')
      ? 'common'
      : 'project'

    checklist.title = payload.title
    checklist.sectionIds = sectionIds
    checklist.sectionPlacements = payload.sectionPlacements
    checklist.scope = scope
    checklist.projectId = scope === 'project' ? data.value.currentProjectId : checklist.projectId
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
    addProjectHistory(
      previousTitle === checklist.title
        ? `Отредактирован чеклист ${checklist.title}`
        : `Чеклист переименован: ${previousTitle} -> ${checklist.title}`
    )
    save()
  }

  const deleteChecklist = (id: string) => {
    const checklist = data.value.checklists.find((item) => item.id === id)

    if (!checklist) {
      return
    }

    data.value.checklists = data.value.checklists.filter((checklist) => checklist.id !== id)
    addProjectHistory(`Удалён чеклист ${checklist.title}`)
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
    addProjectHistory(`Изменён статус пункта чеклиста ${checklist.title}: ${checklistItem.text}`)
    save()
  }

  const updateChecklistItemComment = (checklistId: string, itemId: string, comment: string) => {
    const checklist = data.value.checklists.find((item) => item.id === checklistId)
    const checklistItem = checklist?.items.find((item) => item.id === itemId)

    if (!checklistItem || checklistItem.status !== 'pending') {
      return
    }

    checklistItem.comment = comment
    addProjectHistory(`Добавлен комментарий к пункту чеклиста ${checklist.title}: ${checklistItem.text}`)
    save()
  }

  const createBrief = (payload: BriefPayload) => {
    const sectionIds = payload.sectionPlacements.map((placement) => placement.sectionId)
    const scope = payload.sectionPlacements.every((placement) => placement.scope === 'common')
      ? 'common'
      : 'project'

    data.value.briefs.forEach((brief) => {
      brief.sortOrder += 1
    })

    const brief: Brief = {
      id: createId(),
      title: payload.title,
      sectionIds,
      sectionPlacements: payload.sectionPlacements,
      scope,
      projectId: data.value.currentProjectId,
      sortOrder: 0,
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
    addProjectHistory(`Создан бриф ${brief.title}`)
    save()
  }

  const updateBrief = (id: string, payload: BriefPayload) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    const previousTitle = brief.title
    const sectionIds = payload.sectionPlacements.map((placement) => placement.sectionId)
    const scope = payload.sectionPlacements.every((placement) => placement.scope === 'common')
      ? 'common'
      : 'project'

    brief.title = payload.title
    brief.sectionIds = sectionIds
    brief.sectionPlacements = payload.sectionPlacements
    brief.scope = scope
    brief.projectId = scope === 'project' ? data.value.currentProjectId : brief.projectId
    brief.questions = payload.questions.map((question, index) => ({
      id: brief.questions[index]?.id ?? createId(),
      text: question.text,
      type: question.type,
      required: question.required,
      description: question.description,
      options: question.options
    }))
    addProjectHistory(
      previousTitle === brief.title
        ? `Отредактирован бриф ${brief.title}`
        : `Бриф переименован: ${previousTitle} -> ${brief.title}`
    )
    save()
  }

  const deleteBrief = (id: string) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    data.value.briefs = data.value.briefs.filter((brief) => brief.id !== id)
    addProjectHistory(`Удалён бриф ${brief.title}`)
    save()
  }

  const updateBriefStatus = (id: string, status: BriefStatus) => {
    const brief = data.value.briefs.find((item) => item.id === id)

    if (!brief) {
      return
    }

    brief.status = status
    addProjectHistory(`Изменён статус брифа ${brief.title}: ${briefStatusLabels[status]}`)
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
    addProjectHistory(`Создана ссылка на бриф ${brief.title}`)
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
    addProjectHistory(`Бриф ${brief.title} согласован клиентом`, brief.projectId)
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
    addProjectHistory(`Бриф ${brief.title} открыт для редакции`)
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
    addProjectHistory(`Бриф ${brief.title} принят в работу`)
    save()
  }

  const updateBriefLinkTitle = (briefId: string, linkId: string, title: string) => {
    const brief = data.value.briefs.find((item) => item.id === briefId)
    const link = brief?.links.find((item) => item.id === linkId)

    if (!link || link.status === 'archived') {
      return
    }

    link.title = title.trim()
    addProjectHistory(`Изменено название ссылки на бриф ${brief.title}`)
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
    addProjectHistory(`Удалён экземпляр ссылки на бриф ${brief.title}`)
    save()
  }

  const getChecklistsBySection = (sectionId: string) =>
    computed(() =>
      data.value.checklists
        .filter((checklist) =>
          checklist.sectionIds.includes(sectionId) &&
          isVisibleInCurrentProjectSection(checklist, sectionId)
        )
        .toSorted((firstChecklist, secondChecklist) =>
          firstChecklist.sortOrder - secondChecklist.sortOrder ||
          new Date(secondChecklist.createdAt).getTime() - new Date(firstChecklist.createdAt).getTime()
        )
    )

  const getBriefsBySection = (sectionId: string) =>
    computed(() =>
      data.value.briefs
        .filter((brief) =>
          brief.sectionIds.includes(sectionId) &&
          isVisibleInCurrentProjectSection(brief, sectionId)
        )
        .toSorted((firstBrief, secondBrief) =>
          firstBrief.sortOrder - secondBrief.sortOrder ||
          new Date(secondBrief.createdAt).getTime() - new Date(firstBrief.createdAt).getTime()
        )
    )

  const currentProjectComments = computed(() =>
    data.value.comments
      .filter((comment) => comment.projectId === data.value.currentProjectId)
      .toSorted((firstComment, secondComment) =>
        new Date(firstComment.createdAt).getTime() - new Date(secondComment.createdAt).getTime()
      )
  )

  const currentProjectHistory = computed(() =>
    data.value.history
      .filter((entry) => entry.projectId === data.value.currentProjectId)
      .toSorted((firstEntry, secondEntry) =>
        new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime()
      )
  )

  const currentUserNotes = computed(() =>
    data.value.notes
      .filter((note) =>
        note.projectId === data.value.currentProjectId &&
        note.authorId === currentUser.value?.id
      )
      .toSorted((firstNote, secondNote) =>
        firstNote.sortOrder - secondNote.sortOrder ||
        new Date(secondNote.createdAt).getTime() - new Date(firstNote.createdAt).getTime()
      )
  )

  const createProjectComment = (text: string) => {
    const normalizedText = text.trim()

    if (!normalizedText) {
      return false
    }

    data.value.comments = [
      {
        id: createId(),
        projectId: data.value.currentProjectId,
        authorId: currentUser.value?.id ?? defaultAdminUserId,
        text: normalizedText,
        createdAt: new Date().toISOString(),
        editedAt: ''
      },
      ...data.value.comments
    ]
    addProjectHistory('Добавлен комментарий к проекту')
    save()

    return true
  }

  const updateProjectComment = (commentId: string, text: string) => {
    const comment = data.value.comments.find((item) => item.id === commentId)
    const normalizedText = text.trim()

    if (
      !comment ||
      !normalizedText ||
      comment.authorId !== currentUser.value?.id ||
      !canUsePermission('edit_comments').value
    ) {
      return false
    }

    comment.text = normalizedText
    comment.editedAt = new Date().toISOString()
    addProjectHistory('Отредактирован комментарий проекта')
    save()

    return true
  }

  const deleteProjectComment = (commentId: string) => {
    const comment = data.value.comments.find((item) => item.id === commentId)

    if (
      !comment ||
      comment.authorId !== currentUser.value?.id ||
      !canUsePermission('delete_comments').value
    ) {
      return false
    }

    data.value.comments = data.value.comments.filter((item) => item.id !== commentId)
    addProjectHistory('Удалён комментарий проекта')
    save()

    return true
  }

  const createProjectNote = (text: string, color = '') => {
    const normalizedText = text.trim()

    if (!normalizedText) {
      return false
    }

    const authorId = currentUser.value?.id ?? defaultAdminUserId
    data.value.notes = data.value.notes.map((note) => (
      note.projectId === data.value.currentProjectId && note.authorId === authorId
        ? { ...note, sortOrder: (note.sortOrder ?? 0) + 1 }
        : note
    ))

    data.value.notes = [
      {
        id: createId(),
        projectId: data.value.currentProjectId,
        authorId,
        text: normalizedText,
        color,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...data.value.notes
    ]
    save()

    return true
  }

  const updateProjectNote = (noteId: string, text: string) => {
    const note = data.value.notes.find((item) =>
      item.id === noteId && item.authorId === currentUser.value?.id
    )
    const normalizedText = text.trim()

    if (!note || !normalizedText) {
      return false
    }

    note.text = normalizedText
    note.updatedAt = new Date().toISOString()
    save()

    return true
  }

  const deleteProjectNote = (noteId: string) => {
    const note = data.value.notes.find((item) =>
      item.id === noteId && item.authorId === currentUser.value?.id
    )

    if (!note) {
      return false
    }

    data.value.notes = data.value.notes.filter((item) => item.id !== noteId)
    save()

    return true
  }

  const reorderProjectNotes = (noteIds: string[]) => {
    const orderedIds = new Set(noteIds)
    const orderedNotes = noteIds
      .map((noteId) => data.value.notes.find((note) =>
        note.id === noteId &&
        note.projectId === data.value.currentProjectId &&
        note.authorId === currentUser.value?.id
      ))
      .filter(Boolean) as ProjectNote[]
    const nextOrder = new Map(orderedNotes.map((note, index) => [note.id, index]))

    data.value.notes = data.value.notes.map((note) =>
      orderedIds.has(note.id) && nextOrder.has(note.id)
        ? { ...note, sortOrder: nextOrder.get(note.id) ?? note.sortOrder }
        : note
    )
    save()
  }

  const reorderChecklists = (checklistIds: string[]) => {
    const orderedIds = new Set(checklistIds)
    const orderedChecklists = checklistIds
      .map((checklistId) => data.value.checklists.find((checklist) => checklist.id === checklistId))
      .filter(Boolean) as Checklist[]
    const restChecklists = data.value.checklists.filter((checklist) => !orderedIds.has(checklist.id))

    data.value.checklists = [...orderedChecklists, ...restChecklists].map((checklist, index) => ({
      ...checklist,
      sortOrder: index
    }))
    save()
  }

  const reorderBriefs = (briefIds: string[]) => {
    const orderedIds = new Set(briefIds)
    const orderedBriefs = briefIds
      .map((briefId) => data.value.briefs.find((brief) => brief.id === briefId))
      .filter(Boolean) as Brief[]
    const restBriefs = data.value.briefs.filter((brief) => !orderedIds.has(brief.id))

    data.value.briefs = [...orderedBriefs, ...restBriefs].map((brief, index) => ({
      ...brief,
      sortOrder: index
    }))
    save()
  }

  const reorderWorkspaceBlocks = (blockIds: string[]) => {
    const supportedBlockIds = ['checklists', 'briefs']
    const orderedBlockIds = blockIds.filter((blockId) => supportedBlockIds.includes(blockId))
    const missingBlockIds = supportedBlockIds.filter((blockId) => !orderedBlockIds.includes(blockId))

    data.value.workspaceBlockOrder = [...orderedBlockIds, ...missingBlockIds]
    save()
  }

  const reorderProjectFeedBlocks = (blockIds: string[]) => {
    const supportedBlockIds = ['comments', 'notes', 'history']
    const orderedBlockIds = blockIds.filter((blockId) => supportedBlockIds.includes(blockId))
    const missingBlockIds = supportedBlockIds.filter((blockId) => !orderedBlockIds.includes(blockId))

    data.value.projectFeedBlockOrder = [...orderedBlockIds, ...missingBlockIds]
    save()
  }

  return {
    data,
    getSectionPermissionId,
    briefQuestionTypes,
    briefQuestionTypeLabels,
    briefStatusLabels,
    briefLinkStatusLabels,
    currentProject,
    currentUser,
    currentUserRoles,
    isCurrentUserAdmin,
    visibleProjects,
    currentProjectComments,
    currentProjectHistory,
    currentUserNotes,
    isLoaded,
    load,
    canUsePermission,
    getUserById,
    getUserNameById,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    isOnlyActiveAdmin,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    reorderUsers,
    createSection,
    updateSection,
    deleteSection,
    deactivateSection,
    activateSection,
    getSectionDocumentCount,
    reorderSections,
    createRole,
    updateRole,
    deleteRole,
    reorderRoles,
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
    createProjectComment,
    updateProjectComment,
    deleteProjectComment,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote,
    reorderProjectNotes,
    reorderWorkspaceBlocks,
    reorderProjectFeedBlocks,
    reorderChecklists,
    reorderBriefs,
    getChecklistsBySection,
    getBriefsBySection
  }
}
