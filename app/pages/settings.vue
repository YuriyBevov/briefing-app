<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { SystemPermissionId } from '~/composables/useProjectStore'
import SettingsModal from '~/components/settings/SettingsModal.vue'

const {
  activateUser,
  activateSection,
  createProject,
  createSection,
  createRole,
  createUser,
  data,
  deactivateUser,
  deactivateSection,
  deleteProject,
  deleteSection,
  deleteRole,
  deleteUser,
  getSectionDocumentCount,
  isOnlyActiveAdmin,
  reorderProjects,
  reorderRoles,
  reorderSections,
  reorderUsers,
  updateProject,
  updateRole,
  updateSection,
  updateUser,
  canUsePermission
} = useProjectStore()

type SettingsBlockId = 'sections' | 'projects' | 'users' | 'roles'

const settingsBlocks: Array<{
  id: SettingsBlockId
  title: string
  createLabel: string
}> = [
  { id: 'sections', title: 'Разделы', createLabel: 'Создать' },
  { id: 'projects', title: 'Проекты', createLabel: 'Создать' },
  { id: 'users', title: 'Пользователи', createLabel: 'Создать' },
  { id: 'roles', title: 'Роли и права', createLabel: 'Создать' }
]

const settingsBlockOrderStorageKey = 'brief-os-settings-block-order'
const getDefaultSettingsBlockOrder = () => settingsBlocks.map((block) => block.id)
const normalizeSettingsBlockOrder = (blockIds: string[]) => {
  const availableBlockIds = getDefaultSettingsBlockOrder()
  const knownBlockIds = blockIds.filter((blockId): blockId is SettingsBlockId =>
    availableBlockIds.includes(blockId as SettingsBlockId)
  )
  const missingBlockIds = availableBlockIds.filter((blockId) => !knownBlockIds.includes(blockId))

  return [...knownBlockIds, ...missingBlockIds]
}
const settingsBlockOrderCookie = useCookie<SettingsBlockId[]>(settingsBlockOrderStorageKey, {
  default: getDefaultSettingsBlockOrder,
  sameSite: 'lax'
})

const createUserForm = () => ({
  id: '',
  name: '',
  login: '',
  email: '',
  password: '',
  roleIds: [] as string[],
  projectIds: [] as string[],
  isActive: true
})

const createRoleForm = () => ({
  id: '',
  title: '',
  permissionIds: [] as SystemPermissionId[]
})

const createProjectForm = () => ({
  id: '',
  title: '',
  userIds: [] as string[]
})

const createSectionForm = () => ({
  id: '',
  title: '',
  description: ''
})

const userForm = reactive(createUserForm())
const roleForm = reactive(createRoleForm())
const projectForm = reactive(createProjectForm())
const sectionForm = reactive(createSectionForm())
const userMessage = ref('')
const roleMessage = ref('')
const projectMessage = ref('')
const sectionMessage = ref('')
const isUserModalOpen = ref(false)
const isRoleModalOpen = ref(false)
const isProjectModalOpen = ref(false)
const isSectionModalOpen = ref(false)
const deletingUserId = ref('')
const deactivatingUserId = ref('')
const deletingRoleId = ref('')
const deletingProjectId = ref('')
const deletingSectionId = ref('')
const blockedSectionId = ref('')
const settingsBlockOrder = ref<SettingsBlockId[]>(
  normalizeSettingsBlockOrder(settingsBlockOrderCookie.value ?? getDefaultSettingsBlockOrder())
)
const collapsedSettingsBlocks = ref<SettingsBlockId[]>(settingsBlocks.map((block) => block.id))

const isEditingUser = computed(() => Boolean(userForm.id))
const isEditingRole = computed(() => Boolean(roleForm.id))
const isEditingProject = computed(() => Boolean(projectForm.id))
const isEditingSection = computed(() => Boolean(sectionForm.id))
const adminRole = computed(() => data.value.roles.find((role) => role.id === 'role-admin'))
const activeUsers = computed(() => data.value.users.filter((user) => user.isActive))
const canViewSettings = canUsePermission('view_settings')
const permissionGroups: Array<{
  title: string
  permissionIds: SystemPermissionId[]
}> = [
  {
    title: 'Брифы',
    permissionIds: [
      'create_briefs',
      'edit_briefs',
      'delete_briefs',
      'create_brief_links',
      'reopen_brief_links'
    ]
  },
  {
    title: 'Чеклисты',
    permissionIds: ['create_checklists', 'edit_checklists', 'delete_checklists']
  },
  {
    title: 'Разделы',
    permissionIds: ['create_sections', 'edit_sections', 'delete_sections']
  },
  {
    title: 'Разделы и блоки приложения',
    permissionIds: ['view_ui_components', 'view_settings']
  },
  {
    title: 'Проекты',
    permissionIds: ['create_projects', 'edit_projects', 'delete_projects']
  }
]

const resetUserForm = () => {
  Object.assign(userForm, createUserForm())
  userMessage.value = ''
}

const openCreateUserModal = () => {
  resetUserForm()
  isUserModalOpen.value = true
}

const closeUserModal = () => {
  isUserModalOpen.value = false
  resetUserForm()
}

const closeDeleteUserModal = () => {
  deletingUserId.value = ''
}

const closeDeactivateUserModal = () => {
  deactivatingUserId.value = ''
}

const resetRoleForm = () => {
  Object.assign(roleForm, createRoleForm())
  roleMessage.value = ''
}

const openCreateRoleModal = () => {
  resetRoleForm()
  isRoleModalOpen.value = true
}

const closeRoleModal = () => {
  isRoleModalOpen.value = false
  resetRoleForm()
}

const closeDeleteRoleModal = () => {
  deletingRoleId.value = ''
}

const resetProjectForm = () => {
  Object.assign(projectForm, createProjectForm())
  projectMessage.value = ''
}

const openCreateProjectModal = () => {
  resetProjectForm()
  projectForm.userIds = data.value.users
    .filter((user) => user.isActive && isAdminUser(user.roleIds))
    .map((user) => user.id)
  isProjectModalOpen.value = true
}

const closeProjectModal = () => {
  isProjectModalOpen.value = false
  resetProjectForm()
}

const closeDeleteProjectModal = () => {
  deletingProjectId.value = ''
}

const resetSectionForm = () => {
  Object.assign(sectionForm, createSectionForm())
  sectionMessage.value = ''
}

const openCreateSectionModal = () => {
  resetSectionForm()
  isSectionModalOpen.value = true
}

const closeSectionModal = () => {
  isSectionModalOpen.value = false
  resetSectionForm()
}

const closeDeleteSectionModal = () => {
  deletingSectionId.value = ''
}

const closeBlockedSectionModal = () => {
  blockedSectionId.value = ''
}

const editUser = (userId: string) => {
  const user = data.value.users.find((item) => item.id === userId)

  if (!user) {
    return
  }

  Object.assign(userForm, {
    id: user.id,
    name: user.name,
    login: user.login,
    email: user.email,
    password: user.password,
    roleIds: [...user.roleIds],
    projectIds: [...user.projectIds],
    isActive: user.isActive
  })
  userMessage.value = ''
  isUserModalOpen.value = true
}

const editRole = (roleId: string) => {
  const role = data.value.roles.find((item) => item.id === roleId)

  if (!role || role.system) {
    return
  }

  Object.assign(roleForm, {
    id: role.id,
    title: role.title,
    permissionIds: [...role.permissionIds]
  })
  roleMessage.value = ''
  isRoleModalOpen.value = true
}

const editProject = (projectId: string) => {
  const project = data.value.projects.find((item) => item.id === projectId)

  if (!project) {
    return
  }

  Object.assign(projectForm, {
    id: project.id,
    title: project.title,
    userIds: data.value.users
      .filter((user) => user.isActive && user.projectIds.includes(project.id))
      .map((user) => user.id)
  })
  projectMessage.value = ''
  isProjectModalOpen.value = true
}

const editSection = (sectionId: string) => {
  const section = data.value.sections.find((item) => item.id === sectionId)

  if (!section) {
    return
  }

  Object.assign(sectionForm, {
    id: section.id,
    title: section.title,
    description: section.description
  })
  sectionMessage.value = ''
  isSectionModalOpen.value = true
}

const submitUser = () => {
  const payload = {
    name: userForm.name,
    login: userForm.login,
    email: userForm.email,
    password: userForm.password,
    roleIds: userForm.roleIds,
    projectIds: userForm.projectIds,
    isActive: userForm.isActive
  }
  const isSaved = userForm.id ? updateUser(userForm.id, payload) : createUser(payload)

  userMessage.value = isSaved
    ? 'Пользователь сохранён'
    : 'Пользователь не сохранён: проверьте обязательные поля, уникальность логина и правило последнего администратора.'

  if (isSaved) {
    closeUserModal()
  }
}

const submitRole = () => {
  const payload = {
    title: roleForm.title,
    permissionIds: roleForm.permissionIds
  }
  const isSaved = roleForm.id ? updateRole(roleForm.id, payload) : createRole(payload)

  roleMessage.value = isSaved
    ? 'Роль сохранена'
    : 'Роль не сохранена: системную роль редактировать нельзя, название обязательно.'

  if (isSaved) {
    closeRoleModal()
  }
}

const submitProject = () => {
  const payload = {
    title: projectForm.title,
    userIds: projectForm.userIds
  }
  const isSaved = projectForm.id ? updateProject(projectForm.id, payload) : createProject(payload)

  projectMessage.value = isSaved
    ? 'Проект сохранён'
    : 'Проект не сохранён: название обязательно.'

  if (isSaved) {
    closeProjectModal()
  }
}

const submitSection = () => {
  const payload = {
    title: sectionForm.title,
    description: sectionForm.description
  }
  const isSaved = sectionForm.id ? updateSection(sectionForm.id, payload) : createSection(payload)

  sectionMessage.value = isSaved
    ? 'Раздел сохранён'
    : 'Раздел не сохранён: название обязательно.'

  if (isSaved) {
    closeSectionModal()
  }
}

const requestRemoveUser = (userId: string) => {
  deletingUserId.value = userId
}

const requestDeactivateUser = (userId: string) => {
  deactivatingUserId.value = userId
}

const enableUser = (userId: string) => {
  userMessage.value = activateUser(userId)
    ? 'Пользователь активирован'
    : 'Пользователь не активирован.'
}

const confirmRemoveUser = () => {
  if (!deletingUserId.value) {
    return
  }

  userMessage.value = deleteUser(deletingUserId.value)
    ? 'Пользователь удалён'
    : 'Пользователь не удалён: нельзя удалить единственного активного администратора.'
  closeDeleteUserModal()
}

const deletingUser = computed(() =>
  data.value.users.find((user) => user.id === deletingUserId.value)
)

const deactivatingUser = computed(() =>
  data.value.users.find((user) => user.id === deactivatingUserId.value)
)

const confirmDeactivateUser = () => {
  if (!deactivatingUserId.value) {
    return
  }

  userMessage.value = deactivateUser(deactivatingUserId.value)
    ? 'Пользователь деактивирован'
    : 'Пользователь не деактивирован: нельзя отключить единственного активного администратора.'
  closeDeactivateUserModal()
}

const requestRemoveRole = (roleId: string) => {
  deletingRoleId.value = roleId
}

const requestRemoveProject = (projectId: string) => {
  deletingProjectId.value = projectId
}

const requestRemoveSection = (sectionId: string) => {
  if (getSectionDocumentCount(sectionId) > 0) {
    blockedSectionId.value = sectionId
    return
  }

  deletingSectionId.value = sectionId
}

const enableSection = (sectionId: string) => {
  sectionMessage.value = activateSection(sectionId)
    ? 'Раздел активирован'
    : 'Раздел не активирован.'
}

const disableSection = (sectionId: string) => {
  sectionMessage.value = deactivateSection(sectionId)
    ? 'Раздел деактивирован'
    : 'Раздел не деактивирован.'
}

const deletingRole = computed(() =>
  data.value.roles.find((role) => role.id === deletingRoleId.value)
)

const deletingProject = computed(() =>
  data.value.projects.find((project) => project.id === deletingProjectId.value)
)

const deletingSection = computed(() =>
  data.value.sections.find((section) => section.id === deletingSectionId.value)
)

const blockedSection = computed(() =>
  data.value.sections.find((section) => section.id === blockedSectionId.value)
)

const confirmRemoveRole = () => {
  if (!deletingRoleId.value) {
    return
  }

  roleMessage.value = deleteRole(deletingRoleId.value)
    ? 'Роль удалена'
    : 'Роль не удалена: системную роль удалить нельзя.'
  closeDeleteRoleModal()
}

const confirmRemoveProject = () => {
  if (!deletingProjectId.value) {
    return
  }

  projectMessage.value = deleteProject(deletingProjectId.value)
    ? 'Проект удалён'
    : 'Проект не удалён: должен остаться хотя бы один проект.'
  closeDeleteProjectModal()
}

const confirmRemoveSection = () => {
  if (!deletingSectionId.value) {
    return
  }

  const sectionId = deletingSectionId.value
  sectionMessage.value = deleteSection(sectionId)
    ? 'Раздел удалён'
    : getSectionDocumentCount(sectionId) > 0
      ? 'Раздел не удалён: в разделе есть активные документы.'
      : 'Раздел не удалён: должен остаться хотя бы один раздел.'
  closeDeleteSectionModal()
}

const getRolePermissionTitles = (permissionIds: SystemPermissionId[]) =>
  permissionIds
    .map((permissionId) => data.value.permissions.find((permission) => permission.id === permissionId)?.title)
    .filter((title): title is string => Boolean(title))

const getVisibleRolePermissions = (permissionIds: SystemPermissionId[]) =>
  getRolePermissionTitles(permissionIds).slice(0, 3)

const getHiddenRolePermissionCount = (permissionIds: SystemPermissionId[]) =>
  Math.max(getRolePermissionTitles(permissionIds).length - 3, 0)

const getPermissionById = (permissionId: SystemPermissionId) =>
  data.value.permissions.find((permission) => permission.id === permissionId)

const getUserRoleTitle = (roleIds: string[]) =>
  roleIds
    .map((roleId) => data.value.roles.find((role) => role.id === roleId)?.title)
    .filter(Boolean)
    .join(', ') || 'Без роли'

const isAdminUser = (roleIds: string[]) => roleIds.includes(adminRole.value?.id ?? '')

const hasAllPermissions = (permissionIds: SystemPermissionId[]) =>
  data.value.permissions.every((permission) => permissionIds.includes(permission.id))

const sectionPermissionGroup = computed(() => ({
  title: 'Доступ к разделам',
  permissionIds: data.value.sections.map((section) => `view_section_${section.id}`)
}))

const allPermissionGroups = computed(() => [...permissionGroups, sectionPermissionGroup.value])

watch(settingsBlockOrder, (blockOrder) => {
  settingsBlockOrderCookie.value = blockOrder
}, { deep: true })

const orderedSettingsBlocks = computed({
  get: () => settingsBlockOrder.value
    .map((blockId) => settingsBlocks.find((block) => block.id === blockId))
    .filter((block): block is (typeof settingsBlocks)[number] => Boolean(block)),
  set: (blocks) => {
    settingsBlockOrder.value = blocks.map((block) => block.id)
  }
})

const isSettingsBlockCollapsed = (blockId: SettingsBlockId) =>
  collapsedSettingsBlocks.value.includes(blockId)

const toggleSettingsBlock = (blockId: SettingsBlockId) => {
  collapsedSettingsBlocks.value = isSettingsBlockCollapsed(blockId)
    ? collapsedSettingsBlocks.value.filter((item) => item !== blockId)
    : [...collapsedSettingsBlocks.value, blockId]
}

const openCreateModalByBlock = (blockId: SettingsBlockId) => {
  if (blockId === 'sections') {
    openCreateSectionModal()
    return
  }

  if (blockId === 'projects') {
    openCreateProjectModal()
    return
  }

  if (blockId === 'users') {
    openCreateUserModal()
    return
  }

  openCreateRoleModal()
}

const orderedSections = computed({
  get: () => data.value.sections,
  set: (sections) => {
    reorderSections(sections.map((section) => section.id))
  }
})

const orderedUsers = computed({
  get: () => data.value.users,
  set: (users) => {
    reorderUsers(users.map((user) => user.id))
  }
})

const orderedRoles = computed({
  get: () => data.value.roles,
  set: (roles) => {
    reorderRoles(roles.map((role) => role.id))
  }
})

const orderedProjects = computed({
  get: () => data.value.projects,
  set: (projects) => {
    reorderProjects(projects.map((project) => project.id))
  }
})
</script>

<template>
  <section v-if="canViewSettings" class="settings-page">
    <div class="section-header settings-page__header">
      <div>
        <h1 class="page-title">Настройки</h1>
        <p class="settings-page__lead">Разделы, пользователи, роли, права и доступ к проектам.</p>
      </div>
    </div>

    <VueDraggable
      v-model="orderedSettingsBlocks"
      class="settings-block-list"
      handle=".settings-section__drag"
      :animation="180"
    >
      <section
        v-for="block in orderedSettingsBlocks"
        :key="block.id"
        class="workspace-panel settings-section"
        :class="{ 'settings-section--collapsed': isSettingsBlockCollapsed(block.id) }"
      >
        <div class="settings-section__header">
          <button
            class="settings-section__drag"
            type="button"
            aria-label="Перетащить блок"
            title="Перетащить блок"
          >
            <BaseIcon class="settings-section__drag-icon" name="drag-handle" />
          </button>
          <h2 class="section-title">{{ block.title }}</h2>
          <div class="button-row settings-section__actions">
            <button class="button button--secondary" type="button" @click="openCreateModalByBlock(block.id)">
              {{ block.createLabel }}
            </button>
            <button
              class="button button--secondary button--small brief-card__icon-button settings-section__toggle"
              type="button"
              :aria-label="isSettingsBlockCollapsed(block.id) ? 'Развернуть блок' : 'Свернуть блок'"
              :title="isSettingsBlockCollapsed(block.id) ? 'Развернуть блок' : 'Свернуть блок'"
              @click="toggleSettingsBlock(block.id)"
            >
              <BaseIcon class="settings-section__toggle-icon" name="chevron-down" />
            </button>
          </div>
        </div>

        <VueDraggable
          v-if="block.id === 'sections' && !isSettingsBlockCollapsed(block.id)"
          v-model="orderedSections"
          class="settings-list"
          handle=".settings-card__drag"
          :animation="180"
        >
          <article v-for="section in orderedSections" :key="section.id" class="settings-card">
            <button class="settings-card__drag" type="button" aria-label="Перетащить" title="Перетащить">
              <BaseIcon class="settings-card__drag-icon" name="drag-handle" />
            </button>
            <div class="settings-card__body settings-card__body--wide">
              <div class="settings-card__headline">
                <div class="settings-card__content">
                  <strong>{{ section.title }}</strong>
                  <span v-if="section.description">{{ section.description }}</span>
                </div>
                <div class="settings-card__headline-actions">
                  <span
                    class="settings-card__status"
                    :class="section.isActive ? 'settings-card__status--active' : 'settings-card__status--blocked'"
                  >
                    {{ section.isActive ? 'Активен' : 'Отключён' }}
                  </span>
                  <div class="button-row settings-card__actions">
                    <BaseIconButton label="Изменить раздел" icon="edit" @click="editSection(section.id)" />
                    <BaseIconButton
                      v-if="section.isActive"
                      label="Деактивировать раздел"
                      icon="lock"
                      @click="disableSection(section.id)"
                    />
                    <BaseIconButton
                      v-else
                      label="Активировать раздел"
                      icon="unlock"
                      @click="enableSection(section.id)"
                    />
                    <BaseIconButton
                      label="Удалить раздел"
                      icon="trash"
                      :disabled="data.sections.length <= 1"
                      @click="requestRemoveSection(section.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </VueDraggable>

        <VueDraggable
          v-else-if="block.id === 'projects' && !isSettingsBlockCollapsed(block.id)"
          v-model="orderedProjects"
          class="settings-list"
          handle=".settings-card__drag"
          :animation="180"
        >
          <article v-for="project in orderedProjects" :key="project.id" class="settings-card">
            <button class="settings-card__drag" type="button" aria-label="Перетащить" title="Перетащить">
              <BaseIcon class="settings-card__drag-icon" name="drag-handle" />
            </button>
            <div class="settings-card__body settings-card__body--wide">
              <div class="settings-card__headline">
                <div class="settings-card__content">
                  <strong>{{ project.title }}</strong>
                </div>
                <div class="button-row settings-card__actions">
                  <BaseIconButton label="Изменить проект" icon="edit" @click="editProject(project.id)" />
                  <BaseIconButton
                    label="Удалить проект"
                    icon="trash"
                    :disabled="data.projects.length <= 1"
                    @click="requestRemoveProject(project.id)"
                  />
                </div>
              </div>
            </div>
          </article>
        </VueDraggable>

        <VueDraggable
          v-else-if="block.id === 'users' && !isSettingsBlockCollapsed(block.id)"
          v-model="orderedUsers"
          class="settings-list"
          handle=".settings-card__drag"
          :animation="180"
        >
          <article v-for="user in orderedUsers" :key="user.id" class="settings-card">
            <button class="settings-card__drag" type="button" aria-label="Перетащить" title="Перетащить">
              <BaseIcon class="settings-card__drag-icon" name="drag-handle" />
            </button>
            <div class="settings-card__body settings-card__body--wide">
              <div class="settings-card__headline">
                <div class="settings-card__content">
                  <strong>{{ user.name }}</strong>
                  <span>{{ getUserRoleTitle(user.roleIds) }}</span>
                </div>
                <div class="settings-card__headline-actions">
                  <span
                    class="settings-card__status"
                    :class="user.isActive ? 'settings-card__status--active' : 'settings-card__status--blocked'"
                  >
                    {{ user.isActive ? 'Активен' : 'Заблокирован' }}
                  </span>
                  <div class="button-row settings-card__actions">
                    <BaseIconButton label="Изменить пользователя" icon="edit" @click="editUser(user.id)" />
                    <BaseIconButton
                      v-if="user.isActive"
                      label="Деактивировать пользователя"
                      icon="lock"
                      :disabled="isOnlyActiveAdmin(user.id)"
                      @click="requestDeactivateUser(user.id)"
                    />
                    <BaseIconButton
                      v-else
                      label="Активировать пользователя"
                      icon="unlock"
                      @click="enableUser(user.id)"
                    />
                    <BaseIconButton
                      label="Удалить пользователя"
                      icon="trash"
                      :disabled="user.isActive && isOnlyActiveAdmin(user.id)"
                      @click="requestRemoveUser(user.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </VueDraggable>

        <VueDraggable
          v-else-if="block.id === 'roles' && !isSettingsBlockCollapsed(block.id)"
          v-model="orderedRoles"
          class="settings-list"
          handle=".settings-card__drag"
          :animation="180"
        >
          <article v-for="role in orderedRoles" :key="role.id" class="settings-card">
            <button class="settings-card__drag" type="button" aria-label="Перетащить" title="Перетащить">
              <BaseIcon class="settings-card__drag-icon" name="drag-handle" />
            </button>
            <div class="settings-card__body">
              <strong>{{ role.title }}</strong>
              <span v-if="hasAllPermissions(role.permissionIds)">Полный доступ</span>
              <div v-else-if="getVisibleRolePermissions(role.permissionIds).length" class="settings-card__badges">
                <span
                  v-for="permissionTitle in getVisibleRolePermissions(role.permissionIds)"
                  :key="permissionTitle"
                  class="settings-card__badge"
                >
                  {{ permissionTitle }}
                </span>
                <span
                  v-if="getHiddenRolePermissionCount(role.permissionIds)"
                  class="settings-card__badge settings-card__badge--success"
                >
                  + еще {{ getHiddenRolePermissionCount(role.permissionIds) }}
                </span>
              </div>
              <span v-else>Права пока не назначены</span>
            </div>
            <div class="button-row settings-card__actions">
              <BaseIconButton
                label="Изменить роль"
                icon="edit"
                :disabled="role.system"
                @click="editRole(role.id)"
              />
              <BaseIconButton
                label="Удалить роль"
                icon="trash"
                :disabled="role.system"
                @click="requestRemoveRole(role.id)"
              />
            </div>
          </article>
        </VueDraggable>
      </section>
    </VueDraggable>

    <SettingsModal
      v-if="isSectionModalOpen"
      :title="isEditingSection ? 'Изменить раздел' : 'Создать раздел'"
      @close="closeSectionModal"
    >
      <form class="settings-form" @submit.prevent="submitSection">
        <label class="field">
          <span class="field__label">Название раздела</span>
          <input v-model="sectionForm.title" class="field__control" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">Описание</span>
          <textarea v-model="sectionForm.description" class="field__control" rows="4" />
        </label>

        <div class="button-row">
          <button class="button button--primary" type="submit">
            {{ isEditingSection ? 'Сохранить раздел' : 'Создать раздел' }}
          </button>
          <button class="button button--secondary" type="button" @click="closeSectionModal">
            Отменить
          </button>
        </div>
      </form>
    </SettingsModal>

    <SettingsModal v-if="deletingSection" title="Удалить раздел?" @close="closeDeleteSectionModal">
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          Раздел {{ deletingSection.title }} будет удалён. Это действие нельзя отменить.
        </p>

        <div class="button-row">
          <button class="button button--danger" type="button" @click="confirmRemoveSection">
            Удалить
          </button>
          <button class="button button--secondary" type="button" @click="closeDeleteSectionModal">
            Отменить
          </button>
        </div>
      </div>
    </SettingsModal>

    <SettingsModal v-if="blockedSection" title="Раздел нельзя удалить" @close="closeBlockedSectionModal">
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          В разделе {{ blockedSection.title }} есть активные документы:
          {{ getSectionDocumentCount(blockedSection.id) }}. Сначала перенесите или удалите связанные материалы.
        </p>

        <div class="button-row">
          <button class="button button--primary" type="button" @click="closeBlockedSectionModal">
            Понятно
          </button>
        </div>
      </div>
    </SettingsModal>

    <SettingsModal
      v-if="isProjectModalOpen"
      :title="isEditingProject ? 'Изменить проект' : 'Создать проект'"
      @close="closeProjectModal"
    >
      <form class="settings-form" @submit.prevent="submitProject">
        <label class="field">
          <span class="field__label">Название проекта</span>
          <input v-model="projectForm.title" class="field__control" type="text" required />
        </label>

        <div class="settings-form__group">
          <span class="field__label">Участники проекта</span>
          <div class="settings-form__choice-list">
            <label v-for="user in activeUsers" :key="user.id" class="switch-field">
              <input
                v-model="projectForm.userIds"
                class="switch-field__control"
                type="checkbox"
                :value="user.id"
                :disabled="isAdminUser(user.roleIds)"
              />
              <span class="switch-field__label">{{ user.name }}</span>
            </label>
          </div>
        </div>

        <div class="button-row">
          <button class="button button--primary" type="submit">
            {{ isEditingProject ? 'Сохранить проект' : 'Создать проект' }}
          </button>
          <button class="button button--secondary" type="button" @click="closeProjectModal">
            Отменить
          </button>
        </div>
      </form>
    </SettingsModal>

    <SettingsModal v-if="deletingProject" title="Удалить проект?" @close="closeDeleteProjectModal">
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          Проект {{ deletingProject.title }} будет удалён. Проектные брифы и чеклисты этого проекта также будут удалены.
        </p>

        <div class="button-row">
          <button class="button button--danger" type="button" @click="confirmRemoveProject">
            Удалить
          </button>
          <button class="button button--secondary" type="button" @click="closeDeleteProjectModal">
            Отменить
          </button>
        </div>
      </div>
    </SettingsModal>

    <SettingsModal
      v-if="isUserModalOpen"
      :title="isEditingUser ? 'Изменить пользователя' : 'Создать пользователя'"
      @close="closeUserModal"
    >
      <form class="settings-form" @submit.prevent="submitUser">
        <label class="field">
          <span class="field__label">Имя</span>
          <input v-model="userForm.name" class="field__control" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">Логин</span>
          <input v-model="userForm.login" class="field__control" type="text" required />
        </label>

        <label class="field">
          <span class="field__label">E-mail</span>
          <input v-model="userForm.email" class="field__control" type="email" />
        </label>

        <label class="field">
          <span class="field__label">Пароль</span>
          <input v-model="userForm.password" class="field__control" type="text" required />
        </label>

        <div class="settings-form__group">
          <span class="field__label">Роли пользователя</span>
          <div class="settings-form__choice-list">
            <label v-for="role in data.roles" :key="role.id" class="switch-field">
              <input
                v-model="userForm.roleIds"
                class="switch-field__control"
                type="checkbox"
                :value="role.id"
                :disabled="role.id === adminRole?.id && Boolean(userForm.id) && isOnlyActiveAdmin(userForm.id)"
              />
              <span class="switch-field__label">{{ role.title }}</span>
            </label>
          </div>
        </div>

        <div class="settings-form__group">
          <span class="field__label">Доступ к проектам</span>
          <div class="settings-form__choice-list">
            <label v-for="project in data.projects" :key="project.id" class="switch-field">
              <input
                v-model="userForm.projectIds"
                class="switch-field__control"
                type="checkbox"
                :value="project.id"
                :disabled="userForm.roleIds.includes(adminRole?.id ?? '')"
              />
              <span class="switch-field__label">{{ project.title }}</span>
            </label>
          </div>
        </div>

        <div class="button-row">
          <button class="button button--primary" type="submit">
            {{ isEditingUser ? 'Сохранить пользователя' : 'Создать пользователя' }}
          </button>
          <button class="button button--secondary" type="button" @click="closeUserModal">
            Отменить
          </button>
        </div>

      </form>
    </SettingsModal>

    <SettingsModal v-if="deletingUser" title="Удалить пользователя?" @close="closeDeleteUserModal">
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          Пользователь {{ deletingUser.name }} будет удалён из системы навсегда. Это действие нельзя отменить.
        </p>

        <div class="button-row">
          <button class="button button--danger" type="button" @click="confirmRemoveUser">
            Удалить
          </button>
          <button class="button button--secondary" type="button" @click="closeDeleteUserModal">
            Отменить
          </button>
        </div>
      </div>
    </SettingsModal>

    <SettingsModal
      v-if="deactivatingUser"
      title="Деактивировать пользователя?"
      @close="closeDeactivateUserModal"
    >
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          Пользователь {{ deactivatingUser.name }} будет временно отключён от системы. Доступ будет запрещён до повторной активации.
        </p>

        <div class="button-row">
          <button class="button button--primary" type="button" @click="confirmDeactivateUser">
            Деактивировать
          </button>
          <button class="button button--secondary" type="button" @click="closeDeactivateUserModal">
            Отменить
          </button>
        </div>
      </div>
    </SettingsModal>

    <SettingsModal
      v-if="isRoleModalOpen"
      :title="isEditingRole ? 'Изменить роль' : 'Создать роль'"
      @close="closeRoleModal"
    >
      <form class="settings-form" @submit.prevent="submitRole">
        <label class="field">
          <span class="field__label">Название роли</span>
          <input v-model="roleForm.title" class="field__control" type="text" required />
        </label>

        <div class="settings-form__group">
          <span class="field__label">Права</span>
          <div class="settings-permission-groups">
            <fieldset
              v-for="group in allPermissionGroups"
              :key="group.title"
              class="settings-permission-group"
            >
              <legend class="settings-permission-group__title">{{ group.title }}</legend>
              <label
                v-for="permissionId in group.permissionIds"
                :key="permissionId"
                class="switch-field"
              >
                <input
                  v-model="roleForm.permissionIds"
                  class="switch-field__control"
                  type="checkbox"
                  :value="permissionId"
                />
                <span class="switch-field__label">{{ getPermissionById(permissionId)?.title }}</span>
              </label>
            </fieldset>
          </div>
        </div>

        <div class="button-row">
          <button class="button button--primary" type="submit">
            {{ isEditingRole ? 'Сохранить роль' : 'Создать роль' }}
          </button>
          <button class="button button--secondary" type="button" @click="closeRoleModal">
            Отменить
          </button>
        </div>

      </form>
    </SettingsModal>

    <SettingsModal v-if="deletingRole" title="Удалить роль?" @close="closeDeleteRoleModal">
      <div class="settings-confirm">
        <p class="settings-confirm__text">
          Роль {{ deletingRole.title }} будет удалена из системы. Она также будет снята со всех пользователей.
        </p>

        <div class="button-row">
          <button class="button button--danger" type="button" @click="confirmRemoveRole">
            Удалить
          </button>
          <button class="button button--secondary" type="button" @click="closeDeleteRoleModal">
            Отменить
          </button>
        </div>
      </div>
    </SettingsModal>
  </section>

  <section v-else class="stage-page">
    <div class="section-header stage-page__header">
      <h1 class="page-title">Настройки</h1>
    </div>

    <section class="workspace-panel">
      <p class="card-description">У вас нет прав на просмотр этого раздела.</p>
    </section>
  </section>
</template>
